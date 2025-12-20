"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasAccessToRoute } from "@/lib/config/navigation";

interface RoleGuardProps {
  children: React.ReactNode;
}

/**
 * RoleGuard component to protect routes based on user role
 * Wrap routes that need role-based access control with this component
 */
export function RoleGuard({ children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const hasAccess = hasAccessToRoute(user.role || "staff", pathname);
      
      if (!hasAccess) {
        console.warn(`Access denied to ${pathname} for role: ${user.role}`);
        // Redirect to dashboard if user doesn't have access
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  // Show nothing while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user doesn't have access, show nothing (will redirect)
  if (user && !hasAccessToRoute(user.role || "staff", pathname)) {
    return null;
  }

  return <>{children}</>;
}
