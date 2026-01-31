"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Globe,
  Lock,
  MoreVertical,
  Crown,
  Settings,
  UserMinus,
  Bell,
} from "lucide-react";
import { groupApi, userApi, alertApi } from "@/lib/api/client";
import { GroupWithMembers, MemberInfo, GroupRole, User, AlertType } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/lib/auth/AuthContext";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const groupId = parseInt(params.id as string);

  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<GroupRole>("MEMBER");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [alertFormData, setAlertFormData] = useState({
    title: "",
    message: "",
    alert_type: AlertType.ANNOUNCEMENT,
    expires_at: "",
  });

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  // Debounce user search to avoid excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userSearchTerm.length >= 2) {
        searchForUsers(userSearchTerm);
      } else {
        setSearchUsers([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [userSearchTerm]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await groupApi.getById(groupId);
      setGroup(response.data);
    } catch (error) {
      console.error("Failed to load group details:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchForUsers = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchUsers([]);
      return;
    }
    try {
      setSearchingUsers(true);
      // Fetch all users (increase limit to get comprehensive results)
      const response = await userApi.getUsers({ limit: 1000 });
      const users = response.data || [];
      const searchLower = term.toLowerCase();
      
      // Filter users based on search term
      const filtered = users.filter(
        (user: User) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.full_name.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
      
      // Limit results to top 50 matches for UI performance
      setSearchUsers(filtered.slice(0, 50));
    } catch (error) {
      console.error("Failed to search users:", error);
      setSearchUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await groupApi.addMember(groupId, selectedUserId, selectedRole);
      setShowAddMemberModal(false);
      setSelectedUserId(null);
      setSelectedRole("MEMBER");
      setUserSearchTerm("");
      setSearchUsers([]);
      loadGroupDetails();
    } catch (error) {
      console.error("Failed to add member:", error);
      alert("Failed to add member. They may already be in the group.");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    try {
      await groupApi.updateMemberRole(groupId, selectedMember.user_id, {
        role: selectedRole,
      });
      setShowEditRoleModal(false);
      setSelectedMember(null);
      setSelectedRole("MEMBER");
      loadGroupDetails();
    } catch (error) {
      console.error("Failed to update member role:", error);
      alert("Failed to update member role. Please try again.");
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    try {
      await groupApi.removeMember(groupId, selectedMember.user_id);
      setShowRemoveMemberModal(false);
      setSelectedMember(null);
      loadGroupDetails();
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert("Failed to remove member. Please try again.");
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    try {
      await alertApi.createGroupAlert({
        title: alertFormData.title,
        message: alertFormData.message,
        alert_type: alertFormData.alert_type,
        expires_at: alertFormData.expires_at || undefined,
        target_group_id: groupId,
      });
      
      setShowAlertModal(false);
      setAlertFormData({
        title: "",
        message: "",
        alert_type: AlertType.ANNOUNCEMENT,
        expires_at: "",
      });
      
      alert(`Alert sent successfully to all ${group.member_count || 0} group members!`);
    } catch (error: any) {
      console.error("Failed to send group alert:", error);
      alert(`Failed to send alert: ${error.message || "Unknown error"}`);
    }
  };

  const openEditRoleModal = (member: MemberInfo) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setShowEditRoleModal(true);
  };

  const openRemoveMemberModal = (member: MemberInfo) => {
    setSelectedMember(member);
    setShowRemoveMemberModal(true);
  };

  const getRoleColor = (role: GroupRole) => {
    switch (role) {
      case "OWNER":
        return "bg-yellow-100 text-yellow-800";
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MODERATOR":
        return "bg-blue-100 text-blue-800";
      case "MEMBER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: GroupRole) => {
    switch (role) {
      case "OWNER":
        return <Crown className="w-4 h-4" />;
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      case "MODERATOR":
        return <Settings className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // System admins and staff can manage all groups, or group OWNER/ADMIN
  const canManageMembers = 
    user?.role === "admin" || 
    user?.role === "staff" || 
    group?.my_role === "OWNER" || 
    group?.my_role === "ADMIN";
  
  const canEditRoles = 
    user?.role === "admin" || 
    user?.role === "staff" || 
    group?.my_role === "OWNER" || 
    group?.my_role === "ADMIN";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h2>
        <button
          onClick={() => router.push("/dashboard/groups")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {group.banner_url && (
          <img
            src={group.banner_url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.push("/dashboard/groups")}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-90 text-gray-900 rounded-lg hover:bg-opacity-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Groups
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 pb-12">
        {/* Group Header Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {group.logo && (
                <img
                  src={group.logo}
                  alt={group.name}
                  className="w-20 h-20 rounded-lg object-cover border-4 border-white shadow-md"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {group.group_type}
                  </span>
                  {group.is_open ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      <Globe className="w-4 h-4" />
                      Open Group
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      Closed Group
                    </span>
                  )}
                  {group.my_role && (
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                        group.my_role
                      )}`}
                    >
                      {getRoleIcon(group.my_role)}
                      {group.my_role}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canManageMembers && (
                <>
                  <button
                    onClick={() => setShowAlertModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    Send Alert
                  </button>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add Member
                  </button>
                </>
              )}
            </div>
          </div>

          {group.description && (
            <p className="mt-4 text-gray-600">{group.description}</p>
          )}

          <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>
                <strong className="text-gray-900">{group.member_count || 0}</strong> members
              </span>
            </div>
            <div>
              Created on {new Date(group.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Members</h2>
            {canManageMembers && group.members && group.members.length > 0 && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>

          {!group.members || group.members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No members yet</h3>
              <p className="text-gray-500 mb-4">
                This group doesn't have any members yet.
              </p>
              {canManageMembers ? (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Add First Member
                </button>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Only group owners and admins can add members.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {group.members.map((member) => (
                <div
                  key={member.user_id}
                  className="py-4 flex items-center justify-between hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {member.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                      <p className="text-sm text-gray-600">@{member.username}</p>
                      {member.email && (
                        <p className="text-xs text-gray-500">{member.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                        member.role
                      )}`}
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </span>

                    {canManageMembers && member.role !== "OWNER" && (
                      <div className="flex items-center gap-1">
                        {canEditRoles && (
                          <button
                            onClick={() => openEditRoleModal(member)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openRemoveMemberModal(member)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedUserId(null);
          setSelectedRole("MEMBER");
          setUserSearchTerm("");
          setSearchUsers([]);
        }}
        title="Add Member to Group"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search User
            </label>
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => {
                setUserSearchTerm(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by username, name, or email..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Type at least 2 characters to search across all users
            </p>
          </div>

          {searchingUsers && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Searching users...</span>
            </div>
          )}

          {!searchingUsers && searchUsers.length > 0 && (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y">
              {searchUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setUserSearchTerm(user.full_name);
                    setSearchUsers([]);
                  }}
                  className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedUserId === user.id ? "bg-blue-100" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">{user.full_name}</div>
                  <div className="text-sm text-gray-600">@{user.username}</div>
                  {user.email && (
                    <div className="text-xs text-gray-500">{user.email}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!searchingUsers && userSearchTerm.length >= 2 && searchUsers.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              No users found matching "{userSearchTerm}"
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as GroupRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MEMBER">Member</option>
              <option value="MODERATOR">Moderator</option>
              {(user?.role === "admin" || user?.role === "staff" || group.my_role === "OWNER") && (
                <option value="ADMIN">Admin</option>
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowAddMemberModal(false);
                setSelectedUserId(null);
                setSelectedRole("MEMBER");
                setUserSearchTerm("");
                setSearchUsers([]);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={!selectedUserId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditRoleModal}
        onClose={() => {
          setShowEditRoleModal(false);
          setSelectedMember(null);
          setSelectedRole("MEMBER");
        }}
        title="Update Member Role"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Update role for <strong>{selectedMember?.full_name}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as GroupRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MEMBER">Member</option>
              <option value="MODERATOR">Moderator</option>
              {(user?.role === "admin" || user?.role === "staff" || group.my_role === "OWNER") && (
                <option value="ADMIN">Admin</option>
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditRoleModal(false);
                setSelectedMember(null);
                setSelectedRole("MEMBER");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Role
            </button>
          </div>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={showRemoveMemberModal}
        onClose={() => {
          setShowRemoveMemberModal(false);
          setSelectedMember(null);
        }}
        title="Remove Member"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove <strong>{selectedMember?.full_name}</strong>{" "}
            from this group? They will no longer have access to group content.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowRemoveMemberModal(false);
                setSelectedMember(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveMember}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Send Alert Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setAlertFormData({
            title: "",
            message: "",
            alert_type: AlertType.ANNOUNCEMENT,
            expires_at: "",
          });
        }}
        title={`Send Alert to Group (${group?.member_count || 0} members)`}
      >
        <form onSubmit={handleSendAlert} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            This alert will be sent to all {group?.member_count || 0} members of this group.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Title *
            </label>
            <input
              type="text"
              value={alertFormData.title}
              onChange={(e) =>
                setAlertFormData({ ...alertFormData, title: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Important Group Announcement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              value={alertFormData.message}
              onChange={(e) =>
                setAlertFormData({ ...alertFormData, message: e.target.value })
              }
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your message here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Type
            </label>
            <select
              value={alertFormData.alert_type}
              onChange={(e) =>
                setAlertFormData({
                  ...alertFormData,
                  alert_type: e.target.value as AlertType,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(AlertType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={alertFormData.expires_at}
              onChange={(e) =>
                setAlertFormData({ ...alertFormData, expires_at: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for no expiration
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAlertModal(false);
                setAlertFormData({
                  title: "",
                  message: "",
                  alert_type: AlertType.ANNOUNCEMENT,
                  expires_at: "",
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Send Alert to {group?.member_count || 0} Members
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
