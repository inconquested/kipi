"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  requireReason?: boolean;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  requireReason = false,
  isLoading = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(requireReason ? reason : undefined);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {requireReason && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Reason (Required)
              </label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading || (requireReason && reason.trim().length === 0)}
            variant={variant}
          >
            {isLoading ? "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
