import { AnalysisResult, HistoryItem, User } from '../types';

export const api = {
  // Auth
  async signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe(token: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Fetch user failed');
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async updateProfile(token: string, name?: string, newPassword?: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Profile update failed');
    return data;
  },

  // AI Analysis & Tools
  async analyzeCode(
    code: string,
    errorLog: string,
    language?: string,
    fileName?: string,
    mode: string = 'analyze',
    token?: string
  ): Promise<AnalysisResult> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, errorLog, language, fileName, mode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Analysis failed');
    return data;
  },

  async securityScan(code: string, language?: string, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/security-scan', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Security scan failed');
    return data;
  },

  async optimizeCode(code: string, language?: string, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Optimization failed');
    return data;
  },

  async generateTests(code: string, language?: string, framework?: string, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/generate-tests', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, language, framework }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Test generation failed');
    return data;
  },

  async chat(messages: { sender: string; text: string }[], codeContext?: string, bugContext?: string) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, codeContext, bugContext }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Chat request failed');
    return data;
  },

  // GitHub Import
  async fetchGitHubRepo(repoUrl: string) {
    const res = await fetch('/api/github/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'GitHub fetch failed');
    return data;
  },

  // Zip Upload
  async uploadZip(base64Zip: string) {
    const res = await fetch('/api/upload-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Zip }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Zip processing failed');
    return data;
  },

  // Debug History
  async getHistory(token?: string): Promise<HistoryItem[]> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/history', { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Fetch history failed');
    return data;
  },

  async bookmarkHistory(id: string, token?: string): Promise<{ bookmarked: boolean }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/history/${id}/bookmark`, {
      method: 'POST',
      headers,
    });
    return res.json();
  },

  async deleteHistory(id: string, token?: string): Promise<{ success: boolean }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/history/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },
};
