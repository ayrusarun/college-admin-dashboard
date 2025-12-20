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
  type LucideIcon,
} from "lucide-react";

export type UserRole = "admin" | "staff" | "student";

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  implemented: boolean;
  allowedRoles: UserRole[]; // Roles that can access this item
  description?: string; // Optional description for tooltips
}

/**
 * Navigation configuration for the admin dashboard
 * Add/remove roles from allowedRoles array to control access
 */
export const navigationConfig: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    implemented: true,
    allowedRoles: ["admin", "staff"], // Both admin and staff can see dashboard
    description: "Overview and statistics",
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
    implemented: true,
    allowedRoles: ["admin", "staff"], // Both can manage users
    description: "Manage users and profiles",
  },
  {
    name: "Departments",
    href: "/dashboard/departments",
    icon: Building2,
    implemented: true,
    allowedRoles: ["admin"], // Only admin can manage departments
    description: "Manage departments",
  },
  {
    name: "Academic",
    href: "/dashboard/academic",
    icon: GraduationCap,
    implemented: true,
    allowedRoles: ["admin", "staff"], // Both can access academic management
    description: "Academic years, programs, cohorts",
  },
  {
    name: "Posts",
    href: "/dashboard/posts",
    icon: FileText,
    implemented: true,
    allowedRoles: ["admin", "staff"], // Both can manage posts
    description: "Manage posts and announcements",
  },
  {
    name: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    implemented: true,
    allowedRoles: ["admin", "staff"], // Both can manage events
    description: "Create and manage events",
  },
  {
    name: "Groups",
    href: "/dashboard/groups",
    icon: UsersRound,
    implemented: true,
    allowedRoles: ["admin", "staff"], // Both can manage groups
    description: "Manage user groups",
  },
  {
    name: "Files",
    href: "/dashboard/files",
    icon: FolderOpen,
    implemented: false,
    allowedRoles: ["admin"], // Only admin
    description: "File management system",
  },
  {
    name: "Rewards",
    href: "/dashboard/rewards",
    icon: Gift,
    implemented: false,
    allowedRoles: ["admin"], // Only admin
    description: "Rewards and points system",
  },
  {
    name: "Store",
    href: "/dashboard/store",
    icon: ShoppingCart,
    implemented: false,
    allowedRoles: ["admin"], // Only admin
    description: "Campus store management",
  },
  {
    name: "Alerts",
    href: "/dashboard/alerts",
    icon: Bell,
    implemented: true,
    allowedRoles: ["admin", "staff"], // Both can send alerts
    description: "Send notifications and alerts",
  },
  {
    name: "News",
    href: "/dashboard/news",
    icon: Newspaper,
    implemented: false,
    allowedRoles: ["admin", "staff"], // Both can manage news
    description: "News and updates",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    implemented: false,
    allowedRoles: ["admin"], // Only admin for analytics
    description: "Reports and analytics",
  },
  {
    name: "Moderation",
    href: "/dashboard/moderation",
    icon: Shield,
    implemented: false,
    allowedRoles: ["admin", "staff"], // Both can moderate
    description: "Content moderation",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    implemented: false,
    allowedRoles: ["admin"], // Only admin for settings
    description: "System settings",
  },
];

/**
 * Filter navigation items based on user role
 */
export function getNavigationForRole(userRole: string): NavigationItem[] {
  const role = userRole.toLowerCase() as UserRole;
  return navigationConfig.filter((item) =>
    item.allowedRoles.includes(role)
  );
}

/**
 * Check if a user has access to a specific route
 */
export function hasAccessToRoute(userRole: string, route: string): boolean {
  const role = userRole.toLowerCase() as UserRole;
  const item = navigationConfig.find((nav) => nav.href === route);
  return item ? item.allowedRoles.includes(role) : false;
}
