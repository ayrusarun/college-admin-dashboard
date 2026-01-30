"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Grid3x3 } from "lucide-react";
import { academicApi } from "@/lib/api/client";
import { Class, Cohort } from "@/lib/types";
import { Modal } from "@/components/Modal";

interface DepartmentClassesTabProps {
  classes: Class[];
  cohorts: Cohort[];
  departmentId: number;
  collegeId: number;
  onRefresh: () => void;
}

export default function DepartmentClassesTab({
  classes,
  cohorts,
  departmentId,
  collegeId,
  onRefresh,
}: DepartmentClassesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await academicApi.deleteClass(id);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to delete class");
    }
  };

  const getCohortName = (cohortId: number) => {
    return cohorts.find((c) => c.id === cohortId)?.name || "Unknown";
  };

  if (cohorts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">No cohorts available</p>
        <p className="text-sm text-gray-500">
          Create a cohort first before adding classes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{classes.length} classes</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No classes found</p>
          <p className="text-sm text-gray-500 mb-4">
            Create your first class section for this department
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {classItem.section_name || `Section ${classItem.section_code}`}
                  </h4>
                  <p className="text-sm text-gray-500 font-mono">
                    {classItem.section_code}
                  </p>
                </div>
                {classItem.is_active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p className="text-gray-500">Cohort:</p>
                <p className="font-medium">{getCohortName(classItem.cohort_id)}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-3">
                <button
                  onClick={() => setEditingClass(classItem)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit class"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id, classItem.section_name || `Section ${classItem.section_code}`)}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete class"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <ClassFormModal
          cohorts={cohorts}
          collegeId={collegeId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {editingClass && (
        <ClassFormModal
          classData={editingClass}
          cohorts={cohorts}
          collegeId={collegeId}
          onClose={() => setEditingClass(null)}
          onSuccess={() => {
            setEditingClass(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function ClassFormModal({
  cohorts,
  collegeId,
  classData,
  onClose,
  onSuccess,
}: {
  cohorts: Cohort[];
  collegeId: number;
  classData?: Class;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    section_name: classData?.section_name || "",
    section_code: classData?.section_code || "",
    cohort_id: classData?.cohort_id?.toString() || "",
    is_active: classData?.is_active !== undefined ? classData.is_active : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const selectedCohort = cohorts.find(c => c.id === parseInt(formData.cohort_id));
      if (!selectedCohort) {
        setError("Selected cohort not found");
        setLoading(false);
        return;
      }

      const payload = {
        section_code: formData.section_code,
        section_name: formData.section_name,
        college_id: collegeId,
        cohort_id: parseInt(formData.cohort_id),
        program_id: selectedCohort.program_id,
        is_active: formData.is_active,
      };

      if (classData) {
        await academicApi.updateClass(classData.id, payload);
      } else {
        await academicApi.createClass(payload);
      }
      onSuccess();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError("Failed to save class");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={classData ? "Edit Class" : "Create New Class"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cohort *
          </label>
          <select
            required
            value={formData.cohort_id}
            onChange={(e) => setFormData({ ...formData, cohort_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a cohort</option>
            {cohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name} ({cohort.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Name
            </label>
            <input
              type="text"
              value={formData.section_name}
              onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Section A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Code *
            </label>
            <input
              type="text"
              required
              value={formData.section_code}
              onChange={(e) => setFormData({ ...formData, section_code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., A"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : classData ? "Update Class" : "Create Class"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
