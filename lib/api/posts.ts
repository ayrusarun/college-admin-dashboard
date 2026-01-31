import apiClient from './client';
import type {
  PostCreate,
  PostUpdate,
  PostResponse,
  PostEngagementResponse,
  PostMetadataUpdate,
  PostListParams,
  PostByTypeParams,
  CommentCreate,
  CommentResponse,
  CommentListResponse,
  CommentListParams,
  LikeToggleResponse,
  LikeListResponse,
  LikeListParams,
  IgniteToggleResponse,
  IgniteListResponse,
  IgniteListParams,
  PostAlertCreate,
} from '@/lib/types/posts';
import type { AlertResponse } from '@/lib/types';

/**
 * Posts API Client
 * Handles all post-related operations including CRUD, engagement (likes, ignites), and comments
 */
export const postApi = {
  // ============================================
  // POST CRUD OPERATIONS
  // ============================================

  /**
   * Get posts with smart filtering based on user's group memberships
   * Non-admin users see posts that are:
   * 1. General (no targeting)
   * 2. Targeted to groups they are members of
   * Admin users see all posts
   * 
   * ⚡ OPTIMIZED: Uses eager loading and batch queries to prevent N+1 problem
   */
  async list(params?: PostListParams): Promise<PostEngagementResponse[]> {
    const response = await apiClient.get('/posts/', { params });
    return response.data;
  },

  /**
   * Get a specific post by ID
   * ⚡ OPTIMIZED: Uses eager loading to prevent N+1 queries
   */
  async get(postId: number): Promise<PostEngagementResponse> {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  /**
   * Get posts by type (ANNOUNCEMENT, INFO, IMPORTANT, EVENTS, GENERAL)
   * ⚡ OPTIMIZED: Uses eager loading to prevent N+1 queries
   */
  async getByType(params: PostByTypeParams): Promise<PostResponse[]> {
    const { post_type, ...queryParams } = params;
    const response = await apiClient.get(`/posts/type/${post_type}`, { params: queryParams });
    return response.data;
  },

  /**
   * Create a new post
   */
  async create(data: PostCreate): Promise<PostResponse> {
    const response = await apiClient.post('/posts/', data);
    return response.data;
  },

  /**
   * Update an existing post (only by author or admin)
   */
  async update(postId: number, data: PostUpdate): Promise<PostResponse> {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return response.data;
  },

  /**
   * Update post metadata (likes, comments, shares count)
   */
  async updateMetadata(postId: number, data: PostMetadataUpdate): Promise<PostResponse> {
    const response = await apiClient.patch(`/posts/${postId}/metadata`, data);
    return response.data;
  },

  /**
   * Delete a post (soft delete - sets is_active to false)
   * Only author or admin/staff with manage:posts permission can delete
   */
  async delete(postId: number): Promise<void> {
    await apiClient.delete(`/posts/${postId}`);
  },

  // ============================================
  // COMMENT OPERATIONS
  // ============================================

  /**
   * Add a comment to a post
   */
  async addComment(postId: number, data: CommentCreate): Promise<CommentResponse> {
    const response = await apiClient.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  /**
   * Get comments for a post (paginated, newest first)
   */
  async getComments(postId: number, params?: CommentListParams): Promise<CommentListResponse> {
    const response = await apiClient.get(`/posts/${postId}/comments`, { params });
    return response.data;
  },

  /**
   * Delete a comment (only by comment author or admin)
   */
  async deleteComment(postId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },

  // ============================================
  // LIKE OPERATIONS
  // ============================================

  /**
   * Toggle like on a post (like if not liked, unlike if already liked)
   */
  async toggleLike(postId: number): Promise<LikeToggleResponse> {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Get users who liked a post
   */
  async getLikes(postId: number, params?: LikeListParams): Promise<LikeListResponse> {
    const response = await apiClient.get(`/posts/${postId}/likes`, { params });
    return response.data;
  },

  /**
   * Check if current user has liked a post
   */
  async checkIfLiked(postId: number): Promise<{ liked: boolean }> {
    const response = await apiClient.get(`/posts/${postId}/is-liked`);
    return response.data;
  },

  // ============================================
  // IGNITE OPERATIONS
  // ============================================

  /**
   * Toggle ignite on a post
   * - Ignite: Deduct 1 point from user, add 1 point to post author
   * - Un-ignite: Refund 1 point to user, deduct 1 point from post author
   */
  async toggleIgnite(postId: number): Promise<IgniteToggleResponse> {
    const response = await apiClient.post(`/posts/${postId}/ignite`);
    return response.data;
  },

  /**
   * Get users who ignited a post
   */
  async getIgnites(postId: number, params?: IgniteListParams): Promise<IgniteListResponse> {
    const response = await apiClient.get(`/posts/${postId}/ignites`, { params });
    return response.data;
  },

  /**
   * Check if current user has ignited a post
   */
  async checkIfIgnited(postId: number): Promise<{ ignited: boolean }> {
    const response = await apiClient.get(`/posts/${postId}/is-ignited`);
    return response.data;
  },

  // ============================================
  // POST ALERT OPERATIONS
  // ============================================

  /**
   * Create an alert for a specific post
   * Sends notification to targeted user about the post
   */
  async createAlert(postId: number, data: PostAlertCreate): Promise<AlertResponse> {
    const response = await apiClient.post(`/posts/${postId}/alert`, data);
    return response.data;
  },

  // ============================================
  // IMAGE UPLOAD OPERATIONS
  // ============================================

  /**
   * Upload an image for posts (authenticated upload, but public access to view)
   * Returns the image URL to use in post creation
   */
  async uploadImage(file: File, folderPath?: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderPath) {
      formData.append('folder_path', folderPath);
    }

    const response = await apiClient.post('/files/posts/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Delete a post image (authenticated - only by uploader)
   */
  async deleteImage(filename: string): Promise<void> {
    await apiClient.delete(`/files/posts/image/${filename}`);
  },

  /**
   * Get the full URL for a post image
   */
  getImageUrl(filename: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://195.35.20.155:8000';
    return `${baseUrl}/files/posts/image/${filename}`;
  },
};

export default postApi;
