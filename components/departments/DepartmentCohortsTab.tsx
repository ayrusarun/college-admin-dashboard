"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Users, Calendar } from "lucide-react";
import { academicApi } from "@/lib/api/client";
import { Cohort, Program } from "@/lib/types";
import { Modal } from "@/components/Modal";

interface DepartmentCohortsTabProps {
  cohorts: Cohort[];
  programs: Program[];
  departmentId: number;
  collegeId: number;
  onRefresh: () => void;
}

export default function DepartmentCohortsTab({
  cohorts,
  programs,
  departmentId,
  collegeId,
  onRefresh,
}: DepartmentCohortsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the cohort "${name}"? This will also delete all classes in this cohort. This action cannot be undone.`)) {
      return;
    }

    try {
      await academicApi.deleteCohort(id);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to delete cohort");
    }
  };

  const getProgramName = (programId: number) => {
    return programs.find((p) => p.id === programId)?.name || "Unknown";
  };

  if (programs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">No programs available</p>
        <p className="text-sm text-gray-500">
          Create a program first before adding cohorts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{cohorts.length} cohorts</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Cohort
        </button>
      </div>

      {cohorts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No cohorts found</p>
          <p className="text-sm text-gray-500 mb-4">
            Create your first cohort for this department
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Cohort
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{cohort.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">{cohort.code}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Sem {cohort.current_semester}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{getProgramName(cohort.program_id)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Admitted {cohort.admission_year}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-3">
                <button
                  onClick={() => setEditingCohort(cohort)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit cohort"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(cohort.id, cohort.name)}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete cohort"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CohortFormModal
          programs={programs}
          collegeId={collegeId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {editingCohort && (
        <CohortFormModal
          cohort={editingCohort}
          programs={programs}
          collegeId={collegeId}
          onClose={() => setEditingCohort(null)}
          onSuccess={() => {
            setEditingCohort(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function CohortFormModal({
  programs,
  collegeId,
  cohort,
  onClose,
  onSuccess,
}: {
  programs: Program[];
  collegeId: number;
  cohort?: Cohort;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    name: cohort?.name || "",
    code: cohort?.code || "",
    program_id: cohort?.program_id?.toString() || "",
    admission_year: cohort?.admission_year?.toString() || currentYear.toString(),
    current_semester: cohort?.current_semester?.toString() || "1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        college_id: collegeId,
        program_id: parseInt(formData.program_id),
        admission_year: parseInt(formData.admission_year),
        current_semester: parseInt(formData.current_semester),
      };

      if (cohort) {
        await academicApi.updateCohort(cohort.id, payload);
      } else {
        await academicApi.createCohort(payload);
      }
      onSuccess();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError("Failed to save cohort");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={cohort ? "Edit Cohort" : "Create New Cohort"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program *
          </label>
          <select
            required
            value={formData.program_id}
            onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name} ({program.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admission Year *
          </label>
          <select
            required
            value={formData.admission_year}
            onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 10 }, (_, i) => currentYear - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cohort Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CS 2024-2028"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cohort Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CS24"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Semester *
          </label>
          <select
            required
            value={formData.current_semester}
            onChange={(e) => setFormData({ ...formData, current_semester: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
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
            {loading ? "Saving..." : cohort ? "Update Cohort" : "Create Cohort"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
