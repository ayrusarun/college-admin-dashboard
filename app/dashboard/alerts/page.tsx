"use client";

import { useState, useEffect } from "react";
import { alertApi, groupApi, userApi } from "@/lib/api/client";
import { AlertResponse, AlertType, AlertListResponse, Group, User as UserType } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { Bell, Calendar, MessageSquare, Tag, Users, User, Sparkles, Search, X } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [readFilter, setReadFilter] = useState<string>("ALL"); // ALL, READ, UNREAD
  const [includeExpired, setIncludeExpired] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertResponse | null>(null);

  // Groups data
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<UserType[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    alert_type: AlertType.GENERAL,
    expires_at: "",
    user_id: undefined as number | undefined,
    target_group_id: undefined as number | undefined,
  });

  useEffect(() => {
    fetchAlerts();
    fetchGroups();
  }, [page, selectedType, readFilter, includeExpired]);

  // Debounce user search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userSearchQuery.length >= 2) {
        searchUsers(userSearchQuery);
      } else {
        setSearchedUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery]);

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchedUsers([]);
      return;
    }
    
    try {
      setSearchingUsers(true);
      const response = await userApi.getUsers({ limit: 1000 });
      const users = response.data || [];
      const searchLower = query.toLowerCase();
      
      const filtered = users.filter(
        (user: UserType) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.full_name.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
      
      setSearchedUsers(filtered.slice(0, 50));
    } catch (err: any) {
      console.error("Failed to search users:", err);
      setSearchedUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await groupApi.list({ skip: 0, limit: 1000 });
      setGroups(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        include_expired: includeExpired,
      };

      if (selectedType !== "ALL") {
        params.alert_type = selectedType;
      }

      if (readFilter === "READ") {
        params.is_read = true;
      } else if (readFilter === "UNREAD") {
        params.is_read = false;
      }

      const response = await alertApi.getUserAlerts(params);
      const data: AlertListResponse = response.data;
      
      setAlerts(data.alerts || []);
      setTotalCount(data.total_count || 0);
      setUnreadCount(data.unread_count || 0);
    } catch (err: any) {
      setError(err.message || "Failed to fetch alerts");
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await alertApi.updateAlert(alertId, { is_read: true });
      fetchAlerts();
    } catch (err: any) {
      alert(`Failed to mark as read: ${err.message}`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!confirm(`Mark all ${unreadCount} unread alerts as read?`)) return;
    
    try {
      await alertApi.markAllRead();
      fetchAlerts();
    } catch (err: any) {
      alert(`Failed to mark all as read: ${err.message}`);
    }
  };

  const handleDelete = async (alertId: number) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    try {
      await alertApi.deleteAlert(alertId);
      fetchAlerts();
    } catch (err: any) {
      alert(`Failed to delete alert: ${err.message}`);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await alertApi.createAlert({
        title: formData.title,
        message: formData.message,
        alert_type: formData.alert_type,
        expires_at: formData.expires_at || undefined,
        user_id: formData.user_id,
        target_group_id: formData.target_group_id,
      });
      setShowCreateModal(false);
      resetForm();
      fetchAlerts();
    } catch (err: any) {
      alert(`Failed to create alert: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      alert_type: AlertType.GENERAL,
      expires_at: "",
      user_id: undefined,
      target_group_id: undefined,
    });
    setSelectedUser(null);
    setUserSearchQuery("");
    setSearchedUsers([]);
    setShowUserDropdown(false);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      alert.title.toLowerCase().includes(query) ||
      alert.message.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const getAlertTypeBadgeColor = (type: AlertType) => {
    switch (type) {
      case AlertType.EVENT_NOTIFICATION:
        return "bg-blue-100 text-blue-800";
      case AlertType.FEE_REMINDER:
        return "bg-red-100 text-red-800";
      case AlertType.ANNOUNCEMENT:
        return "bg-purple-100 text-purple-800";
      case AlertType.DEADLINE_REMINDER:
        return "bg-orange-100 text-orange-800";
      case AlertType.ACADEMIC_UPDATE:
        return "bg-green-100 text-green-800";
      case AlertType.SYSTEM_NOTIFICATION:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-gray-600">
            {unreadCount > 0 && (
              <span className="text-red-600 font-semibold">
                {unreadCount} unread
              </span>
            )}
            {unreadCount === 0 && <span>No unread alerts</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Alert
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or message..."
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ALL">All Types</option>
              {Object.values(AlertType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={readFilter}
              onChange={(e) => {
                setReadFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ALL">All</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expired</label>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={includeExpired}
                onChange={(e) => {
                  setIncludeExpired(e.target.checked);
                  setPage(1);
                }}
                className="mr-2"
              />
              <span>Include Expired</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {loading && <div className="text-center py-8">Loading alerts...</div>}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>
      )}

      {!loading && filteredAlerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">No alerts found</div>
      )}

      {!loading && filteredAlerts.length > 0 && (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border rounded-lg ${
                !alert.is_read ? "bg-blue-50 border-blue-200" : "bg-white"
              } ${alert.is_expired ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{alert.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${getAlertTypeBadgeColor(
                        alert.alert_type
                      )}`}
                    >
                      {alert.alert_type.replace(/_/g, " ")}
                    </span>
                    {!alert.is_read && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        NEW
                      </span>
                    )}
                    {alert.is_expired && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        EXPIRED
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{alert.message}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>By: {alert.creator_name}</span>
                    <span>{alert.time_ago}</span>
                    {alert.expires_at && (
                      <span>
                        Expires: {new Date(alert.expires_at).toLocaleDateString()}
                      </span>
                    )}
                    {alert.target_group_name && (
                      <span>Group: {alert.target_group_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowDetailModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    View
                  </button>
                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Alert Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Alert"
      >
        <form onSubmit={handleCreateAlert} className="space-y-6 font-sans">
          {/* Header with icon */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">New Alert</h3>
              <p className="text-sm text-gray-600 font-normal">Create and send notifications to users</p>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 tracking-tight">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Alert Title
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="e.g., Important Announcement"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 font-normal"
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 tracking-tight">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Message
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={4}
              placeholder="Write your message here..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 resize-none font-normal leading-relaxed"
            />
            <p className="text-xs text-gray-600 font-normal">Be clear and concise for better engagement</p>
          </div>

          {/* Two Column Layout for Type and Expiration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alert Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 tracking-tight">
                <Tag className="w-4 h-4 text-purple-500" />
                Alert Type
              </label>
              <select
                value={formData.alert_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alert_type: e.target.value as AlertType,
                  })
                }
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-normal"
              >
                {Object.values(AlertType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 tracking-tight">
                <Calendar className="w-4 h-4 text-orange-500" />
                Expiration Date
                <span className="text-xs text-gray-600 font-normal">(Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData({ ...formData, expires_at: e.target.value })
                }
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-normal"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-600 font-medium tracking-wider uppercase">Targeting Options</span>
            </div>
          </div>

          {/* Two Column Layout for User and Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target User Search */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 tracking-tight">
                <User className="w-4 h-4 text-green-500" />
                Target User
                <span className="text-xs text-gray-600 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                {selectedUser ? (
                  <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl bg-green-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                        {selectedUser.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.full_name}</p>
                        <p className="text-xs text-gray-600">@{selectedUser.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setFormData({ ...formData, user_id: undefined });
                        setUserSearchQuery("");
                      }}
                      className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value);
                          setShowUserDropdown(true);
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder="Search by name, username, or email..."
                        className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 font-normal"
                      />
                    </div>
                    
                    {/* User Dropdown */}
                    {showUserDropdown && userSearchQuery.length >= 2 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        {searchingUsers && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Searching...
                          </div>
                        )}
                        
                        {!searchingUsers && searchedUsers.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No users found
                          </div>
                        )}
                        
                        {!searchingUsers && searchedUsers.length > 0 && (
                          <div className="py-1">
                            {searchedUsers.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setFormData({ ...formData, user_id: user.id });
                                  setShowUserDropdown(false);
                                  setUserSearchQuery("");
                                }}
                                className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                  {user.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.full_name}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate">
                                    @{user.username} • {user.email}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              {!selectedUser && (
                <p className="text-xs text-gray-600 font-normal">
                  Search and select a user to send alert
                </p>
              )}
            </div>

            {/* Target Group */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 tracking-tight">
                <Users className="w-4 h-4 text-indigo-500" />
                Target Group
                <span className="text-xs text-gray-600 font-normal">(Optional)</span>
              </label>
              <select
                value={formData.target_group_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_group_id: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-normal"
                disabled={loadingGroups}
              >
                <option value="">No group (individual alert)</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.group_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-blue-900 tracking-tight">Broadcast Tips</p>
                <ul className="text-xs text-blue-800 space-y-1 font-normal leading-relaxed">
                  <li>• Leave both fields empty to send to yourself</li>
                  <li>• Select a group to broadcast to all members</li>
                  <li>• Use expiration date for time-sensitive alerts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 text-base font-semibold rounded-xl hover:bg-gray-50 transition-all tracking-tight"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 tracking-tight"
            >
              Create Alert
            </button>
          </div>
        </form>
      </Modal>

      {/* Alert Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAlert(null);
        }}
        title="Alert Details"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Title
              </label>
              <p className="text-lg font-semibold">{selectedAlert.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Message
              </label>
              <p className="text-gray-800">{selectedAlert.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Type
                </label>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded ${getAlertTypeBadgeColor(
                    selectedAlert.alert_type
                  )}`}
                >
                  {selectedAlert.alert_type.replace(/_/g, " ")}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded ${
                    selectedAlert.is_read
                      ? "bg-gray-100 text-gray-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedAlert.is_read ? "Read" : "Unread"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Created By
              </label>
              <p>{selectedAlert.creator_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Created At
              </label>
              <p>
                {new Date(selectedAlert.created_at).toLocaleString()} (
                {selectedAlert.time_ago})
              </p>
            </div>

            {selectedAlert.expires_at && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Expires At
                </label>
                <p
                  className={
                    selectedAlert.is_expired ? "text-red-600" : "text-gray-800"
                  }
                >
                  {new Date(selectedAlert.expires_at).toLocaleString()}
                  {selectedAlert.is_expired && " (Expired)"}
                </p>
              </div>
            )}

            {selectedAlert.target_group_name && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Target Group
                </label>
                <p>
                  {selectedAlert.target_group_name}
                  {selectedAlert.target_group_type &&
                    ` (${selectedAlert.target_group_type})`}
                </p>
              </div>
            )}

            {selectedAlert.post_title && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Related Post
                </label>
                <p>{selectedAlert.post_title}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              {!selectedAlert.is_read && (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedAlert.id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(selectedAlert.id);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
