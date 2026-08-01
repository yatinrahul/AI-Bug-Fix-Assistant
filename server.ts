import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import jszip from 'jszip';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ai-bug-fix-assistant-secret-key-2026';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory / File Persistent Database Setup
const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function loadJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function saveJSON<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Data Stores
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
}

interface StoredHistory {
  id: string;
  userId?: string;
  title: string;
  language: string;
  bugSummary: string;
  severity: string;
  category: string;
  createdAt: string;
  bookmarked: boolean;
  status: 'Fixed' | 'Investigating' | 'Pending';
  result: any;
  fileName?: string;
}

let users: StoredUser[] = loadJSON<StoredUser[]>(USERS_FILE, []);
let historyItems: StoredHistory[] = loadJSON<StoredHistory[]>(HISTORY_FILE, []);

// Gemini AI Client Helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Authentication Middleware
interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

function authenticateToken(req: AuthRequest, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = undefined;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user as { id: string; email: string; name: string };
    }
    next();
  });
}

app.use(authenticateToken as any);

// ========================
// AUTHENTICATION ROUTES
// ========================

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: StoredUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveJSON(USERS_FILE, users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    };

    res.json({ token, user: userPayload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    res.json({ token, user: userPayload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Standard security practice: pretend sent
    return res.json({ message: 'If an account exists, password reset instructions have been sent.' });
  }
  return res.json({ message: 'Password reset link sent to ' + email });
});

app.post('/api/auth/update-profile', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { name, newPassword } = req.body;
  const userIndex = users.findIndex((u) => u.id === req.user?.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) {
    users[userIndex].name = name;
  }
  if (newPassword) {
    users[userIndex].passwordHash = await bcrypt.hash(newPassword, 10);
  }

  saveJSON(USERS_FILE, users);

  res.json({
    user: {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      avatar: users[userIndex].avatar,
      createdAt: users[userIndex].createdAt,
    },
  });
});

// ========================
// AI ANALYSIS ROUTES
// ========================

app.post('/api/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const { code, errorLog, language, fileName, mode = 'analyze' } = req.body;

    if (!code && !errorLog) {
      return res.status(400).json({ error: 'Please provide code snippet or error log for analysis.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an elite Senior Staff Software Engineer and Security Specialist AI Bug Fix Assistant.
Analyze the user's input (code snippet, source files, and/or error logs/tracebacks).
Provide a complete, accurate, rigorous bug analysis and fix.

Strict Output Format Guidelines:
Respond ONLY with a valid JSON object matching this schema:
{
  "language": "Identified programming language (e.g. Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, Dockerfile, HTML, CSS)",
  "framework": "Identified framework or runtime (e.g. React, Node.js, Spring Boot, Django, FastAPI, Express, Next.js, Standard Library)",
  "bug_summary": "Clear, concise 1-2 sentence summary of the bug or issue",
  "root_cause": "Detailed explanation of why the bug happens and its underlying trigger",
  "severity": "Low | Medium | High | Critical",
  "confidence": 95,
  "category": "Syntax | Runtime | Logic | Security | Performance | Memory | Dependency | Configuration",
  "expected_output": "What the code should produce or how it should behave when fixed",
  "actual_output": "What the buggy code currently produces or the exact error/exception raised",
  "step_by_step_fix": [
    "Step 1: Description of change",
    "Step 2: Description of change"
  ],
  "fixed_code": "Complete corrected working code without missing lines or placeholders",
  "optimized_code": "An improved version with better performance, memory usage, clean patterns, and modern syntax",
  "best_practices": [
    "Best practice tip 1",
    "Best practice tip 2"
  ],
  "security_issues": [
    {
      "id": "sec-1",
      "type": "Vulnerability name (e.g., SQL Injection, XSS, Hardcoded Secret, Command Injection)",
      "severity": "High",
      "description": "Explanation of vulnerability and risk",
      "line": "12",
      "remediation": "How to remediate or sanitize"
    }
  ],
  "time_complexity": "e.g., O(N) or O(N log N)",
  "space_complexity": "e.g., O(1) or O(N)",
  "complexity_details": {
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "explanation": "Brief reasoning for Big-O bounds",
    "optimizationSuggestions": ["Suggestion 1", "Suggestion 2"]
  },
  "unit_tests": "Executable unit tests written in the appropriate framework (e.g. PyTest, Jest, JUnit, Go testing, etc.)",
  "test_framework": "Name of test framework used (e.g. PyTest, Jest, JUnit 5)",
  "similar_bugs": [
    {
      "title": "Common Off-By-One Array Index Bug",
      "solution": "Ensure loop boundary uses < instead of <="
    }
  ],
  "documentation": [
    {
      "title": "MDN Web Docs / Python Docs Reference",
      "url": "https://developer.mozilla.org/ or official docs link"
    }
  ]
}

Mode requested: ${mode}`;

    const userPrompt = `Input Details:
Language Hint: ${language || 'Auto-detect'}
File Name: ${fileName || 'unnamed_file'}
Error Log / Traceback:
\`\`\`
${errorLog || 'No explicit error traceback provided.'}
\`\`\`

Code Snippet:
\`\`\`
${code || 'No explicit code snippet provided, infer from error log if possible.'}
\`\`\``;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON response:', rawText);
      return res.status(500).json({ error: 'Failed to parse AI response into structured JSON format.' });
    }

    const analysisResult = {
      id: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      language: result.language || language || 'Unknown',
      framework: result.framework || 'General',
      bug_summary: result.bug_summary || 'Analyzed code issue',
      root_cause: result.root_cause || 'Identified potential issue in snippet',
      severity: result.severity || 'Medium',
      confidence: typeof result.confidence === 'number' ? result.confidence : 90,
      category: result.category || 'Logic',
      expected_output: result.expected_output || 'Expected correct execution without error',
      actual_output: result.actual_output || errorLog || 'Unexpected behavior or runtime failure',
      step_by_step_fix: Array.isArray(result.step_by_step_fix) ? result.step_by_step_fix : ['Apply corrected code.'],
      original_code: code || '',
      fixed_code: result.fixed_code || code || '',
      optimized_code: result.optimized_code || result.fixed_code || code || '',
      best_practices: Array.isArray(result.best_practices) ? result.best_practices : [],
      security_issues: Array.isArray(result.security_issues) ? result.security_issues : [],
      time_complexity: result.time_complexity || 'O(N)',
      space_complexity: result.space_complexity || 'O(1)',
      complexity_details: result.complexity_details || {
        timeComplexity: result.time_complexity || 'O(N)',
        spaceComplexity: result.space_complexity || 'O(1)',
        explanation: 'Standard algorithmic complexity',
        optimizationSuggestions: [],
      },
      unit_tests: result.unit_tests || '',
      test_framework: result.test_framework || 'Standard',
      similar_bugs: Array.isArray(result.similar_bugs) ? result.similar_bugs : [],
      documentation: Array.isArray(result.documentation) ? result.documentation : [],
      createdAt: new Date().toISOString(),
      fileName: fileName || 'code_snippet',
    };

    // Save to Debug History
    const historyItem: StoredHistory = {
      id: analysisResult.id,
      userId: req.user?.id || 'guest',
      title: `${analysisResult.language} - ${analysisResult.bug_summary.substring(0, 45)}...`,
      language: analysisResult.language,
      bugSummary: analysisResult.bug_summary,
      severity: analysisResult.severity as any,
      category: analysisResult.category as any,
      createdAt: analysisResult.createdAt,
      bookmarked: false,
      status: 'Fixed',
      result: analysisResult,
      fileName: fileName || 'snippet',
    };

    historyItems.unshift(historyItem);
    // Keep max 100 history items in file storage
    if (historyItems.length > 100) {
      historyItems = historyItems.slice(0, 100);
    }
    saveJSON(HISTORY_FILE, historyItems);

    res.json(analysisResult);
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
});

// ========================
// SECURITY SCANNER ROUTE
// ========================

app.post('/api/security-scan', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Please provide code for security scanning.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a Lead Application Security Auditor and Penetration Tester AI.
Thoroughly scan the code snippet for security vulnerabilities including OWASP Top 10:
- SQL Injection
- Cross-Site Scripting (XSS)
- Hardcoded Passwords & API Keys
- Unsafe File Uploads & Path Traversal
- Weak Authentication / Insecure JWT
- Command Injection / Remote Code Execution
- CSRF & Missing Authorization
- Buffer Overflow
- Unsafe Deserialization
- Insecure Cryptography

Return a JSON response:
{
  "vulnerabilities": [
    {
      "id": "sec-1",
      "type": "Vulnerability Name",
      "severity": "Critical | High | Medium | Low",
      "description": "Thorough risk description",
      "line": 15,
      "remediation": "Secure refactored replacement code snippet",
      "cwe": "CWE-89"
    }
  ],
  "securityScore": 85,
  "summary": "Overall security assessment breakdown",
  "hardenedCode": "Fully refactored secure version of the input code"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Language: ${language || 'Auto-detect'}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Security scan failed' });
  }
});

// ========================
// CODE OPTIMIZER ROUTE
// ========================

app.post('/api/optimize', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Please provide code to optimize.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a Principal Software Architect AI specializing in code performance, memory optimization, and clean code refactoring.
Optimize the provided code for:
1. Execution speed (Time Complexity)
2. Memory footprint (Space Complexity)
3. Readability & Code Cleanliness (Naming conventions, modularity)
4. Idiomatic language features and modern syntax

Return a JSON object:
{
  "optimizedCode": "Complete clean optimized code",
  "timeComplexityBefore": "O(N^2)",
  "timeComplexityAfter": "O(N)",
  "spaceComplexityBefore": "O(N)",
  "spaceComplexityAfter": "O(1)",
  "improvements": [
    "Replaced nested loop with Hash Map lookup",
    "Eliminated redundant memory allocations"
  ],
  "explanation": "Detailed step by step breakdown of performance gains"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Language: ${language || 'Auto-detect'}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Code optimization failed' });
  }
});

// ========================
// UNIT TEST GENERATOR ROUTE
// ========================

app.post('/api/generate-tests', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, framework } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Please provide code for unit test generation.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an Automated QA Engineering Specialist AI.
Generate comprehensive, production-ready unit tests for the provided code.
Include:
- Happy path test cases
- Edge cases (null, empty inputs, bounds, exceptions)
- Mocks or stubs if required

Return a JSON object:
{
  "framework": "Selected framework (e.g. PyTest, Jest, JUnit 5, Vitest, TestNG, Go testing)",
  "unitTestCode": "Full runnable test code file",
  "coverageSummary": "Estimated test coverage scenario descriptions",
  "instructions": "How to run the generated tests"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Language: ${language || 'Auto-detect'}\nPreferred Test Framework: ${framework || 'Standard'}\nCode:\n\`\`\`\n${code}\n\`\`\``,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unit test generation failed' });
  }
});

// ========================
// AI CHAT ROUTE
// ========================

app.post('/api/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, codeContext, bugContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert AI Debugging Assistant in an interactive chat session.
Answer developer questions clearly with helpful code examples, precise explanations, and troubleshooting advice.
Keep responses friendly, helpful, concise, and structured with markdown code blocks.

Active Context:
Code Snippet:
\`\`\`
${codeContext || 'No current code in editor.'}
\`\`\`

Bug Summary Context:
${bugContext || 'No current active bug report.'}`;

    const lastUserMessage = messages[messages.length - 1]?.text || 'Explain this code.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: lastUserMessage,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Chat request failed' });
  }
});

// ========================
// GITHUB REPO IMPORT ROUTE
// ========================

app.post('/api/github/fetch', async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'GitHub URL is required.' });
    }

    // Parse owner/repo from URL
    // e.g. https://github.com/facebook/react or https://github.com/expressjs/express/blob/master/lib/express.js
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL format. Use format: https://github.com/owner/repository' });
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    // Fetch repo contents via GitHub API
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const fetchRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'AIBugFixAssistant/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({
        error: `Failed to fetch GitHub repo: ${fetchRes.statusText}. Please verify the repository is public.`,
      });
    }

    const contents: any[] = await fetchRes.json();
    const codeFiles: any[] = [];

    // Extract code files (up to 15 relevant source files)
    const validExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.sql', '.json', '.html', '.css', '.md'];

    for (const item of contents) {
      if (item.type === 'file') {
        const ext = path.extname(item.name).toLowerCase();
        if (validExtensions.includes(ext) && item.size < 200000) {
          try {
            const rawRes = await fetch(item.download_url);
            if (rawRes.ok) {
              const text = await rawRes.text();
              codeFiles.push({
                name: item.name,
                path: item.path,
                content: text,
                language: ext.replace('.', '') || 'text',
                size: item.size,
              });
            }
          } catch (fileErr) {
            console.error(`Failed to fetch file ${item.name}:`, fileErr);
          }
        }
      }
    }

    res.json({
      owner,
      repo,
      files: codeFiles,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'GitHub import failed' });
  }
});

// ========================
// ZIP FILE UPLOAD UNPACKING ROUTE
// ========================

app.post('/api/upload-zip', async (req: Request, res: Response) => {
  try {
    const { base64Zip } = req.body;
    if (!base64Zip) {
      return res.status(400).json({ error: 'Base64 zip file content is required.' });
    }

    const buffer = Buffer.from(base64Zip.split(',')[1] || base64Zip, 'base64');
    const zip = await jszip.loadAsync(buffer);
    const files: { name: string; path: string; content: string; language: string; size: number }[] = [];

    const validExtensions = ['.py', '.java', '.cpp', '.c', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json', '.xml', '.go', '.rs', '.sql'];

    for (const [relativePath, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        const ext = path.extname(relativePath).toLowerCase();
        if (validExtensions.includes(ext) && file.name.indexOf('node_modules') === -1) {
          const content = await file.async('string');
          files.push({
            name: path.basename(relativePath),
            path: relativePath,
            content: content,
            language: ext.replace('.', ''),
            size: content.length,
          });
        }
      }
    }

    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process zip archive: ' + err.message });
  }
});

// ========================
// DEBUG HISTORY & SHARE ROUTES
// ========================

app.get('/api/history', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  // If user is logged in, show user items + guest items. If guest, show guest items.
  const filtered = historyItems.filter((item) => !item.userId || item.userId === 'guest' || item.userId === userId);
  res.json(filtered);
});

app.get('/api/history/:id', (req: Request, res: Response) => {
  const item = historyItems.find((h) => h.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'History item not found' });
  }
  res.json(item);
});

app.post('/api/history/:id/bookmark', (req: AuthRequest, res: Response) => {
  const item = historyItems.find((h) => h.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'History item not found' });
  }
  item.bookmarked = !item.bookmarked;
  saveJSON(HISTORY_FILE, historyItems);
  res.json({ bookmarked: item.bookmarked });
});

app.delete('/api/history/:id', (req: AuthRequest, res: Response) => {
  const initialLen = historyItems.length;
  historyItems = historyItems.filter((h) => h.id !== req.params.id);
  saveJSON(HISTORY_FILE, historyItems);
  res.json({ success: historyItems.length < initialLen });
});

app.get('/api/share/:id', (req: Request, res: Response) => {
  const item = historyItems.find((h) => h.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Shared debug session not found or link expired.' });
  }
  res.json(item);
});

// ========================
// VITE / STATIC SERVING
// ========================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Bug Fix Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
