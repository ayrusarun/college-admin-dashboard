"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { eventApi } from "@/lib/api/client";
import {
  Event,
  EventAnalytics,
  EventFeedbackSummary,
  EventAttendee,
  CustomField,
} from "@/lib/types";
import { format } from "date-fns";
import { capitalize } from "@/lib/utils";
import { ConfirmModal, AlertModal } from "@/components/Modal";

type TabType = "overview" | "attendees" | "feedback" | "analytics" | "questionnaire" | "settings";

type ModalState = {
  type: "delete" | "publish" | "cancel" | "alert" | null;
  title: string;
  message: string;
  loading: boolean;
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);
  
  console.log("EventDetailPage - Event ID:", eventId, "Type:", typeof eventId);

  const [event, setEvent] = useState<Event | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [feedbackSummary, setFeedbackSummary] = useState<EventFeedbackSummary | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [modal, setModal] = useState<ModalState>({
    type: null,
    title: "",
    message: "",
    loading: false,
  });

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load event first (critical)
      console.log("Loading event with ID:", eventId);
      const eventRes = await eventApi.getById(eventId);
      console.log("Event loaded successfully:", eventRes.data);
      setEvent(eventRes.data);

      // Load other data (non-critical, handle failures gracefully)
      try {
        const analyticsRes = await eventApi.getAnalytics(eventId);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.warn("Failed to load analytics:", error);
        setAnalytics(null);
      }

      try {
        const feedbackRes = await eventApi.getFeedbackSummary(eventId);
        setFeedbackSummary(feedbackRes.data);
      } catch (error) {
        console.warn("Failed to load feedback:", error);
        setFeedbackSummary(null);
      }

      try {
        const attendeesRes = await eventApi.getAttendees(eventId);
        setAttendees(attendeesRes.data);
      } catch (error) {
        console.warn("Failed to load attendees:", error);
        setAttendees([]);
      }

      try {
        const fieldsRes = await eventApi.getCustomFields(eventId);
        console.log("Custom fields loaded:", fieldsRes.data);
        setCustomFields(fieldsRes.data);
      } catch (error) {
        console.warn("Failed to load custom fields:", error);
        setCustomFields([]);
      }
    } catch (error: any) {
      console.error("Failed to load event data:", error);
      console.error("Error details:", error.response?.data);
      setModal({
        type: "alert",
        title: "Error",
        message: `Failed to load event details: ${error.response?.data?.detail || error.message || 'Unknown error'}`,
        loading: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setModal({
      type: "delete",
      title: "Delete Event",
      message: `Are you sure you want to delete "${event?.title}"? This action cannot be undone.`,
      loading: false,
    });
  };

  const confirmDelete = async () => {
    setModal((prev) => ({ ...prev, loading: true }));
    try {
      await eventApi.delete(eventId);
      setModal({
        type: "alert",
        title: "Success",
        message: "Event deleted successfully!",
        loading: false,
      });
      setTimeout(() => router.push("/dashboard/events"), 1500);
    } catch (error) {
      console.error("Failed to delete event:", error);
      setModal({
        type: "alert",
        title: "Error",
        message: "Failed to delete event. Please try again.",
        loading: false,
      });
    }
  };

  const handlePublish = () => {
    setModal({
      type: "publish",
      title: "Publish Event",
      message: `Publish "${event?.title}"? This will make it visible to all users.`,
      loading: false,
    });
  };

  const confirmPublish = async () => {
    setModal((prev) => ({ ...prev, loading: true }));
    try {
      await eventApi.publish(eventId);
      setModal({
        type: "alert",
        title: "Success",
        message: "Event published successfully!",
        loading: false,
      });
      setTimeout(() => {
        setModal({ type: null, title: "", message: "", loading: false });
        loadData();
      }, 1500);
    } catch (error) {
      console.error("Failed to publish event:", error);
      setModal({
        type: "alert",
        title: "Error",
        message: "Failed to publish event. Please try again.",
        loading: false,
      });
    }
  };

  const handleCancel = () => {
    setModal({
      type: "cancel",
      title: "Cancel Event",
      message: `Cancel "${event?.title}"? Attendees will be notified.`,
      loading: false,
    });
  };

  const confirmCancel = async () => {
    setModal((prev) => ({ ...prev, loading: true }));
    try {
      await eventApi.cancel(eventId);
      setModal({
        type: "alert",
        title: "Success",
        message: "Event cancelled successfully!",
        loading: false,
      });
      setTimeout(() => {
        setModal({ type: null, title: "", message: "", loading: false });
        loadData();
      }, 1500);
    } catch (error) {
      console.error("Failed to cancel event:", error);
      setModal({
        type: "alert",
        title: "Error",
        message: "Failed to cancel event. Please try again.",
        loading: false,
      });
    }
  };

  const handleApproveRegistration = async (registrationId: number) => {
    try {
      await eventApi.approveRegistration(eventId, registrationId);
      alert("Registration approved!");
      loadData();
    } catch (error) {
      console.error("Failed to approve registration:", error);
      alert("Failed to approve registration");
    }
  };

  const handleRejectRegistration = async (registrationId: number) => {
    try {
      await eventApi.rejectRegistration(eventId, registrationId);
      alert("Registration rejected!");
      loadData();
    } catch (error) {
      console.error("Failed to reject registration:", error);
      alert("Failed to reject registration");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading event...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Event not found</p>
        <button
          onClick={() => router.push("/dashboard/events")}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PUBLISHED: "bg-green-100 text-green-800",
      DRAFT: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "attendees", label: "Attendees", icon: Users, count: attendees.length },
    { id: "feedback", label: "Feedback", icon: MessageSquare, count: feedbackSummary?.total_feedback },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "questionnaire", label: "Questionnaire", icon: FileText, count: customFields.length },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/events")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                  event.status
                )}`}
              >
                {capitalize(event.status)}
              </span>
              <span className="text-sm text-gray-500">
                {format(new Date(event.event_start_time), "PPp")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {event.status === "DRAFT" && (
            <button
              onClick={handlePublish}
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Publish
            </button>
          )}
          {event.status === "PUBLISHED" && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Event
            </button>
          )}
          <button
            onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab event={event} analytics={analytics} />
          )}
          {activeTab === "attendees" && (
            <AttendeesTab
              attendees={attendees}
              onApprove={handleApproveRegistration}
              onReject={handleRejectRegistration}
            />
          )}
          {activeTab === "feedback" && (
            <FeedbackTab eventId={eventId} feedbackSummary={feedbackSummary} />
          )}
          {activeTab === "analytics" && (
            <AnalyticsTab analytics={analytics} feedbackSummary={feedbackSummary} />
          )}
          {activeTab === "questionnaire" && (
            <QuestionnaireTab eventId={eventId} customFields={customFields} onUpdate={loadData} />
          )}
          {activeTab === "settings" && (
            <SettingsTab event={event} onUpdate={loadData} />
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={modal.type === "delete"}
        onClose={() => setModal({ type: null, title: "", message: "", loading: false })}
        onConfirm={confirmDelete}
        title={modal.title}
        message={modal.message}
        confirmText="Delete"
        confirmColor="red"
        loading={modal.loading}
      />

      <ConfirmModal
        isOpen={modal.type === "publish"}
        onClose={() => setModal({ type: null, title: "", message: "", loading: false })}
        onConfirm={confirmPublish}
        title={modal.title}
        message={modal.message}
        confirmText="Publish"
        confirmColor="green"
        loading={modal.loading}
      />

      <ConfirmModal
        isOpen={modal.type === "cancel"}
        onClose={() => setModal({ type: null, title: "", message: "", loading: false })}
        onConfirm={confirmCancel}
        title={modal.title}
        message={modal.message}
        confirmText="Cancel Event"
        confirmColor="orange"
        loading={modal.loading}
      />

      <AlertModal
        isOpen={modal.type === "alert"}
        onClose={() => setModal({ type: null, title: "", message: "", loading: false })}
        title={modal.title}
        message={modal.message}
        type={modal.title === "Error" ? "error" : "success"}
      />
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ event, analytics }: { event: Event; analytics: EventAnalytics | null }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-600">Total Registrations</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {analytics?.total_registrations || 0}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm font-medium text-green-600">Approved</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {analytics?.approved_registrations || 0}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-600">Checked In</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {analytics?.total_checked_in || 0}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm font-medium text-orange-600">Capacity</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {analytics?.capacity_percentage != null ? analytics.capacity_percentage.toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(event.event_start_time), "PPp")}
                </p>
                <p className="text-xs text-gray-500">
                  to {format(new Date(event.event_end_time), "PPp")}
                </p>
              </div>
            </div>

            {event.event_mode === "OFFLINE" || event.event_mode === "HYBRID" ? (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Venue</p>
                  <p className="text-sm text-gray-600">{event.venue_location || "TBA"}</p>
                </div>
              </div>
            ) : null}

            {(event.event_mode === "ONLINE" || event.event_mode === "HYBRID") && event.online_link && (
              <div className="flex items-start">
                <LinkIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Online Link</p>
                  <a
                    href={event.online_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {event.online_link}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Capacity</p>
                <p className="text-sm text-gray-600">
                  {event.current_attendees}
                  {event.max_attendees ? ` / ${event.max_attendees}` : " attendees"}
                  {event.is_full && (
                    <span className="ml-2 text-xs text-red-600 font-medium">FULL</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                {event.organizer_name?.charAt(0) || "O"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{event.organizer_name}</p>
                <p className="text-sm text-gray-500">{event.organizer_email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Attendees Tab Component
function AttendeesTab({
  attendees,
  onApprove,
  onReject,
}: {
  attendees: EventAttendee[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const [filter, setFilter] = useState("ALL");

  const filteredAttendees = attendees.filter(
    (a) => filter === "ALL" || a.status === filter
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      REJECTED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      WAITLISTED: "bg-purple-100 text-purple-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Attendees ({filteredAttendees.length})
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filteredAttendees.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No attendees found</p>
      ) : (
        <div className="space-y-3">
          {filteredAttendees.map((attendee) => (
            <div
              key={attendee.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center flex-1">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                  {attendee.user_name.charAt(0)}
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-900">{attendee.user_name}</p>
                  <p className="text-sm text-gray-500">{attendee.user_email}</p>
                  {attendee.user_department && (
                    <p className="text-xs text-gray-400">{attendee.user_department}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                    attendee.status
                  )}`}
                >
                  {capitalize(attendee.status)}
                </span>

                {attendee.checked_in_at && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Checked In
                  </span>
                )}

                {attendee.status === "PENDING" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onApprove(attendee.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(attendee.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Feedback Tab Component (continued in next message due to length)
function FeedbackTab({
  eventId,
  feedbackSummary,
}: {
  eventId: number;
  feedbackSummary: EventFeedbackSummary | null;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <p className="text-sm font-medium text-blue-600">Total Feedback</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {feedbackSummary?.total_feedback || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
          <p className="text-sm font-medium text-yellow-600">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">
            {feedbackSummary?.average_rating.toFixed(1) || "0.0"} / 5.0
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <p className="text-sm font-medium text-purple-600">Response Rate</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            {feedbackSummary?.total_feedback || 0}%
          </p>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      {feedbackSummary && feedbackSummary.total_feedback > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = feedbackSummary.rating_distribution[rating.toString() as keyof typeof feedbackSummary.rating_distribution] || 0;
              const percentage = feedbackSummary.total_feedback > 0
                ? (count / feedbackSummary.total_feedback) * 100
                : 0;

              return (
                <div key={rating} className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-16">
                    {rating} Star{rating !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full flex items-center justify-end px-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-xs font-medium text-white">
                            {percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      {feedbackSummary?.recent_feedback && feedbackSummary.recent_feedback.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
          <div className="space-y-4">
            {feedbackSummary.recent_feedback.map((feedback) => (
              <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      {feedback.user_name?.charAt(0) || "U"}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {feedback.user_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(feedback.created_at), "PP")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < feedback.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-gray-600 mt-2">{feedback.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics Tab Component  
function AnalyticsTab({
  analytics,
  feedbackSummary,
}: {
  analytics: EventAnalytics | null;
  feedbackSummary: EventFeedbackSummary | null;
}) {
  if (!analytics) return <p>No analytics data available</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-900">{analytics.total_registrations}</p>
              <p className="text-sm text-blue-600 mt-1">Total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-900">{analytics.approved_registrations}</p>
              <p className="text-sm text-green-600 mt-1">Approved</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-900">{analytics.pending_registrations}</p>
              <p className="text-sm text-yellow-600 mt-1">Pending</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-900">{analytics.rejected_registrations}</p>
              <p className="text-sm text-red-600 mt-1">Rejected</p>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-900">{analytics.total_checked_in}</p>
              <p className="text-sm text-purple-600 mt-1">Checked In</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-900">{analytics.total_checked_out}</p>
              <p className="text-sm text-indigo-600 mt-1">Checked Out</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-900">
                {analytics.capacity_percentage.toFixed(0)}%
              </p>
              <p className="text-sm text-orange-600 mt-1">Capacity Filled</p>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-teal-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-teal-900">{feedbackSummary?.total_feedback || 0}</p>
              <p className="text-sm text-teal-600 mt-1">Total Feedback</p>
            </div>
            <div className="bg-cyan-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-cyan-900">
                {feedbackSummary?.average_rating.toFixed(1) || "0.0"} / 5.0
              </p>
              <p className="text-sm text-cyan-600 mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Questionnaire Tab Component
function QuestionnaireTab({
  eventId,
  customFields,
  onUpdate,
}: {
  eventId: number;
  customFields: CustomField[];
  onUpdate: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Registration Questions ({customFields.length})
        </h3>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Question
        </button>
      </div>

      {customFields.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No custom questions added yet. Add questions to collect additional information from attendees.
        </p>
      ) : (
        <div className="space-y-3">
          {customFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-2">Q{index + 1}.</span>
                    <p className="font-medium text-gray-900">{field.field_name}</p>
                    {field.is_required && (
                      <span className="ml-2 text-xs text-red-600">*Required</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded">
                      {field.field_type}
                    </span>
                    {field.options && field.options.length > 0 && (
                      <span>Options: {field.options.join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ event, onUpdate }: { event: Event; onUpdate: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Registration Approval</p>
              <p className="text-sm text-gray-500">
                Require manual approval for registrations
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${event.requires_approval ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {event.requires_approval ? 'Required' : 'Auto-Approve'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Registration Status</p>
              <p className="text-sm text-gray-500">Current registration window status</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${event.registration_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {event.registration_open ? 'Open' : 'Closed'}
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">Registration Window</p>
            {event.registration_start_time && event.registration_end_time && (
              <div className="text-sm text-gray-600">
                <p>Opens: {format(new Date(event.registration_start_time), "PPp")}</p>
                <p>Closes: {format(new Date(event.registration_end_time), "PPp")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Send className="h-4 w-4 mr-2" />
          Send Notification to Attendees
        </button>
      </div>
    </div>
  );
}
