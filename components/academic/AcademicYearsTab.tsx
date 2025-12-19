"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Check, RefreshCw } from "lucide-react";
import { academicApi } from "@/lib/api/client";
import { AcademicYear } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AcademicYearsTab() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = async () => {
    setLoading(true);
    try {
      const res = await academicApi.listYears();
      setYears(res.data || []);
    } catch (error) {
      console.error("Failed to load academic years:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await academicApi.activateYear(id);
      loadYears();
    } catch (error) {
      console.error("Failed to activate year:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{years.length} academic years</p>
        <div className="flex space-x-2">
          <button
            onClick={loadYears}
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
            Add Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {years.map((year) => (
          <div
            key={year.id}
            className={`border rounded-lg p-4 ${
              year.is_active
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center">
                  {year.year}
                  {year.is_active && (
                    <Check className="h-4 w-4 ml-2 text-green-600" />
                  )}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatDate(year.start_date)} - {formatDate(year.end_date)}
                </p>
              </div>
            </div>
            {!year.is_active && (
              <button
                onClick={() => handleActivate(year.id)}
                className="w-full mt-2 px-3 py-1.5 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50"
              >
                Set as Active
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <CreateYearModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadYears();
          }}
        />
      )}
    </div>
  );
}

function CreateYearModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    year: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await academicApi.createYear(formData);
      onSuccess();
    } catch (error) {
      console.error("Failed to create year:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Create Academic Year</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Name (e.g., 2024-2025) *
            </label>
            <input
              type="text"
              required
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
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
