"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { LogOut, User, Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useEffect, useState } from "react";
import { alertApi } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Fetch unread count initially
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await alertApi.getUnreadCount();
      setUnreadCount(response.data?.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleNotificationClick = () => {
    router.push("/dashboard/alerts");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-10 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-6">
        {/* College Info */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            🏫 {user?.college?.name || user?.college_name || "College Admin"}
          </span>
          <span className="text-sm text-gray-500">
            • Campus ID: {user?.college?.id || user?.college_id || "N/A"}
          </span>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            onClick={handleNotificationClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            title={`${unreadCount} unread alerts`}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                {user ? getInitials(user.full_name || user.username) : "AD"}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Administrator
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to logout? You will need to login again to access the dashboard.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
