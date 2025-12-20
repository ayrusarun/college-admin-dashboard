// ============================================
// AI TYPES
// ============================================

export interface ContentRewriteRequest {
  content: string;
  style?: string | null; // e.g., 'professional', 'casual', 'academic', 'friendly'
  tone?: string | null; // e.g., 'formal', 'informal', 'enthusiastic', 'neutral'
  max_length?: number | null;
}

export interface ContentRewriteResponse {
  original_content: string;
  rewritten_content: string;
  style: string;
  tone: string;
  improvements: string[];
  word_count_before: number;
  word_count_after: number;
}

export interface AIQuery {
  question: string;
  context_filter?: string | null;
}

export interface AIResponse {
  answer: string;
  sources: Record<string, any>[];
  conversation_id: number;
}

export interface KnowledgeSearchQuery {
  query: string;
  content_type?: string | null;
  limit?: number;
}

export interface SearchResult {
  doc_id: string;
  similarity: number;
  metadata: Record<string, any>;
}

export interface IndexRequest {
  content_type: string; // 'files', 'posts', 'all'
  content_ids?: number[] | null;
}

export interface IndexResponse {
  message: string;
  tasks_created: number;
}

// UI Helper types
export const REWRITE_STYLES = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'academic', label: 'Academic', description: 'Scholarly and formal' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'persuasive', label: 'Persuasive', description: 'Convincing and compelling' },
] as const;

export const REWRITE_TONES = [
  { value: 'formal', label: 'Formal', description: 'Serious and respectful' },
  { value: 'informal', label: 'Informal', description: 'Relaxed and casual' },
  { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and exciting' },
  { value: 'neutral', label: 'Neutral', description: 'Balanced and objective' },
  { value: 'empathetic', label: 'Empathetic', description: 'Understanding and caring' },
] as const;
