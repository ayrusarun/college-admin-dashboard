"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Link as LinkIcon,
  Clock,
  FileText,
  Save,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { eventApi } from "@/lib/api/client";

interface CustomQuestion {
  id: string;
  field_name: string;
  field_type: "TEXT" | "NUMBER" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "YES_NO";
  is_required: boolean;
  options?: string[];
  placeholder?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_mode: "OFFLINE" as "ONLINE" | "OFFLINE" | "HYBRID",
    venue_location: "",
    online_link: "",
    event_start_time: "",
    event_end_time: "",
    registration_start_time: "",
    registration_end_time: "",
    max_attendees: "",
    requires_approval: false,
    banner_image_url: "",
  });

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Custom Questions Management
  const addQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: `temp-${Date.now()}`,
      field_name: "",
      field_type: "TEXT",
      is_required: false,
      options: [],
      placeholder: "",
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setCustomQuestions(
      customQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const addOption = (questionId: string) => {
    const question = customQuestions.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...(question.options || []), ""];
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = customQuestions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = customQuestions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  // Date Helper Functions
  const setEventEndFromStart = (hours: number) => {
    if (!formData.event_start_time) {
      alert("Please set Event Start time first");
      return;
    }
    const startDate = new Date(formData.event_start_time);
    const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
    const endTimeString = endDate.toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, event_end_time: endTimeString }));
  };

  const setRegistrationEndFromEventStart = (type: "1hour" | "1day" | "1week") => {
    if (!formData.event_start_time) {
      alert("Please set Event Start time first");
      return;
    }
    const eventStartDate = new Date(formData.event_start_time);
    let milliseconds = 0;
    
    switch (type) {
      case "1hour":
        milliseconds = 60 * 60 * 1000;
        break;
      case "1day":
        milliseconds = 24 * 60 * 60 * 1000;
        break;
      case "1week":
        milliseconds = 7 * 24 * 60 * 60 * 1000;
        break;
    }
    
    const regEndDate = new Date(eventStartDate.getTime() - milliseconds);
    const regEndTimeString = regEndDate.toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, registration_end_time: regEndTimeString }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API
      const eventData: any = {
        title: formData.title,
        description: formData.description,
        event_mode: formData.event_mode,
        event_start_time: new Date(formData.event_start_time).toISOString(),
        event_end_time: new Date(formData.event_end_time).toISOString(),
        requires_approval: formData.requires_approval,
      };

      // Add optional fields
      if (formData.venue_location) eventData.venue_location = formData.venue_location;
      if (formData.online_link) eventData.online_link = formData.online_link;
      if (formData.max_attendees) eventData.max_attendees = parseInt(formData.max_attendees);
      if (formData.banner_image_url) eventData.banner_image_url = formData.banner_image_url;
      if (formData.registration_start_time) {
        eventData.registration_start_time = new Date(formData.registration_start_time).toISOString();
      }
      if (formData.registration_end_time) {
        eventData.registration_end_time = new Date(formData.registration_end_time).toISOString();
      }

      const response = await eventApi.create(eventData);
      const eventId = response.data.id;

      // Create custom questions if any
      if (customQuestions.length > 0) {
        console.log("Creating custom questions:", customQuestions);
        for (const question of customQuestions) {
          if (question.field_name.trim()) {
            try {
              const fieldData = {
                field_name: question.field_name,
                field_type: question.field_type,
                is_required: question.is_required,
                options: question.options && question.options.length > 0 ? question.options : undefined,
                placeholder: question.placeholder || undefined,
              };
              console.log("Adding custom field:", fieldData);
              await eventApi.addCustomField(eventId, fieldData);
            } catch (fieldError: any) {
              console.error("Failed to create custom field:", fieldError);
              console.error("Field data:", question);
              // Continue with other fields even if one fails
            }
          }
        }
      }

      alert("Event created successfully as DRAFT! You can publish it from the event detail page to make it visible to students.");
      router.push(`/dashboard/events/${eventId}`);
    } catch (error: any) {
      console.error("Failed to create event:", error);
      alert(error.response?.data?.detail || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
            <p className="text-gray-600 mt-1">Fill in the details to create a new event</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Annual Tech Conference 2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your event in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image URL (optional)
              </label>
              <input
                type="url"
                name="banner_image_url"
                value={formData.banner_image_url}
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Event Mode & Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Event Mode & Location
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Mode <span className="text-red-600">*</span>
              </label>
              <select
                name="event_mode"
                value={formData.event_mode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="OFFLINE">Offline (In-Person)</option>
                <option value="ONLINE">Online (Virtual)</option>
                <option value="HYBRID">Hybrid (Both)</option>
              </select>
            </div>

            {(formData.event_mode === "OFFLINE" || formData.event_mode === "HYBRID") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Location <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="venue_location"
                  value={formData.venue_location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Main Auditorium, Building A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {(formData.event_mode === "ONLINE" || formData.event_mode === "HYBRID") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Meeting Link <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="online_link"
                    value={formData.online_link}
                    onChange={handleChange}
                    required
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Date & Time
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Start <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="event_start_time"
                  value={formData.event_start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event End <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="event_end_time"
                  value={formData.event_end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEventEndFromStart(1)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    +1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventEndFromStart(6)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    +6 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventEndFromStart(24)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    +1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventEndFromStart(48)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    +2 Days
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Start (optional)
                </label>
                <input
                  type="datetime-local"
                  name="registration_start_time"
                  value={formData.registration_start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration End (optional)
                </label>
                <input
                  type="datetime-local"
                  name="registration_end_time"
                  value={formData.registration_end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setRegistrationEndFromEventStart("1hour")}
                    className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                  >
                    1hr Before Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationEndFromEventStart("1day")}
                    className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                  >
                    1 Day Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationEndFromEventStart("1week")}
                    className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                  >
                    1 Week Before
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Registration Questions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Custom Registration Questions</h3>
                <p className="text-sm text-gray-600 mt-0.5">Add custom fields to collect additional information from attendees</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>

          {customQuestions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 text-sm">No custom questions added yet</p>
              <p className="text-gray-500 text-xs mt-1">Click "Add Question" to create custom registration fields</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customQuestions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={question.field_name}
                        onChange={(e) => updateQuestion(question.id, { field_name: e.target.value })}
                        placeholder="e.g., What is your T-shirt size?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Type
                        </label>
                        <select
                          value={question.field_type}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              field_type: e.target.value as CustomQuestion["field_type"],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="TEXT">Text</option>
                          <option value="NUMBER">Number</option>
                          <option value="SINGLE_CHOICE">Select One</option>
                          <option value="MULTI_CHOICE">Multiple Choice</option>
                          <option value="YES_NO">Yes/No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placeholder (optional)
                        </label>
                        <input
                          type="text"
                          value={question.placeholder || ""}
                          onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                          placeholder="e.g., Enter your answer here"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {(question.field_type === "SINGLE_CHOICE" || question.field_type === "MULTI_CHOICE") && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(question.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {(!question.options || question.options.length === 0) ? (
                            <p className="text-sm text-gray-500 italic">No options added yet. Click "Add Option" to get started.</p>
                          ) : (
                            question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 min-w-[24px]">{optionIndex + 1}.</span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.is_required}
                        onChange={(e) => updateQuestion(question.id, { is_required: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${question.id}`} className="ml-2 block text-sm text-gray-700">
                        Required field
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Capacity & Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Capacity & Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attendees (optional)
              </label>
              <input
                type="number"
                name="max_attendees"
                value={formData.max_attendees}
                onChange={handleChange}
                min="1"
                placeholder="Leave empty for unlimited"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if there's no attendance limit
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requires_approval"
                name="requires_approval"
                checked={formData.requires_approval}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requires_approval" className="ml-2 block text-sm text-gray-700">
                Require manual approval for registrations
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/events")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
