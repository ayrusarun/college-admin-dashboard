"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import AcademicYearsTab from "@/components/academic/AcademicYearsTab";
import ProgramsTab from "@/components/academic/ProgramsTab";
import CohortsTab from "@/components/academic/CohortsTab";
import ClassesTab from "@/components/academic/ClassesTab";

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState("years");

  const tabs = [
    { id: "years", label: "Academic Years" },
    { id: "programs", label: "Programs" },
    { id: "cohorts", label: "Cohorts" },
    { id: "classes", label: "Classes" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <GraduationCap className="h-7 w-7 mr-2 text-blue-600" />
          Academic Management
        </h2>
        <p className="text-gray-600 mt-1">
          Manage academic structure: years, programs, cohorts, and classes
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "years" && <AcademicYearsTab />}
          {activeTab === "programs" && <ProgramsTab />}
          {activeTab === "cohorts" && <CohortsTab />}
          {activeTab === "classes" && <ClassesTab />}
        </div>
      </div>
    </div>
  );
}
