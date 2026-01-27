"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { getNavigationForRole } from "@/lib/config/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get navigation items filtered by user role
  const navigation = getNavigationForRole(user?.role || "staff");

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <GraduationCap className="h-8 w-8 text-blue-400 mr-2" />
        <span className="text-xl font-bold">Yunite</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.implemented ? item.href : "#"}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    !item.implemented && "opacity-40 blur-[0.5px] cursor-not-allowed pointer-events-none",
                    isActive && item.implemented
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                  title={item.description}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-2 mb-2">
          <p className="text-xs text-gray-400 text-center">
            🔒 Multi-Tenant Mode
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Data scoped to your college
          </p>
        </div>
        {/* Show role indicator */}
        {user?.role && (
          <div className="bg-gray-800 rounded-lg p-2 mb-2">
            <p className="text-xs text-center">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                user.role === "super_admin" ? "bg-purple-900/50 text-purple-300" :
                user.role === "admin" ? "bg-red-900/50 text-red-300" : "bg-blue-900/50 text-blue-300"
              )}>
                {user.role === "super_admin" ? "SUPER ADMIN" : user.role.toUpperCase()} ACCESS
              </span>
            </p>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">
          © 2024 Yunite Admin
        </p>
      </div>
    </div>
  );
}
