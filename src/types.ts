export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type BugCategory = 
  | 'Syntax' 
  | 'Runtime' 
  | 'Logic' 
  | 'Security' 
  | 'Performance' 
  | 'Memory' 
  | 'Dependency' 
  | 'Configuration';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  role?: string;
}

export interface SecurityVulnerability {
  id: string;
  type: string;
  severity: SeverityLevel;
  description: string;
  line?: number | string;
  remediation: string;
  cwe?: string;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  bottleneck?: string;
  optimizationSuggestions: string[];
}

export interface SimilarBug {
  title: string;
  solution: string;
  codeSnippet?: string;
}

export interface DocumentationLink {
  title: string;
  url: string;
}

export interface AnalysisResult {
  id: string;
  language: string;
  framework: string;
  bug_summary: string;
  root_cause: string;
  severity: SeverityLevel;
  confidence: number;
  category: BugCategory;
  expected_output: string;
  actual_output: string;
  step_by_step_fix: string[];
  original_code: string;
  fixed_code: string;
  optimized_code: string;
  best_practices: string[];
  security_issues: SecurityVulnerability[];
  time_complexity: string;
  space_complexity: string;
  complexity_details?: ComplexityAnalysis;
  unit_tests: string;
  test_framework?: string;
  similar_bugs: SimilarBug[];
  documentation: DocumentationLink[];
  createdAt: string;
  fileName?: string;
}

export interface HistoryItem {
  id: string;
  userId?: string;
  title: string;
  language: string;
  bugSummary: string;
  severity: SeverityLevel;
  category: BugCategory;
  createdAt: string;
  bookmarked: boolean;
  status: 'Fixed' | 'Investigating' | 'Pending';
  result: AnalysisResult;
  fileName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  hasBugs?: boolean;
  bugCount?: number;
}

export interface GitHubRepoDetails {
  owner: string;
  repo: string;
  branch: string;
  files: ProjectFile[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
