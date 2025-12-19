"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  Activity,
  Award,
} from "lucide-react";
import { userApi, departmentApi, postApi, eventApi } from "@/lib/api/client";
import { formatNumber } from "@/lib/utils";

interface Stats {
  total_users: number;
  total_departments: number;
  total_posts: number;
  total_events: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_departments: 0,
    total_posts: 0,
    total_events: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch stats from various endpoints
      const [usersRes, deptsRes, postsRes, eventsRes] = await Promise.all([
        userApi.getUsers({ limit: 1 }),
        departmentApi.list({ limit: 1 }),
        postApi.list({ limit: 1 }),
        eventApi.list({ limit: 1 }),
      ]);

      setStats({
        total_users: usersRes.data?.length || 0,
        total_departments: deptsRes.data?.length || 0,
        total_posts: postsRes.data?.length || 0,
        total_events: eventsRes.data?.length || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Total Users",
      value: formatNumber(stats.total_users),
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      name: "Departments",
      value: formatNumber(stats.total_departments),
      icon: Building2,
      color: "bg-green-500",
      change: "+5%",
    },
    {
      name: "Total Posts",
      value: formatNumber(stats.total_posts),
      icon: FileText,
      color: "bg-purple-500",
      change: "+18%",
    },
    {
      name: "Events",
      value: formatNumber(stats.total_events),
      icon: Calendar,
      color: "bg-orange-500",
      change: "+7%",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-Tenancy Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
              <span className="text-xl">🏫</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-900">
              Multi-Tenant Dashboard
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              All data shown is scoped to your college. You can only view and manage users, posts, events, and content within your institution.
            </p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">
          Welcome to your college community admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Users className="h-5 w-5 mr-2" />
            Create New User
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Building2 className="h-5 w-5 mr-2" />
            Add Department
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <Calendar className="h-5 w-5 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center py-8">
              No recent activity to display
            </p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-600" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center py-8">
              No upcoming events
            </p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <p className="text-blue-100">
              All systems are running smoothly
            </p>
          </div>
          <Award className="h-12 w-12 text-blue-200" />
        </div>
      </div>
    </div>
  );
}
