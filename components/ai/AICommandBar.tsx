"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { aiApi } from "@/lib/api/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AICommandBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

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

    // Expand if not already expanded
    if (!isExpanded) {
      setIsExpanded(true);
    }

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
    if (e.key === "Escape") {
      setIsExpanded(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickActions = [
    { label: "Create user", command: "Create a new user" },
    { label: "Upcoming events", command: "Show upcoming events" },
    { label: "User stats", command: "Show user statistics" },
    { label: "Generate report", command: "Generate a user report" },
  ];

  return (
    <>
      {/* Expanded Chat Area */}
      {isExpanded && (
        <div className="fixed bottom-16 left-64 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 transition-all duration-300">
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-3">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Tell me what you need, and I'll execute it.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(action.command)}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
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
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-600">
                            Yunite AI
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                    <div className="max-w-[70%] rounded-lg p-3 bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Command Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-gray-900 border-t border-gray-700 shadow-lg z-50">
        <div className="flex items-center px-4 py-3 space-x-3">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "Expand chat history"}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-300" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-300" />
            )}
          </button>

          {/* AI Icon */}
          <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Yunite AI to perform any task... (Press Enter to execute, Esc to collapse)"
              className="w-full px-4 py-2 pr-10 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {input && (
              <button
                onClick={() => setInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>

          {/* Clear Chat */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-200 px-2 py-1 hover:bg-gray-800 rounded transition-colors"
              title="Clear chat history"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Actions Bar (when not expanded) */}
        {!isExpanded && messages.length === 0 && (
          <div className="px-4 pb-3 flex items-center space-x-2">
            <span className="text-xs text-gray-400">Quick:</span>
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.command)}
                className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacer to prevent content from being hidden behind the bar */}
      <div className={isExpanded ? "h-[448px]" : "h-16"}></div>
    </>
  );
}
