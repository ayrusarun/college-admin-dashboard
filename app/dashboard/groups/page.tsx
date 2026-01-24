"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Shield,
  Globe,
  Lock,
} from "lucide-react";
import { groupApi } from "@/lib/api/client";
import { Group, GroupType } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<GroupType | "ALL">("ALL");
  const [filterOpen, setFilterOpen] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    group_type: "CLUB" as GroupType,
    description: "",
    logo: "",
    banner_url: "",
    is_open: true,
    requires_approval: false,
    allowed_post_roles: ["OWNER", "ADMIN", "MODERATOR"],
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupApi.list();
      setGroups(response.data || []);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await groupApi.create(formData);
      setShowCreateModal(false);
      resetForm();
      loadGroups();
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  const handleEdit = async () => {
    if (!selectedGroup) return;
    try {
      await groupApi.update(selectedGroup.id, formData);
      setShowEditModal(false);
      setSelectedGroup(null);
      resetForm();
      loadGroups();
    } catch (error) {
      console.error("Failed to update group:", error);
      alert("Failed to update group. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;
    try {
      await groupApi.delete(selectedGroup.id);
      setShowDeleteModal(false);
      setSelectedGroup(null);
      loadGroups();
    } catch (error) {
      console.error("Failed to delete group:", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      group_type: group.group_type,
      description: group.description || "",
      logo: group.logo || "",
      banner_url: group.banner_url || "",
      is_open: group.is_open,
      requires_approval: group.requires_approval,
      allowed_post_roles: group.allowed_post_roles,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (group: Group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      group_type: "CLUB",
      description: "",
      logo: "",
      banner_url: "",
      is_open: true,
      requires_approval: false,
      allowed_post_roles: ["OWNER", "ADMIN", "MODERATOR"],
    });
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      searchTerm === "" ||
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "ALL" || group.group_type === filterType;

    const matchesOpen =
      filterOpen === "ALL" ||
      (filterOpen === "OPEN" && group.is_open) ||
      (filterOpen === "CLOSED" && !group.is_open);

    return matchesSearch && matchesType && matchesOpen;
  });

  const getGroupTypeColor = (type: GroupType) => {
    switch (type) {
      case "ACADEMIC":
        return "bg-blue-100 text-blue-700";
      case "CLUB":
        return "bg-purple-100 text-purple-700";
      case "EVENT":
        return "bg-green-100 text-green-700";
      case "CUSTOM":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Groups</h1>
        <p className="text-gray-600">
          Manage academic groups, clubs, and custom communities
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as GroupType | "ALL")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="ACADEMIC">Academic</option>
            <option value="CLUB">Club</option>
            <option value="EVENT">Event</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <select
            value={filterOpen}
            onChange={(e) => setFilterOpen(e.target.value as "ALL" | "OPEN" | "CLOSED")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Groups</option>
            <option value="OPEN">Open Groups</option>
            <option value="CLOSED">Closed Groups</option>
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No groups found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== "ALL" || filterOpen !== "ALL"
              ? "Try adjusting your filters"
              : "Get started by creating your first group"}
          </p>
          {!searchTerm && filterType === "ALL" && filterOpen === "ALL" && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Group
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Banner */}
              {group.banner_url ? (
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <img
                    src={group.banner_url}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              )}

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGroupTypeColor(
                          group.group_type
                        )}`}
                      >
                        {group.group_type}
                      </span>
                      {group.is_open ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Globe className="w-3 h-3" />
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <Lock className="w-3 h-3" />
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {group.description || "No description provided"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{group.member_count || 0} members</span>
                  </div>
                  {group.my_role && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                      <Shield className="w-3 h-3" />
                      {group.my_role}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {(group.my_role === "OWNER" || group.my_role === "ADMIN") && (
                    <>
                      <button
                        onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Manage Members"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(group)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {group.my_role === "OWNER" && group.group_type !== "ACADEMIC" && (
                        <button
                          onClick={() => openDeleteModal(group)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedGroup(null);
          resetForm();
        }}
        title={showCreateModal ? "Create New Group" : "Edit Group"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Type *
            </label>
            <select
              value={formData.group_type}
              onChange={(e) =>
                setFormData({ ...formData, group_type: e.target.value as GroupType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={showEditModal}
            >
              <option value="ACADEMIC">Academic</option>
              <option value="CLUB">Club</option>
              <option value="EVENT">Event</option>
              <option value="CUSTOM">Custom</option>
            </select>
            {showEditModal && (
              <p className="text-xs text-gray-500 mt-1">Group type cannot be changed</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter group description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner URL
              </label>
              <input
                type="text"
                value={formData.banner_url}
                onChange={(e) =>
                  setFormData({ ...formData, banner_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/banner.png"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_open}
                onChange={(e) =>
                  setFormData({ ...formData, is_open: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Open for anyone to join</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requires_approval}
                onChange={(e) =>
                  setFormData({ ...formData, requires_approval: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={!formData.is_open}
              />
              <span className="text-sm text-gray-700">Requires approval</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedGroup(null);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={showCreateModal ? handleCreate : handleEdit}
              disabled={!formData.name || !formData.group_type}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showCreateModal ? "Create Group" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleDelete}
        title="Confirm Delete Group"
        message={`Are you sure you want to delete <strong>${selectedGroup?.name || ''}</strong>? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
