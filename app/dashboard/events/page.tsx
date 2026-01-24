"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  List,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Calendar, dateFnsLocalizer, View, SlotInfo, ToolbarProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { eventApi } from "@/lib/api/client";
import { Event } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

// Custom Calendar Toolbar
function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps<CalendarEvent, object>) {
  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("PREV")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={() => onNavigate("TODAY")}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <h2 className="text-lg font-semibold text-gray-900">{label}</h2>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView("month")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            view === "month"
              ? "bg-blue-600 text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => onView("week")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            view === "week"
              ? "bg-blue-600 text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onView("day")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            view === "day"
              ? "bg-blue-600 text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Day
        </button>
        <button
          onClick={() => onView("agenda")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            view === "agenda"
              ? "bg-blue-600 text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Agenda
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [showListView, setShowListView] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [deletingEventTitle, setDeletingEventTitle] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const eventsResponse = await eventApi.list({ limit: 1000 });
      setEvents(eventsResponse.data);
    } catch (error) {
      console.error("Failed to load events:", error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: number, eventTitle: string) => {
    setDeletingEventId(eventId);
    setDeletingEventTitle(eventTitle);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!deletingEventId) return;

    try {
      await eventApi.delete(deletingEventId);
      alert("Event deleted successfully!");
      loadData();
      setSelectedEvent(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    }
  };

  // Convert events to calendar format
  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.event_start_time),
    end: new Date(event.event_end_time),
    resource: event,
  }));

  // Handle slot selection (click on calendar to create event)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const startTime = slotInfo.start.toISOString();
    const endTime = slotInfo.end.toISOString();
    router.push(`/dashboard/events/create?start=${startTime}&end=${endTime}`);
  }, [router]);

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  }, []);

  // Custom event style
  const eventStyleGetter = (event: CalendarEvent) => {
    const eventData = event.resource;
    let backgroundColor = "#3182ce";

    if (eventData.status === "CANCELLED") {
      backgroundColor = "#e53e3e";
    } else if (eventData.status === "DRAFT") {
      backgroundColor = "#718096";
    } else if (eventData.status === "COMPLETED") {
      backgroundColor = "#38a169";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case "ONLINE":
        return "bg-purple-100 text-purple-800";
      case "OFFLINE":
        return "bg-blue-100 text-blue-800";
      case "HYBRID":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-7 w-7 mr-2 text-blue-600" />
            Events Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage all events in your college ({events.length} total)
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowListView(!showListView)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {showListView ? <CalendarIcon className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
            {showListView ? "Calendar View" : "List View"}
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => router.push("/dashboard/events/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {events.filter((e) => e.status === "PUBLISHED").length}
            </p>
            <p className="text-sm font-medium text-gray-600">Published</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {events.filter((e) => e.status === "DRAFT").length}
            </p>
            <p className="text-sm font-medium text-gray-600">Drafts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {events.filter((e) => new Date(e.event_start_time) > new Date()).length}
            </p>
            <p className="text-sm font-medium text-gray-600">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {events.reduce((sum, e) => sum + e.current_attendees, 0)}
            </p>
            <p className="text-sm font-medium text-gray-600">Total Attendees</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar/List View */}
        <div className={selectedEvent ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading events...</span>
              </div>
            ) : showListView ? (
              /* List View */
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Events</h3>
                {events.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No events found</p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(new Date(event.event_start_time), "PPp")}
                            </div>
                            {event.venue_location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.venue_location}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {event.current_attendees}
                              {event.max_attendees ? ` / ${event.max_attendees}` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              event.status
                            )}`}
                          >
                            {capitalize(event.status)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModeBadge(
                              event.event_mode
                            )}`}
                          >
                            {capitalize(event.event_mode)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Calendar View */
              <div style={{ height: "700px" }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  views={["month", "week", "day", "agenda"]}
                  components={{
                    toolbar: CustomToolbar,
                  }}
                  popup
                />
              </div>
            )}
          </div>
        </div>

        {/* Event Details Sidebar */}
        {selectedEvent && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{selectedEvent.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{selectedEvent.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                      selectedEvent.status
                    )}`}
                  >
                    {capitalize(selectedEvent.status)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModeBadge(
                      selectedEvent.event_mode
                    )}`}
                  >
                    {capitalize(selectedEvent.event_mode)}
                  </span>
                  {selectedEvent.is_full && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      FULL
                    </span>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(selectedEvent.event_start_time), "PPp")}
                      </p>
                      <p className="text-xs text-gray-500">
                        to {format(new Date(selectedEvent.event_end_time), "PPp")}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.venue_location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{selectedEvent.venue_location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Attendees</p>
                      <p className="text-sm text-gray-600">
                        {selectedEvent.current_attendees}
                        {selectedEvent.max_attendees
                          ? ` / ${selectedEvent.max_attendees} (${Math.round(
                              (selectedEvent.current_attendees / selectedEvent.max_attendees) * 100
                            )}%)`
                          : " registered"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <button
                    onClick={() => router.push(`/dashboard/events/${selectedEvent.id}`)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/events/${selectedEvent.id}/edit`)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteEvent(selectedEvent.id, selectedEvent.title)
                    }
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteEvent}
        title="Confirm Delete Event"
        message={`Are you sure you want to delete <strong>${deletingEventTitle}</strong>? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
