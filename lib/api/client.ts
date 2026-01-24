import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Only handle redirects on client side
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ==================== AUTH API ====================
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post("/auth/login", { username, password }),

  logout: () => apiClient.post("/auth/logout"),

  getCurrentUser: () => apiClient.get("/auth/me"),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put("/auth/update-password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

// ==================== USER API ====================
export const userApi = {
  getProfile: () => apiClient.get("/users/me"),

  getUsers: (params?: {
    skip?: number;
    limit?: number;
    department_id?: number;
    program_id?: number;
    cohort_id?: number;
    class_id?: number;
    role?: string;
  }) => apiClient.get("/admin/users", { params }),

  getUserById: (userId: number) => apiClient.get(`/users/${userId}`),

  createUser: (data: any) => apiClient.post("/admin/users", data),

  updateUser: (userId: number, data: any) =>
    apiClient.put(`/admin/users/${userId}`, data),

  deleteUser: (userId: number) => apiClient.delete(`/admin/users/${userId}`),
};

// ==================== DEPARTMENT API ====================
export const departmentApi = {
  list: (params?: { skip?: number; limit?: number; include_inactive?: boolean }) =>
    apiClient.get("/departments/", { params }),

  getWithStats: () => apiClient.get("/departments/with-stats"),

  getById: (id: number) => apiClient.get(`/departments/${id}`),

  create: (data: any) => apiClient.post("/departments/", data),

  update: (id: number, data: any) => apiClient.put(`/departments/${id}`, data),

  delete: (id: number) => apiClient.delete(`/departments/${id}`),

  activate: (id: number) => apiClient.post(`/departments/${id}/activate`),
};

// ==================== ACADEMIC API ====================
export const academicApi = {
  // Academic Years
  listYears: () => apiClient.get("/academic/years"),
  getCurrentYear: () => apiClient.get("/academic/years/current"),
  createYear: (data: any) => apiClient.post("/academic/years", data),
  updateYear: (id: number, data: any) =>
    apiClient.put(`/academic/years/${id}`, data),
  activateYear: (id: number) =>
    apiClient.post(`/academic/years/${id}/activate`),

  // Programs
  listPrograms: (params?: { department_id?: number }) =>
    apiClient.get("/academic/programs", { params }),
  getProgram: (id: number) => apiClient.get(`/academic/programs/${id}`),
  createProgram: (data: any) => apiClient.post("/academic/programs", data),
  updateProgram: (id: number, data: any) =>
    apiClient.put(`/academic/programs/${id}`, data),
  deleteProgram: (id: number) => apiClient.delete(`/academic/programs/${id}`),

  // Cohorts
  listCohorts: (params?: { program_id?: number; admission_year?: number }) =>
    apiClient.get("/academic/cohorts", { params }),
  getCohort: (id: number) => apiClient.get(`/academic/cohorts/${id}`),
  createCohort: (data: any) => apiClient.post("/academic/cohorts", data),
  updateCohort: (id: number, data: any) =>
    apiClient.put(`/academic/cohorts/${id}`, data),
  deleteCohort: (id: number) => apiClient.delete(`/academic/cohorts/${id}`),

  // Classes
  listClasses: (params?: { cohort_id?: number }) =>
    apiClient.get("/academic/classes", { params }),
  getClass: (id: number) => apiClient.get(`/academic/classes/${id}`),
  createClass: (data: any) => apiClient.post("/academic/classes", data),
  updateClass: (id: number, data: any) =>
    apiClient.put(`/academic/classes/${id}`, data),
  deleteClass: (id: number) => apiClient.delete(`/academic/classes/${id}`),
};

// ==================== POST API ====================
export const postApi = {
  list: (params?: { skip?: number; limit?: number; category?: string }) =>
    apiClient.get("/posts/", { params }),

  getById: (id: number) => apiClient.get(`/posts/${id}`),

  create: (data: any) => apiClient.post("/posts/", data),

  update: (id: number, data: any) => apiClient.put(`/posts/${id}`, data),

  delete: (id: number) => apiClient.delete(`/posts/${id}`),
};

// ==================== EVENT API ====================
export const eventApi = {
  list: (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    event_mode?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
    my_events?: boolean;
    my_registrations?: boolean;
    page?: number;
    page_size?: number;
  }) => apiClient.get("/events/", { params }),

  getById: (id: number) => apiClient.get(`/events/${id}`),

  create: (data: any) => apiClient.post("/events/", data),

  update: (id: number, data: any) => apiClient.put(`/events/${id}`, data),

  delete: (id: number) => apiClient.delete(`/events/${id}`),

  publish: (id: number) => apiClient.patch(`/events/${id}/publish`),

  cancel: (id: number) => apiClient.patch(`/events/${id}/cancel`),

  // Registrations & Attendees
  getRegistrations: (id: number, params?: { page?: number; page_size?: number }) =>
    apiClient.get(`/events/${id}/registrations`, { params }),

  getAttendees: (id: number) => apiClient.get(`/events/${id}/attendees`),

  approveRegistration: (eventId: number, registrationId: number) =>
    apiClient.post(`/events/${eventId}/registrations/${registrationId}/approve`),

  rejectRegistration: (eventId: number, registrationId: number) =>
    apiClient.post(`/events/${eventId}/registrations/${registrationId}/reject`),

  checkIn: (registrationId: number) =>
    apiClient.post(`/events/registrations/${registrationId}/check-in`),

  checkOut: (registrationId: number) =>
    apiClient.post(`/events/registrations/${registrationId}/check-out`),

  getCheckIns: (eventId: number) => apiClient.get(`/events/${eventId}/check-ins`),

  // Analytics & Feedback
  getAnalytics: (id: number) => apiClient.get(`/events/${id}/analytics`),

  getFeedback: (id: number, params?: { page?: number; page_size?: number }) =>
    apiClient.get(`/events/${id}/feedback`, { params }),

  getFeedbackSummary: (id: number) =>
    apiClient.get(`/events/${id}/feedback/summary`),

  submitFeedback: (eventId: number, data: { rating: number; comment?: string }) =>
    apiClient.post(`/events/${eventId}/feedback`, data),

  // Custom Fields (Questionnaire)
  getCustomFields: (eventId: number) =>
    apiClient.get(`/events/${eventId}/custom-fields`),

  addCustomField: (eventId: number, data: any) =>
    apiClient.post(`/events/${eventId}/custom-fields`, data),

  updateCustomField: (eventId: number, fieldId: number, data: any) =>
    apiClient.put(`/events/${eventId}/custom-fields/${fieldId}`, data),

  deleteCustomField: (eventId: number, fieldId: number) =>
    apiClient.delete(`/events/${eventId}/custom-fields/${fieldId}`),

  // Notifications
  sendNotification: (eventId: number, data: { subject: string; message: string; target?: string }) =>
    apiClient.post(`/events/${eventId}/notify`, data),

  getNotifications: (eventId: number) =>
    apiClient.get(`/events/${eventId}/notifications`),

  // Updates
  getUpdates: (eventId: number) => apiClient.get(`/events/${eventId}/updates`),
};

// ==================== GROUP API ====================
export const groupApi = {
  // List all groups with optional filters
  list: (params?: {
    skip?: number;
    limit?: number;
    group_type?: string;
    is_open?: boolean;
    search?: string;
  }) => apiClient.get("/groups/", { params }),

  // Get user's groups
  getMyGroups: () => apiClient.get("/groups/my-groups"),

  // Get single group with details
  getById: (id: number) => apiClient.get(`/groups/${id}`),

  // Create new group
  create: (data: any) => apiClient.post("/groups/", data),

  // Update group
  update: (id: number, data: any) => apiClient.put(`/groups/${id}`, data),

  // Delete group (soft delete)
  delete: (id: number) => apiClient.delete(`/groups/${id}`),

  // Join a group (self-service for open groups)
  join: (id: number) => apiClient.post(`/groups/${id}/join`),

  // Member Management
  getMembers: (id: number, params?: { role?: string }) =>
    apiClient.get(`/groups/${id}/members`, { params }),

  addMember: (groupId: number, userId: number, role?: string) =>
    apiClient.post(`/groups/${groupId}/members`, null, {
      params: { user_id: userId, role: role || "MEMBER" },
    }),

  updateMemberRole: (groupId: number, userId: number, data: { role?: string; is_active?: boolean }) =>
    apiClient.put(`/groups/${groupId}/members/${userId}`, data),

  removeMember: (groupId: number, userId: number) =>
    apiClient.delete(`/groups/${groupId}/members/${userId}`),
};

// ==================== ADMIN API ====================
export const adminApi = {
  // Dashboard & Bulk Operations
  getDashboardStats: () => apiClient.get("/admin/stats"),
  bulkCreateUsers: (data: any) => apiClient.post("/admin/bulk-users", data),

  // User Management
  createUser: (data: any) => apiClient.post("/admin/users", data),
  listUsers: (params?: { skip?: number; limit?: number; role?: string }) =>
    apiClient.get("/admin/users", { params }),
  updateUserRole: (userId: number, role: string) =>
    apiClient.put(`/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId: number, is_active: boolean) =>
    apiClient.put(`/admin/users/${userId}/status`, { is_active }),
  deleteUser: (userId: number) => apiClient.delete(`/admin/users/${userId}`),

  // Permissions Management
  getUserPermissions: (userId: number) =>
    apiClient.get(`/admin/users/${userId}/permissions`),
  grantOrRevokePermission: (userId: number, data: { permission_name: string; grant: boolean }) =>
    apiClient.post(`/admin/users/${userId}/permissions`, data),
  removeCustomPermission: (userId: number, permissionName: string) =>
    apiClient.delete(`/admin/users/${userId}/permissions/${permissionName}`),
  
  // System Configuration
  listAllPermissions: () => apiClient.get("/admin/permissions"),
  listRoles: () => apiClient.get("/admin/roles"),
};

// ==================== ALERT API ====================
export const alertApi = {
  // Get user alerts with optional filters
  getUserAlerts: (params?: {
    skip?: number;
    limit?: number;
    alert_type?: string;
    is_read?: boolean;
    include_expired?: boolean;
  }) => apiClient.get("/alerts/", { params }),

  // Create a new alert
  createAlert: (data: {
    title: string;
    message: string;
    alert_type?: string;
    expires_at?: string;
    post_id?: number;
    target_group_id?: number;
    user_id?: number;
  }) => apiClient.post("/alerts/", data),

  // Update an existing alert
  updateAlert: (
    alertId: number,
    data: {
      title?: string;
      message?: string;
      alert_type?: string;
      is_enabled?: boolean;
      is_read?: boolean;
      expires_at?: string;
    }
  ) => apiClient.put(`/alerts/${alertId}`, data),

  // Delete an alert
  deleteAlert: (alertId: number) => apiClient.delete(`/alerts/${alertId}`),

  // Mark all alerts as read
  markAllRead: () => apiClient.post("/alerts/mark-all-read"),

  // Get unread alert count
  getUnreadCount: () => apiClient.get("/alerts/unread-count"),

  // Create group alert (broadcast to all members)
  createGroupAlert: (data: {
    title: string;
    message: string;
    alert_type?: string;
    expires_at?: string;
    post_id?: number;
    target_group_id: number;
  }) => apiClient.post("/alerts/group-alerts", data),

  // Create post alert
  createPostAlert: (
    postId: number,
    data: {
      user_id: number;
      title: string;
      message: string;
      alert_type?: string;
      expires_at?: string;
    }
  ) => apiClient.post(`/alerts/post-alerts/${postId}`, data),
};

// ==================== AI API ====================
export const aiApi = {
  // Ask AI a question
  ask: (question: string, context?: string) =>
    apiClient.post("/ai/ask", { question, context }),

  // Search using AI
  search: (query: string, filters?: any) =>
    apiClient.post("/ai/search", { query, ...filters }),

  // Get AI stats
  getStats: () => apiClient.get("/ai/stats"),
};
