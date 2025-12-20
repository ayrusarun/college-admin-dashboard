import apiClient from './client';
import type {
  ContentRewriteRequest,
  ContentRewriteResponse,
  AIQuery,
  AIResponse,
  KnowledgeSearchQuery,
  SearchResult,
  IndexRequest,
  IndexResponse,
} from '@/lib/types/ai';

/**
 * AI API Client
 * Handles AI-powered features including content rewriting, knowledge search, and Q&A
 */
export const aiApi = {
  // ============================================
  // CONTENT REWRITE
  // ============================================

  /**
   * Rewrite content for community posts using AI
   * Improves clarity, engagement, and style while maintaining the original message
   * 
   * @param data - Content rewrite request with content, style, tone preferences
   * @returns Rewritten content with improvements and statistics
   */
  async rewriteContent(data: ContentRewriteRequest): Promise<ContentRewriteResponse> {
    const response = await apiClient.post('/ai/rewrite', data);
    return response.data;
  },

  // ============================================
  // AI QUESTION & ANSWER
  // ============================================

  /**
   * Ask the AI assistant a question about college content
   * The AI has access to files, posts, and other college information
   * 
   * @param data - Question and optional context filter
   * @returns AI-generated answer with sources and conversation ID
   */
  async ask(data: AIQuery): Promise<AIResponse> {
    const response = await apiClient.post('/ai/ask', data);
    return response.data;
  },

  /**
   * Get user's recent AI conversations
   * 
   * @param limit - Maximum number of conversations to return (1-100, default: 20)
   * @returns Array of conversation objects
   */
  async getConversations(limit: number = 20): Promise<any[]> {
    const response = await apiClient.get('/ai/conversations', { 
      params: { limit: Math.min(Math.max(limit, 1), 100) } 
    });
    return response.data;
  },

  // ============================================
  // KNOWLEDGE SEARCH
  // ============================================

  /**
   * Direct search in the knowledge base without AI response generation
   * Returns raw search results with similarity scores
   * 
   * @param data - Search query with optional content type filter and limit
   * @returns Array of search results with similarity scores
   */
  async search(data: KnowledgeSearchQuery): Promise<SearchResult[]> {
    const response = await apiClient.post('/ai/search', data);
    return response.data;
  },

  // ============================================
  // CONTENT INDEXING
  // ============================================

  /**
   * Create indexing tasks for files, posts, or all content
   * Content will be processed in the background for AI search
   * 
   * @param data - Index request specifying content type and optional IDs
   * @returns Message and number of tasks created
   */
  async createIndexingTasks(data: IndexRequest): Promise<IndexResponse> {
    const response = await apiClient.post('/ai/index', data);
    return response.data;
  },

  /**
   * Get AI system statistics for the college
   * 
   * @returns Statistics object with indexing and usage information
   */
  async getStats(): Promise<any> {
    const response = await apiClient.get('/ai/stats');
    return response.data;
  },

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Quick content rewrite with default settings (professional & friendly)
   * 
   * @param content - Content to rewrite
   * @returns Rewritten content response
   */
  async quickRewrite(content: string): Promise<ContentRewriteResponse> {
    return this.rewriteContent({
      content,
      style: 'professional',
      tone: 'friendly',
    });
  },

  /**
   * Rewrite content for announcements (professional & formal)
   * 
   * @param content - Content to rewrite
   * @returns Rewritten content response
   */
  async rewriteForAnnouncement(content: string): Promise<ContentRewriteResponse> {
    return this.rewriteContent({
      content,
      style: 'professional',
      tone: 'formal',
    });
  },

  /**
   * Rewrite content for events (enthusiastic & friendly)
   * 
   * @param content - Content to rewrite
   * @returns Rewritten content response
   */
  async rewriteForEvent(content: string): Promise<ContentRewriteResponse> {
    return this.rewriteContent({
      content,
      style: 'friendly',
      tone: 'enthusiastic',
    });
  },

  /**
   * Rewrite content for academic posts (academic & formal)
   * 
   * @param content - Content to rewrite
   * @returns Rewritten content response
   */
  async rewriteForAcademic(content: string): Promise<ContentRewriteResponse> {
    return this.rewriteContent({
      content,
      style: 'academic',
      tone: 'formal',
    });
  },
};

export default aiApi;
