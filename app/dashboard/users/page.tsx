"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users as UsersIcon,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Trash2,
  Settings,
} from "lucide-react";
import { userApi, departmentApi, adminApi } from "@/lib/api/client";
import { User, Department } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import { formatDate, capitalize } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingUserName, setDeletingUserName] = useState<string>("");
  const [filters, setFilters] = useState({
    role: "",
    department_id: "",
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        userApi.getUsers({
          limit: 100,
          role: filters.role || undefined,
          department_id: filters.department_id
            ? parseInt(filters.department_id)
            : undefined,
        }),
        departmentApi.list({ limit: 100 }),
      ]);

      setUsers(usersRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    setDeletingUserId(userId);
    setDeletingUserName(userName);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUserId) return;

    try {
      await adminApi.deleteUser(deletingUserId);
      alert("User deleted successfully!");
      loadData(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      alert(error.response?.data?.detail || "Failed to delete user");
    }
  };

  const toggleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) {
      alert("Please select users to delete");
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Delete users one by one
      for (const userId of Array.from(selectedUsers)) {
        try {
          await adminApi.deleteUser(userId);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete user ${userId}:`, error);
          failCount++;
        }
      }

      alert(`Deleted ${successCount} user(s) successfully.${failCount > 0 ? ` ${failCount} failed.` : ""}`);
      setSelectedUsers(new Set());
      loadData();
    } catch (error) {
      console.error("Bulk delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "teacher":
        return "bg-green-100 text-green-800";
      case "student":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
          onChange={toggleSelectAll}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          title="Select All"
        />
      ),
      render: (user: User) => (
        <input
          type="checkbox"
          checked={selectedUsers.has(user.id)}
          onChange={() => toggleSelectUser(user.id)}
          onClick={(e) => e.stopPropagation()} // Prevent row click
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
    },
    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (user: User) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
          <p className="text-sm text-gray-500">{user.username}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (user: User) => (
        <span className="text-sm text-gray-900">{user.email}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (user: User) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
            user.role
          )}`}
        >
          {capitalize(user.role)}
        </span>
      ),
    },
    {
      key: "department_name",
      label: "Department",
      render: (user: User) => (
        <span className="text-sm text-gray-900">
          {user.department_name || "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (user: User) => (
        <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user: User) => (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            router.push(`/dashboard/users/${user.id}`);
          }}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          title="View Details"
        >
          <Settings className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <UsersIcon className="h-7 w-7 mr-2 text-blue-600" />
            User Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage all users in your college ({filteredUsers.length} total)
          </p>
        </div>
        <div className="flex space-x-3">
          {selectedUsers.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : `Delete ${selectedUsers.size} Selected`}
            </button>
          )}
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => router.push("/dashboard/users/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {users.filter((u) => u.role === "student").length}
            </p>
            <p className="text-sm font-medium text-gray-600">Students</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {users.filter((u) => u.role === "teacher").length}
            </p>
            <p className="text-sm font-medium text-gray-600">Teachers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {users.filter((u) => u.role === "staff").length}
            </p>
            <p className="text-sm font-medium text-gray-600">Staff</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {users.filter((u) => u.role === "admin").length}
            </p>
            <p className="text-sm font-medium text-gray-600">Admins</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters({ ...filters, role: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={filters.department_id}
              onChange={(e) =>
                setFilters({ ...filters, department_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={loading}
      />

      {/* Delete Single User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteUser}
        title="Confirm Delete User"
        message={`Are you sure you want to delete user <strong>${deletingUserName}</strong>? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Confirm Bulk Delete"
        message={`Are you sure you want to delete <strong>${selectedUsers.size}</strong> user(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
