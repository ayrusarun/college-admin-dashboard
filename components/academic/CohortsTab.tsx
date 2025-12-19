"use client";

import { useEffect, useState } from "react";
import { Users, Plus, RefreshCw } from "lucide-react";
import { academicApi } from "@/lib/api/client";
import { Cohort, Program } from "@/lib/types";

export default function CohortsTab() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedProgram]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cohortsRes, programsRes] = await Promise.all([
        academicApi.listCohorts(
          selectedProgram ? { program_id: parseInt(selectedProgram) } : {}
        ),
        academicApi.listPrograms({}),
      ]);
      setCohorts(cohortsRes.data || []);
      setPrograms(programsRes.data || []);
    } catch (error) {
      console.error("Failed to load cohorts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">{cohorts.length} cohorts</p>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programs</option>
            {programs.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Cohort
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohorts.map((cohort) => (
          <div key={cohort.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-gray-900">{cohort.name}</h4>
            <p className="text-sm text-gray-500 font-mono">{cohort.code}</p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-600">
                Admission Year: <span className="font-medium">{cohort.admission_year}</span>
              </p>
              <p className="text-xs text-gray-600">
                Semester: <span className="font-medium">{cohort.current_semester}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateCohortModal
          programs={programs}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function CreateCohortModal({
  programs,
  onClose,
  onSuccess,
}: {
  programs: Program[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    program_id: "",
    admission_year: new Date().getFullYear().toString(),
    current_semester: "1",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await academicApi.createCohort({
        ...formData,
        program_id: parseInt(formData.program_id),
        admission_year: parseInt(formData.admission_year),
        current_semester: parseInt(formData.current_semester),
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create cohort:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Create Cohort/Batch</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cohort Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="BTech CS Batch 2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="BTECH-CS-2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program *
            </label>
            <select
              required
              value={formData.program_id}
              onChange={(e) =>
                setFormData({ ...formData, program_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Program</option>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Year *
            </label>
            <input
              type="number"
              required
              min="2000"
              max="2100"
              value={formData.admission_year}
              onChange={(e) =>
                setFormData({ ...formData, admission_year: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Semester *
            </label>
            <input
              type="number"
              required
              min="1"
              max="12"
              value={formData.current_semester}
              onChange={(e) =>
                setFormData({ ...formData, current_semester: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
