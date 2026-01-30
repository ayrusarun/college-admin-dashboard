// ==================== AUTH TYPES ====================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "admin" | "staff" | "student" | "teacher" | "super_admin";
  is_active: boolean;
  college?: {
    id: number;
    name: string;
    slug: string;
  };
  department?: {
    id: number;
    name: string;
    code: string;
  };
  // Legacy fields for backward compatibility
  college_id?: number;
  college_name?: string;
  department_id?: number;
  department_name?: string;
  program_id?: number;
  cohort_id?: number;
  class_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  academic?: {
    department_name?: string;
    program_name?: string;
    program_code?: string;
    cohort_name?: string;
    class_section?: string;
    year_of_study?: number;
    admission_year?: number;
  };
}

// ==================== DEPARTMENT TYPES ====================
export interface Department {
  id: number;
  college_id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentWithStats extends Department {
  student_count: number;
  staff_count: number;
  file_count: number;
  post_count: number;
}

export interface DepartmentCreate {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

// ==================== ACADEMIC TYPES ====================
export interface AcademicYear {
  id: number;
  college_id: number;
  year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Program {
  id: number;
  college_id: number;
  department_id: number;
  code: string;
  name: string;
  short_name?: string;
  duration_years: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramWithDepartment extends Program {
  department_name?: string;
  department_code?: string;
}

export interface Cohort {
  id: number;
  college_id: number;
  program_id: number;
  admission_year: number;
  code: string;
  name: string;
  current_semester: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: number;
  college_id: number;
  cohort_id: number;
  program_id: number;
  section_code: string;
  section_name?: string;
  capacity?: number;
  is_active: boolean;
  class_teacher_id?: number;
  current_strength?: number;
  created_at: string;
  updated_at: string;
}

// ==================== POST TYPES ====================
export type PostType = "ANNOUNCEMENT" | "INFO" | "EVENTS" | "GENERAL";
export type PostContext = "PERSONAL" | "OFFICIAL";

export interface Post {
  id: number;
  author_id: number;
  author_name: string;
  college_id: number;
  title: string;
  content: string;
  post_type: PostType;
  context: PostContext;
  image_url?: string;
  target_department_id?: number;
  target_program_id?: number;
  target_cohort_id?: number;
  target_class_id?: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
}

// ==================== EVENT TYPES ====================
export interface Event {
  id: number;
  college_id?: number;
  title: string;
  description: string;
  banner_image_url?: string;
  event_mode: "ONLINE" | "OFFLINE" | "HYBRID";
  online_link?: string;
  venue_location?: string;
  event_start_time: string;
  event_end_time: string;
  registration_start_time?: string;
  registration_end_time?: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  max_attendees?: number;
  current_attendees: number;
  requires_approval?: boolean;
  is_full: boolean;
  registration_open: boolean;
  can_register?: boolean;
  is_registered?: boolean;
  organizer_id?: number;
  organizer_name?: string;
  organizer_email?: string;
  created_by_id?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  cancelled_at?: string;
  is_deleted?: boolean;
}

export interface EventAnalytics {
  event_id: number;
  total_invited: number;
  total_registrations: number;
  approved_registrations: number;
  pending_registrations: number;
  rejected_registrations: number;
  cancelled_registrations: number;
  waitlisted_registrations: number;
  total_checked_in: number;
  total_checked_out: number;
  total_feedback: number;
  average_rating: number | null;
  capacity_percentage: number;
}

export interface EventFeedbackSummary {
  total_feedback: number;
  average_rating: number;
  rating_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  recent_feedback: EventFeedback[];
}

export interface EventFeedback {
  id: number;
  event_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface EventAttendee {
  id: number;
  event_id: number;
  user_id: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "WAITLISTED";
  registration_data?: any;
  checked_in_at?: string;
  checked_out_at?: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_department?: string;
}

export interface CustomField {
  id: number;
  event_id: number;
  field_name: string;
  field_type: "TEXT" | "NUMBER" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "YES_NO";
  is_required: boolean;
  options?: string[];
  placeholder?: string;
  order_index: number;
}

// ==================== GROUP TYPES ====================
export type GroupType = "ACADEMIC" | "CLUB" | "EVENT" | "CUSTOM";
export type GroupRole = "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";

export interface Group {
  id: number;
  college_id: number;
  name: string;
  description?: string;
  group_type: GroupType;
  logo?: string;
  banner_url?: string;
  is_open: boolean;
  requires_approval: boolean;
  group_metadata?: Record<string, any>;
  allowed_post_roles: string[];
  created_by_id?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  member_count?: number;
  my_role?: GroupRole;
  can_post?: boolean;
  available_contexts?: PostContext[];
}

export interface GroupCreate {
  name: string;
  group_type: GroupType;
  description?: string;
  logo?: string;
  banner_url?: string;
  is_open?: boolean;
  requires_approval?: boolean;
  group_metadata?: Record<string, any>;
  allowed_post_roles?: GroupRole[];
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  logo?: string;
  banner_url?: string;
  is_open?: boolean;
  requires_approval?: boolean;
  allowed_post_roles?: GroupRole[];
  is_active?: boolean;
}

export interface MemberInfo {
  user_id: number;
  username: string;
  full_name: string;
  email?: string;
  role: GroupRole;
  joined_at: string;
  is_active: boolean;
}

export interface GroupWithMembers extends Group {
  members: MemberInfo[];
}

export interface UserGroupsResponse {
  user_id: number;
  groups: Group[];
  total_groups: number;
}

export interface GroupMemberUpdate {
  role?: GroupRole;
  is_active?: boolean;
}

// ==================== STATS TYPES ====================
export interface DashboardStats {
  total_users: number;
  total_students: number;
  total_staff: number;
  total_posts: number;
  total_events: number;
  total_departments: number;
  active_users_today: number;
  recent_posts: Post[];
  upcoming_events: Event[];
}

// ==================== PAGINATION ====================
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ==================== ALERT TYPES ====================
export enum AlertType {
  EVENT_NOTIFICATION = "EVENT_NOTIFICATION",
  FEE_REMINDER = "FEE_REMINDER",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  DEADLINE_REMINDER = "DEADLINE_REMINDER",
  ACADEMIC_UPDATE = "ACADEMIC_UPDATE",
  SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
  GENERAL = "GENERAL"
}

export interface AlertCreate {
  title: string;
  message: string;
  alert_type?: AlertType;
  expires_at?: string;
  post_id?: number;
  target_group_id?: number;
  user_id?: number;
}

export interface AlertUpdate {
  title?: string;
  message?: string;
  alert_type?: AlertType;
  is_enabled?: boolean;
  is_read?: boolean;
  expires_at?: string;
}

export interface AlertResponse {
  id: number;
  title: string;
  message: string;
  alert_type: AlertType;
  expires_at?: string;
  post_id?: number;
  target_group_id?: number;
  user_id: number;
  is_enabled: boolean;
  is_read: boolean;
  college_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
  target_group_name?: string;
  target_group_type?: string;
  post_title?: string;
  time_ago: string;
  is_expired: boolean;
}

export interface AlertListResponse {
  alerts: AlertResponse[];
  total_count: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export interface GroupAlertCreate {
  title: string;
  message: string;
  alert_type?: AlertType;
  expires_at?: string;
  post_id?: number;
  target_group_id: number;
}

export interface PostAlertCreate {
  user_id: number;
  title: string;
  message: string;
  alert_type?: AlertType;
  expires_at?: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ==================== COLLEGE TYPES (SUPER ADMIN) ====================
export interface College {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at?: string;
}

export interface CollegeCreate {
  name: string;
  slug: string;
}

export interface CollegeUpdate {
  name?: string;
  slug?: string;
}

export interface CollegeWithStats extends College {
  user_count: number;
  department_count: number;
  post_count: number;
  event_count: number;
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}
