"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Grid3x3,
  RefreshCw,
} from "lucide-react";
import { departmentApi, academicApi, userApi } from "@/lib/api/client";
import { Department, Program, Cohort, Class, User } from "@/lib/types";
import { DataTable } from "@/components/ui/DataTable";
import DepartmentProgramsTab from "@/components/departments/DepartmentProgramsTab";
import DepartmentCohortsTab from "@/components/departments/DepartmentCohortsTab";
import DepartmentClassesTab from "@/components/departments/DepartmentClassesTab";

export default function DepartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = parseInt(params.id as string);

  const [department, setDepartment] = useState<Department | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"programs" | "cohorts" | "classes" | "students" | "staff">("programs");

  useEffect(() => {
    loadDepartmentData();
  }, [departmentId]);

  const loadDepartmentData = async () => {
    setLoading(true);
    try {
      // Load department details
      const deptRes = await departmentApi.getById(departmentId);
      setDepartment(deptRes.data);

      // Load programs for this department
      const programsRes = await academicApi.listPrograms({ department_id: departmentId });
      setPrograms(programsRes.data || []);

      // Load all cohorts for programs in this department
      const allCohorts: Cohort[] = [];
      const allClasses: Class[] = [];
      
      for (const program of programsRes.data || []) {
        const cohortsRes = await academicApi.listCohorts({ program_id: program.id });
        allCohorts.push(...(cohortsRes.data || []));
        
        // Load classes for each cohort
        for (const cohort of cohortsRes.data || []) {
          const classesRes = await academicApi.listClasses({ cohort_id: cohort.id });
          allClasses.push(...(classesRes.data || []));
        }
      }
      
      setCohorts(allCohorts);
      setClasses(allClasses);

      // Load students in this department
      const studentsRes = await userApi.getUsers({
        department_id: departmentId,
        role: "student",
        limit: 1000,
      });
      setStudents(studentsRes.data || []);

      // Load staff in this department
      const staffRes = await userApi.getUsers({
        department_id: departmentId,
        role: "staff",
        limit: 1000,
      });
      setStaff(staffRes.data || []);

    } catch (error) {
      console.error("Failed to load department data:", error);
      alert("Failed to load department data");
    } finally {
      setLoading(false);
    }
  };

  const studentColumns = [
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
      render: (user: User) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.role}
        </span>
      ),
    },
  ];

  const staffColumns = [
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
      render: (user: User) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.role}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Department not found</p>
        <button
          onClick={() => router.push("/dashboard/departments")}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Departments
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
            onClick={() => router.push("/dashboard/departments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building2 className="h-7 w-7 mr-2 text-blue-600" />
              {department.name}
            </h2>
            <p className="text-gray-600 mt-1">{department.code} • {department.description}</p>
          </div>
        </div>
        <button
          onClick={loadDepartmentData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programs</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{programs.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cohorts</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{cohorts.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{classes.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Grid3x3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{students.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("programs")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "programs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Programs ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab("cohorts")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "cohorts"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Cohorts ({cohorts.length})
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "classes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "students"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "staff"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Staff ({staff.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "programs" && (
          <DepartmentProgramsTab
            programs={programs}
            departmentId={departmentId}
            collegeId={department.college_id}
            onRefresh={loadDepartmentData}
          />
        )}

        {activeTab === "cohorts" && (
          <DepartmentCohortsTab
            cohorts={cohorts}
            programs={programs}
            departmentId={departmentId}
            collegeId={department.college_id}
            onRefresh={loadDepartmentData}
          />
        )}

        {activeTab === "classes" && (
          <DepartmentClassesTab
            classes={classes}
            cohorts={cohorts}
            departmentId={departmentId}
            collegeId={department.college_id}
            onRefresh={loadDepartmentData}
          />
        )}

        {activeTab === "students" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Students</h3>
            <DataTable
              data={students}
              columns={studentColumns}
              loading={false}
              onRowClick={(user) => router.push(`/dashboard/users/${user.id}`)}
            />
          </div>
        )}

        {activeTab === "staff" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Members</h3>
            <DataTable
              data={staff}
              columns={staffColumns}
              loading={false}
              onRowClick={(user) => router.push(`/dashboard/users/${user.id}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
