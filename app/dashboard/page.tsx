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
  UsersRound,
  School,
} from "lucide-react";
import { userApi, departmentApi, postApi, eventApi, groupApi, collegeApi } from "@/lib/api/client";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

interface Stats {
  total_users: number;
  total_departments: number;
  total_posts: number;
  total_events: number;
  total_groups: number;
  total_colleges?: number; // For super admin
}

interface RecentUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_departments: 0,
    total_posts: 0,
    total_events: 0,
    total_groups: 0,
    total_colleges: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch counts and recent data from various endpoints
      const promises: any[] = [
        userApi.getUsers({ limit: 1000 }), // Get all users to count
        departmentApi.list({ limit: 1000 }), // Get all departments
        postApi.list({ limit: 1000 }), // Get all posts
        eventApi.list({ limit: 1000 }), // Get all events
        groupApi.list({ limit: 1000 }), // Get all groups
      ];

      // Super admin gets college data
      if (isSuperAdmin) {
        promises.push(collegeApi.list());
      }

      const results = await Promise.all(promises);
      const [usersRes, deptsRes, postsRes, eventsRes, groupsRes, collegesRes] = results;

      // Set counts
      setStats({
        total_users: usersRes.data?.length || 0,
        total_departments: deptsRes.data?.length || 0,
        total_posts: postsRes.data?.length || 0,
        total_events: eventsRes.data?.length || 0,
        total_groups: groupsRes.data?.length || 0,
        total_colleges: isSuperAdmin ? (collegesRes?.data?.length || 0) : undefined,
      });

      // Get 5 most recent users
      const users = usersRes.data || [];
      const sortedUsers = users
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentUsers(sortedUsers);

      // Get upcoming events (next 5 events starting from now)
      const events = eventsRes.data || [];
      const now = new Date();
      const upcoming = events
        .filter((event: any) => new Date(event.start_time) >= now && event.status !== 'cancelled')
        .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 5);
      setUpcomingEvents(upcoming);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    ...(isSuperAdmin ? [{
      name: "Colleges",
      value: formatNumber(stats.total_colleges || 0),
      icon: School,
      color: "bg-purple-500",
      href: "/dashboard/colleges",
    }] : []),
    {
      name: "Total Users",
      value: formatNumber(stats.total_users),
      icon: Users,
      color: "bg-blue-500",
      href: "/dashboard/users",
    },
    {
      name: "Departments",
      value: formatNumber(stats.total_departments),
      icon: Building2,
      color: "bg-green-500",
      href: "/dashboard/departments",
    },
    {
      name: "Posts",
      value: formatNumber(stats.total_posts),
      icon: FileText,
      color: "bg-purple-500",
      href: "/dashboard/posts",
    },
    {
      name: "Events",
      value: formatNumber(stats.total_events),
      icon: Calendar,
      color: "bg-orange-500",
      href: "/dashboard/events",
    },
    {
      name: "Groups",
      value: formatNumber(stats.total_groups),
      icon: UsersRound,
      color: "bg-indigo-500",
      href: "/dashboard/groups",
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
      <div className={`border rounded-lg p-4 ${
        isSuperAdmin 
          ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" 
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
              isSuperAdmin ? "bg-purple-100" : "bg-blue-100"
            }`}>
              <span className="text-xl">{isSuperAdmin ? "👑" : "🏫"}</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              isSuperAdmin ? "text-purple-900" : "text-blue-900"
            }`}>
              {isSuperAdmin ? "Super Admin Dashboard" : "Multi-Tenant Dashboard"}
            </h3>
            <p className={`mt-1 text-sm ${
              isSuperAdmin ? "text-purple-700" : "text-blue-700"
            }`}>
              {isSuperAdmin 
                ? "Platform-level administration. You can manage all colleges, view system-wide statistics, and access all features."
                : "All data shown is scoped to your college. You can only view and manage users, posts, events, and content within your institution."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">
          {isSuperAdmin 
            ? "Welcome to the platform administration dashboard"
            : "Welcome to your college community admin dashboard"
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    View all →
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/users/create" className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Users className="h-5 w-5 mr-2" />
            Create New User
          </Link>
          <Link href="/dashboard/departments" className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Building2 className="h-5 w-5 mr-2" />
            Add Department
          </Link>
          <Link href="/dashboard/events/create" className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <Calendar className="h-5 w-5 mr-2" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Recent Users
            </span>
            <Link href="/dashboard/users" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </h3>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/dashboard/users/${user.id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'staff' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No recent users to display
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-600" />
              Upcoming Events
            </span>
            <Link href="/dashboard/events" className="text-sm text-orange-600 hover:text-orange-800">
              View all →
            </Link>
          </h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(event.start_time), 'MMM d, yyyy h:mm a')}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500 truncate">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0 ${
                    event.status === 'published' ? 'bg-green-100 text-green-800' :
                    event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {event.status}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No upcoming events
              </p>
            )}
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
