"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  FileText,
  Calendar,
  UsersRound,
  FolderOpen,
  Gift,
  ShoppingCart,
  Bell,
  Newspaper,
  Settings,
  Shield,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, implemented: true },
  { name: "Users", href: "/dashboard/users", icon: Users, implemented: true },
  { name: "Departments", href: "/dashboard/departments", icon: Building2, implemented: true },
  { name: "Academic", href: "/dashboard/academic", icon: GraduationCap, implemented: true },
  { name: "Posts", href: "/dashboard/posts", icon: FileText, implemented: true },
  { name: "Events", href: "/dashboard/events", icon: Calendar, implemented: true },
  { name: "Groups", href: "/dashboard/groups", icon: UsersRound, implemented: true },
  { name: "Files", href: "/dashboard/files", icon: FolderOpen, implemented: false },
  { name: "Rewards", href: "/dashboard/rewards", icon: Gift, implemented: false },
  { name: "Store", href: "/dashboard/store", icon: ShoppingCart, implemented: false },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell, implemented: true },
  { name: "News", href: "/dashboard/news", icon: Newspaper, implemented: false },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, implemented: false },
  { name: "Moderation", href: "/dashboard/moderation", icon: Shield, implemented: false },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, implemented: false },
];

export function Sidebar() {
  const pathname = usePathname();

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
        <p className="text-xs text-gray-400 text-center">
          © 2024 Yunite Admin
        </p>
      </div>
    </div>
  );
}
