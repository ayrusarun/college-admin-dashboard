// ============================================
// POST TYPES
// ============================================

export type PostType = 'ANNOUNCEMENT' | 'INFO' | 'IMPORTANT' | 'EVENTS' | 'GENERAL';
export type PostContext = 'PERSONAL' | 'OFFICIAL';

export interface PostCreate {
  title: string;
  content: string;
  image_url?: string | null;
  post_type?: PostType;
  target_group_id?: number | null;
  post_context?: PostContext | null;
}

export interface PostUpdate {
  title?: string | null;
  content?: string | null;
  image_url?: string | null;
  post_type?: PostType | null;
  target_group_id?: number | null;
  post_context?: PostContext | null;
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  image_url?: string | null;
  post_type: PostType;
  target_group_id?: number | null;
  author_id: number;
  college_id: number;
  post_metadata: Record<string, any>;
  post_context?: PostContext | null;
  created_at: string;
  updated_at: string;
  
  // Additional fields
  author_name?: string | null;
  author_department?: string | null;
  target_group_name?: string | null;
  target_group_type?: string | null;
  target_group_logo?: string | null;
  time_ago?: string | null;
}

export interface PostEngagementResponse extends PostResponse {
  like_count: number;
  comment_count: number;
  ignite_count: number;
  user_has_liked: boolean;
  user_has_ignited: boolean;
}

export interface PostMetadataUpdate {
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface CommentCreate {
  content: string;
}

export interface CommentResponse {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_department: string;
  time_ago: string;
}

export interface CommentListResponse {
  comments: CommentResponse[];
  total_count: number;
  page: number;
  page_size: number;
}

// ============================================
// LIKE TYPES
// ============================================

export interface LikeResponse {
  id: number;
  post_id: number;
  user_id: number;
  created_at: string;
  user_name: string;
  user_department: string;
}

export interface LikeListResponse {
  likes: LikeResponse[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface LikeToggleResponse {
  success: boolean;
  action: string; // 'liked' | 'unliked'
  like_count: number;
}

// ============================================
// IGNITE TYPES
// ============================================

export interface IgniteResponse {
  id: number;
  post_id: number;
  giver_id: number;
  receiver_id: number;
  created_at: string;
  giver_name: string;
  receiver_name: string;
}

export interface IgniteListResponse {
  ignites: IgniteResponse[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface IgniteToggleResponse {
  success: boolean;
  action: string; // 'ignited' | 'un-ignited'
  ignite_count: number;
  points_transferred: number;
}

// ============================================
// POST ALERT TYPES
// ============================================

export interface PostAlertCreate {
  user_id: number;
  title: string;
  message: string;
  alert_type?: 'EVENT_NOTIFICATION' | 'FEE_REMINDER' | 'ANNOUNCEMENT' | 'DEADLINE_REMINDER' | 'ACADEMIC_UPDATE' | 'SYSTEM_NOTIFICATION' | 'GENERAL';
  expires_at?: string | null;
}

// ============================================
// POST FILTERS & PARAMS
// ============================================

export interface PostListParams {
  skip?: number;
  limit?: number;
}

export interface PostByTypeParams {
  post_type: PostType;
  skip?: number;
  limit?: number;
}

export interface CommentListParams {
  page?: number;
  page_size?: number;
}

export interface LikeListParams {
  page?: number;
  page_size?: number;
}

export interface IgniteListParams {
  page?: number;
  page_size?: number;
}

// ============================================
// UI HELPER TYPES
// ============================================

export interface PostFormData {
  title: string;
  content: string;
  image_url: string;
  post_type: PostType;
  target_group_id: number | null;
  post_context: PostContext | null;
}

export const POST_TYPE_OPTIONS: { value: PostType; label: string; icon: string }[] = [
  { value: 'GENERAL', label: 'General', icon: '💬' },
  { value: 'ANNOUNCEMENT', label: 'Announcement', icon: '📢' },
  { value: 'INFO', label: 'Information', icon: 'ℹ️' },
  { value: 'IMPORTANT', label: 'Important', icon: '⚠️' },
  { value: 'EVENTS', label: 'Events', icon: '📅' },
];

export const POST_CONTEXT_OPTIONS: { value: PostContext; label: string }[] = [
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'OFFICIAL', label: 'Official' },
];
