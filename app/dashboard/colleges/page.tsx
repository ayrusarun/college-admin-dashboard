"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { School, Plus, Edit, Trash2, RefreshCw, Users, Building2 } from "lucide-react";
import { collegeApi } from "@/lib/api/client";
import { College } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/auth/AuthContext";

export default function CollegesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCollegeId, setDeletingCollegeId] = useState<number | null>(null);
  const [deletingCollegeName, setDeletingCollegeName] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [collegeDataCounts, setCollegeDataCounts] = useState<any>(null);

  // Check if user is super_admin
  useEffect(() => {
    if (user && user.role !== "super_admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    try {
      const res = await collegeApi.list();
      setColleges(res.data || []);
    } catch (error) {
      console.error("Failed to load colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (college: College) => {
    setSelectedCollege(college);
    setShowEditModal(true);
  };

  const handleDelete = (college: College) => {
    setDeletingCollegeId(college.id);
    setDeletingCollegeName(college.name);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingCollegeId) return;

    try {
      // First try without force to see if there's data
      await collegeApi.delete(deletingCollegeId, false);
      setShowDeleteConfirm(false);
      setDeleteError(null);
      setCollegeDataCounts(null);
      loadColleges();
    } catch (error: any) {
      console.error("Failed to delete college:", error);
      
      // Check if it's a 400 error with data counts
      if (error.response?.status === 400 && error.response?.data?.detail?.college_data) {
        setDeleteError(error.response.data.detail.message);
        setCollegeDataCounts(error.response.data.detail.college_data);
      } else {
        alert("Failed to delete college: " + (error.response?.data?.detail || error.message));
        setShowDeleteConfirm(false);
      }
    }
  };

  const forceDelete = async () => {
    if (!deletingCollegeId) return;

    try {
      await collegeApi.delete(deletingCollegeId, true);
      setShowDeleteConfirm(false);
      setDeleteError(null);
      setCollegeDataCounts(null);
      loadColleges();
    } catch (error: any) {
      console.error("Failed to force delete college:", error);
      alert("Failed to delete college: " + (error.response?.data?.detail || error.message));
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <School className="h-7 w-7 mr-2 text-purple-600" />
            College Management
          </h2>
          <p className="text-gray-600 mt-1">
            Platform-level college management ({colleges.length} total)
          </p>
          <p className="text-sm text-purple-600 mt-1 font-medium">
            🔐 Super Admin Only
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadColleges}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add College
          </button>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges.map((college) => (
          <div
            key={college.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <School className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {college.name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {college.id}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {college.slug}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Created: {new Date(college.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEdit(college)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(college)}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCollegeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadColleges();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCollege && (
        <EditCollegeModal
          college={selectedCollege}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCollege(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCollege(null);
            loadColleges();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {/* Custom Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete College
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete <strong>{deletingCollegeName}</strong>?
                </p>
              </div>
            </div>

            {collegeDataCounts && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  ⚠️ This college contains data:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• {collegeDataCounts.users} users</li>
                  <li>• {collegeDataCounts.departments} departments</li>
                  <li>• {collegeDataCounts.posts} posts</li>
                  <li>• {collegeDataCounts.groups} groups</li>
                  <li className="font-semibold mt-2">Total: {collegeDataCounts.total} items</li>
                </ul>
                <p className="text-sm text-red-800 mt-3 font-semibold">
                  All this data will be PERMANENTLY deleted. This action cannot be undone.
                </p>
              </div>
            )}

            {deleteError && !collegeDataCounts && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                  setCollegeDataCounts(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {collegeDataCounts ? (
                <button
                  onClick={forceDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Force Delete All
                </button>
              ) : (
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateCollegeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await collegeApi.create(formData);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create college:", error);
      setError(error.response?.data?.detail || "Failed to create college");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create New College
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              placeholder="e.g., Indian Institute of Technology Delhi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              required
              placeholder="e.g., iit-delhi"
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCollegeModal({
  college,
  onClose,
  onSuccess,
}: {
  college: College;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: college.name,
    slug: college.slug,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await collegeApi.update(college.id, formData);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to update college:", error);
      setError(error.response?.data?.detail || "Failed to update college");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Edit College
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              required
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
