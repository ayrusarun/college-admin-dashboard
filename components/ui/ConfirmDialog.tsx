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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${iconBgColor} mx-auto mb-4`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6" dangerouslySetInnerHTML={{ __html: message }} />
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${confirmBgColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
