"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const Icon = variant === "danger" ? Trash2 : AlertTriangle;
  const iconBgColor = variant === "danger" ? "bg-red-100" : "bg-yellow-100";
  const iconColor = variant === "danger" ? "text-red-600" : "text-yellow-600";
  const confirmBgColor = variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700";

  return (
    <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className={`flex items-center justify-center w-16 h-16 rounded-full ${iconBgColor} mx-auto mb-6`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {title}
        </h3>
        <p className="text-base text-gray-600 text-center mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 text-white rounded-xl transition-colors font-semibold text-base shadow-lg ${confirmBgColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
