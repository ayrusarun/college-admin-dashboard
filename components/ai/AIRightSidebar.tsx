"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { aiApi } from "@/lib/api/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIRightSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiApi.ask(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data?.answer || "I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI request failed:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickActions = [
    { label: "👤 Create user", command: "Create a new user" },
    { label: "📅 Upcoming events", command: "Show upcoming events" },
    { label: "📊 User stats", command: "Show user statistics" },
    { label: "📈 Generate report", command: "Generate a user report" },
    { label: "🔍 Find inactive", command: "Find all inactive users" },
  ];

  return (
    <>
      {/* Collapsed Toggle Button */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-l-lg shadow-lg hover:shadow-xl transition-all z-50 group"
          title="Open Yunite AI Agent"
        >
          <div className="flex flex-col items-center space-y-1">
            <Sparkles className="h-5 w-5 group-hover:-rotate-12 transition-transform" />
            <ChevronLeft className="h-4 w-4" />
          </div>
        </button>
      )}

      {/* Sidebar Panel */}
      <div
        className={`flex flex-col bg-gray-900 text-white h-screen fixed right-0 top-0 border-l border-gray-800 transition-all duration-300 z-[60] ${
          isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-80 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between relative">
          <div className="flex items-center space-x-2 flex-1 pr-2">
            <Sparkles className="h-5 w-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold truncate">Yunite AI Agent</h2>
              <p className="text-xs text-purple-100 truncate">Ask me to perform tasks</p>
            </div>
          </div>
          {/* Collapse Button - More Prominent */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 bg-white/10 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0 border border-white/20"
            title="Collapse sidebar"
            aria-label="Collapse AI sidebar"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full p-6 mb-4">
              <Sparkles className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">
              What can I do for you?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              I can help you manage users, events, departments, and automate tasks.
            </p>
            <div className="space-y-2 w-full">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action.command)}
                  className="w-full text-left text-xs p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-400">
                        Yunite AI
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-purple-200"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg p-3 bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-300">Processing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Clear Chat Button */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-800">
          <button
            onClick={clearChat}
            className="w-full text-xs text-gray-400 hover:text-gray-200 py-2 hover:bg-gray-800 rounded transition-colors"
          >
            Clear Chat History
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex flex-col space-y-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what to do..."
            rows={2}
            className="w-full resize-none bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              ⏎ Execute • ⇧⏎ New line
            </p>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="text-sm">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
