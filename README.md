# AI Bug Fix Assistant

An intelligent, production-ready web application powered by **Google Gemini API** (`gemini-3.6-flash`) designed to help software engineers identify, explain, repair, and optimize programming bugs and security vulnerabilities across multiple languages and frameworks.

---

## 🚀 Key Features

1. **User Authentication**
   - JWT-based Signup, Login, Profile updates, and Password Reset simulation.
   - Secure password hashing using `bcryptjs`.

2. **Core AI Analysis Engine**
   - Paste source code or error tracebacks (Python, Java, JavaScript, TypeScript, C++, Go, Rust, SQL, Docker, HTML/CSS).
   - Identifies language, framework, bug summary, root cause, severity level, confidence score, and category.
   - Generates step-by-step fix guides, corrected code, and refactored high-performance versions.

3. **Split Code Comparison (Diff Viewer)**
   - Side-by-side original vs corrected code comparison with copy buttons and file downloader.

4. **OWASP Security Scanner**
   - Audits code for SQL Injection, Cross-Site Scripting (XSS), Hardcoded Secrets/Keys, Command Injection, CSRF, and Deserialization vulnerabilities.

5. **Code Performance Optimizer**
   - Analyzes Time and Space Complexity (Big-O notation) and provides optimized clean code refactors.

6. **Unit Test Generator**
   - Generates executable unit test suites for **PyTest, Jest, JUnit 5, Vitest, TestNG, Go testing, and Cargo test**.

7. **Interactive AI Debug Chat**
   - Context-aware Q&A session with Gemini to discuss fixes and programming concepts.

8. **Debug History & Archive**
   - Save, search, filter, star/bookmark, and delete past debugging sessions.

9. **Zip & Project Workspace Analyzer**
   - Upload `.zip` project archives, extract source files, inspect code, and run bug analysis.

10. **GitHub Repository & PR Importer**
    - Paste public GitHub repo links (e.g. `https://github.com/owner/repo`) to fetch live files and analyze.

11. **Professional PDF Reports**
    - Export downloadable PDF reports containing diagnostic summaries, root causes, security flaws, and fixes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React Icons
- **Backend**: Express.js (Node.js full-stack container)
- **AI Engine**: `@google/genai` TypeScript SDK (`gemini-3.6-flash`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **PDF Generation**: `jsPDF`
- **Zip Unpacking**: `JSZip`

---

## 📡 API Endpoints

- `POST /api/auth/signup` - Register a new account
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Fetch authenticated user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/analyze` - Main Gemini AI bug analysis & repair
- `POST /api/security-scan` - OWASP security audit
- `POST /api/optimize` - Performance & Big-O optimization
- `POST /api/generate-tests` - Unit test suite generation
- `POST /api/chat` - Interactive AI debugging chat
- `POST /api/github/fetch` - Fetch public GitHub repository files
- `POST /api/upload-zip` - Unpack base64 zipped project archive
- `GET /api/history` - Retrieve saved debug history
- `POST /api/history/:id/bookmark` - Toggle bookmark star
- `DELETE /api/history/:id` - Remove history record

---

## 💻 Local Development & Running

### Prerequisites
- Node.js (v18+)
- Gemini API Key (`GEMINI_API_KEY` set in environment or secrets)

### Start Development Server
```bash
npm run dev
```
The server will boot on `http://0.0.0.0:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## 📄 License
Apache-2.0
