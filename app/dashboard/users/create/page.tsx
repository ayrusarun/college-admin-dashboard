"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { userApi, departmentApi, academicApi } from "@/lib/api/client";
import type { Department, Program, Cohort, Class } from "@/lib/types/index";
import { useAuth } from "@/lib/auth/AuthContext";

export default function CreateUserPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "student",
    department_id: "",
    program_id: "",
    cohort_id: "",
    class_id: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      loadPrograms(parseInt(formData.department_id));
    }
  }, [formData.department_id]);

  useEffect(() => {
    if (formData.program_id) {
      loadCohorts(parseInt(formData.program_id));
    }
  }, [formData.program_id]);

  useEffect(() => {
    if (formData.cohort_id) {
      loadClasses(parseInt(formData.cohort_id));
    }
  }, [formData.cohort_id]);

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.list({ limit: 100 });
      setDepartments(res.data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const loadPrograms = async (departmentId: number) => {
    try {
      const res = await academicApi.listPrograms({ department_id: departmentId });
      setPrograms(res.data || []);
    } catch (error) {
      console.error("Failed to load programs:", error);
    }
  };

  const loadCohorts = async (programId: number) => {
    try {
      const res = await academicApi.listCohorts({ program_id: programId });
      setCohorts(res.data || []);
    } catch (error) {
      console.error("Failed to load cohorts:", error);
    }
  };

  const loadClasses = async (cohortId: number) => {
    try {
      const res = await academicApi.listClasses({ cohort_id: cohortId });
      setClasses(res.data || []);
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate department is selected
      if (!formData.department_id) {
        setError("Please select a department");
        setLoading(false);
        return;
      }

      // Debug: Log current user to see what we have
      console.log("Current user object:", currentUser);

      // Get college_id from current user (either flat field or nested object)
      const collegeId = currentUser?.college_id || currentUser?.college?.id;
      
      console.log("Extracted college_id:", collegeId);
      
      if (!collegeId) {
        setError("Unable to determine your college. Please log in again.");
        setLoading(false);
        return;
      }

      const payload: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        department_id: parseInt(formData.department_id),
        college_id: collegeId, // ✅ Use extracted college_id
      };

      // Add academic details for students/teachers (optional)
      if (formData.role === "student" || formData.role === "teacher") {
        if (formData.program_id)
          payload.program_id = parseInt(formData.program_id);
        if (formData.cohort_id)
          payload.cohort_id = parseInt(formData.cohort_id);
        if (formData.class_id)
          payload.class_id = parseInt(formData.class_id);
        
        // Get admission year from cohort if selected
        if (formData.cohort_id) {
          const cohort = cohorts.find(c => c.id === parseInt(formData.cohort_id));
          if (cohort?.admission_year) {
            payload.admission_year = cohort.admission_year;
          }
        }
      }

      await userApi.createUser(payload);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/users");
      }, 1500);
    } catch (err: any) {
      console.error("User creation error:", err);
      
      // Handle validation errors (422)
      if (err.response?.status === 422 && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          const errors = detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ');
          setError(`Validation error: ${errors}`);
        } else {
          setError(detail);
        }
      } else {
        setError(
          err.response?.data?.detail || "Failed to create user. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
          <p className="text-gray-600 mt-1">
            Add a new user to your college system
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✓ User created successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Department Selection (Required for all roles) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Department Assignment *
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {formData.role === 'student' || formData.role === 'teacher' 
                  ? 'Select the academic department'
                  : 'Select the administrative department this user belongs to'}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Information (Only for Students and Teachers) */}
        {(formData.role === "student" || formData.role === "teacher") && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Academic Information
              <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <select
                  value={formData.program_id}
                  onChange={(e) =>
                    setFormData({ ...formData, program_id: e.target.value })
                  }
                  disabled={!formData.department_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Program</option>
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cohort/Batch
                    </label>
                    <select
                      value={formData.cohort_id}
                      onChange={(e) =>
                        setFormData({ ...formData, cohort_id: e.target.value })
                      }
                      disabled={!formData.program_id}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select Cohort</option>
                      {cohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class/Section
                    </label>
                    <select
                      value={formData.class_id}
                      onChange={(e) =>
                        setFormData({ ...formData, class_id: e.target.value })
                      }
                      disabled={!formData.cohort_id}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.section_name || cls.section_code}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
