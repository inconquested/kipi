"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NotificationBannerProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onDismiss?: () => void;
  autoClose?: number; // ms, 0 = manual
}

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  error: <AlertCircle className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
};

const styles = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

export function NotificationBanner({
  type,
  message,
  onDismiss,
  autoClose = 5000,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 mb-4 rounded-lg border",
        styles[type]
      )}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        {icons[type]}
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 rounded-full hover:bg-black/5 focus:ring-1",
          type === "success" && "hover:bg-emerald-100",
          type === "error" && "hover:bg-red-100",
          type === "info" && "hover:bg-blue-100",
          type === "warning" && "hover:bg-amber-100"
        )}
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
