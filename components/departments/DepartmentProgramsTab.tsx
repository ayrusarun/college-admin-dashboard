"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, BookOpen, Calendar } from "lucide-react";
import { academicApi } from "@/lib/api/client";
import { Program } from "@/lib/types";
import { Modal } from "@/components/Modal";

interface DepartmentProgramsTabProps {
  programs: Program[];
  departmentId: number;
  collegeId: number;
  onRefresh: () => void;
}

export default function DepartmentProgramsTab({
  programs,
  departmentId,
  collegeId,
  onRefresh,
}: DepartmentProgramsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the program "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await academicApi.deleteProgram(id);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to delete program");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{programs.length} programs</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Program
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No programs found</p>
          <p className="text-sm text-gray-500 mb-4">
            Create your first program for this department
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{program.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">{program.code}</p>
                  {program.short_name && (
                    <p className="text-xs text-gray-500 mt-1">({program.short_name})</p>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {program.duration_years}y
                </span>
              </div>

              {program.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {program.description}
                </p>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setEditingProgram(program)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit program"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(program.id, program.name)}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete program"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <ProgramFormModal
          departmentId={departmentId}
          collegeId={collegeId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {editingProgram && (
        <ProgramFormModal
          departmentId={departmentId}
          collegeId={collegeId}
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onSuccess={() => {
            setEditingProgram(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function ProgramFormModal({
  departmentId,
  collegeId,
  program,
  onClose,
  onSuccess,
}: {
  departmentId: number;
  collegeId: number;
  program?: Program;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: program?.name || "",
    code: program?.code || "",
    short_name: program?.short_name || "",
    duration_years: program?.duration_years?.toString() || "4",
    description: program?.description || "",
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
        department_id: departmentId,
        duration_years: parseInt(formData.duration_years),
      };

      if (program) {
        await academicApi.updateProgram(program.id, payload);
      } else {
        await academicApi.createProgram(payload);
      }
      onSuccess();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError("Failed to save program");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={program ? "Edit Program" : "Create New Program"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Bachelor of Computer Science"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., BCS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Name
            </label>
            <input
              type="text"
              value={formData.short_name}
              onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CS"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (Years) *
          </label>
          <select
            required
            value={formData.duration_years}
            onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="4">4 Years</option>
            <option value="5">5 Years</option>
            <option value="6">6 Years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional program description..."
          />
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
            {loading ? "Saving..." : program ? "Update Program" : "Create Program"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
