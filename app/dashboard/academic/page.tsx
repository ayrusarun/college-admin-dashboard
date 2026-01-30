"use client";

import { GraduationCap } from "lucide-react";
import AcademicYearsTab from "@/components/academic/AcademicYearsTab";

export default function AcademicPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <GraduationCap className="h-7 w-7 mr-2 text-blue-600" />
          Academic Years Management
        </h2>
        <p className="text-gray-600 mt-1">
          Manage academic years for your institution. Programs, Cohorts, and Classes are now managed within their respective departments.
        </p>
      </div>

      {/* Academic Years Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <AcademicYearsTab />
      </div>
    </div>
  );
}
