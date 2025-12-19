"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  User as UserIcon,
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  Shield,
  Check,
  X,
  RefreshCw,
  Edit,
  Save,
} from "lucide-react";
import { userApi, adminApi, departmentApi } from "@/lib/api/client";
import { User, Department } from "@/lib/types";
import { formatDate, formatDateTime, capitalize } from "@/lib/utils";

interface UserPermission {
  permission_name: string;
  source: string;
}

interface Permission {
  name: string;
  description: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);

  const [user, setUser] = useState<User | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [userRes, permsRes, allPermsRes, rolesRes] = await Promise.all([
        userApi.getUserById(userId),
        adminApi.getUserPermissions(userId),
        adminApi.listAllPermissions(),
        adminApi.listRoles(),
      ]);

      setUser(userRes.data);
      setPermissions(permsRes.data.permissions || []);
      setAllPermissions(allPermsRes.data.permissions || []);
      setAllRoles(rolesRes.data.roles || []);
      setNewRole(userRes.data.role);

      // Load department if available
      if (userRes.data.department_id) {
        const deptRes = await departmentApi.getById(userRes.data.department_id);
        setDepartment(deptRes.data);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      alert("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!newRole || newRole === user?.role) {
      setEditingRole(false);
      return;
    }

    try {
      await adminApi.updateUserRole(userId, newRole);
      alert("User role updated successfully!");
      setEditingRole(false);
      loadUserData();
    } catch (error: any) {
      console.error("Failed to update role:", error);
      alert(error.response?.data?.detail || "Failed to update role");
    }
  };

  const handleTogglePermission = async (permissionName: string, currentlyHas: boolean) => {
    try {
      await adminApi.grantOrRevokePermission(userId, {
        permission_name: permissionName,
        grant: !currentlyHas,
      });
      alert(`Permission ${!currentlyHas ? "granted" : "revoked"} successfully!`);
      loadUserData();
    } catch (error: any) {
      console.error("Failed to toggle permission:", error);
      alert(error.response?.data?.detail || "Failed to update permission");
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    try {
      await adminApi.updateUserStatus(userId, !user.is_active);
      alert(`User ${!user.is_active ? "activated" : "deactivated"} successfully!`);
      loadUserData();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      alert(error.response?.data?.detail || "Failed to update status");
    }
  };

  const hasPermission = (permName: string) => {
    return permissions.some((p) => p.permission_name === permName);
  };

  const getPermissionSource = (permName: string) => {
    const perm = permissions.find((p) => p.permission_name === permName);
    return perm?.source || "none";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "staff":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "teacher":
        return "bg-green-100 text-green-800 border-green-200";
      case "student":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
        <button
          onClick={() => router.push("/dashboard/users")}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserIcon className="h-7 w-7 mr-2 text-blue-600" />
              {user.full_name || user.username}
            </h2>
            <p className="text-gray-600 mt-1">User Details & Permissions</p>
          </div>
        </div>
        <button
          onClick={loadUserData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Username</label>
            <p className="mt-1 text-gray-900">{user.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="mt-1 text-gray-900">{user.full_name || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="mt-1 flex items-center text-gray-900">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              {user.email}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Department</label>
            <div className="mt-1 flex items-center text-gray-900">
              <Building2 className="h-4 w-4 mr-2 text-gray-400" />
              {department?.name || user.department_name || "-"}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <div className="mt-1 flex items-center space-x-2">
              {editingRole ? (
                <>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {allRoles.map((role) => (
                      <option key={role.name} value={role.name}>
                        {capitalize(role.name)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdateRole}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Save"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingRole(false);
                      setNewRole(user.role);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Cancel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {capitalize(user.role)}
                  </span>
                  <button
                    onClick={() => setEditingRole(true)}
                    className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                    title="Edit Role"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1 flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
              <button
                onClick={handleToggleStatus}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {user.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <div className="mt-1 flex items-center text-gray-900">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {formatDateTime(user.created_at)}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <div className="mt-1 flex items-center text-gray-900">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {formatDateTime(user.updated_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Permissions Management
          </h3>
          <p className="text-sm text-gray-500">
            {permissions.length} permissions active
          </p>
        </div>

        <div className="space-y-2">
          {allPermissions.map((perm) => {
            const has = hasPermission(perm.name);
            const source = getPermissionSource(perm.name);
            const isFromRole = source === "role";

            return (
              <div
                key={perm.name}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-lg ${
                      has ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {has ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{perm.name}</p>
                    <p className="text-xs text-gray-500">{perm.description}</p>
                    {has && (
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                          isFromRole
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {isFromRole ? "From Role" : "Custom"}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePermission(perm.name, has)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    has
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  }`}
                >
                  {has ? "Revoke" : "Grant"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
