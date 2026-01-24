"use client";

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
// import { AIRightSidebar } from "@/components/ai/AIRightSidebar"; // Disabled - can be enabled later
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 transition-all duration-300">
          <Header />
          <main className="pt-20 p-6">{children}</main>
        </div>
        {/* <AIRightSidebar /> */} {/* Disabled - can be enabled later */}
      </div>
    </ProtectedRoute>
  );
}
