"use client";

import { useState, useTransition } from "react";
import { returnItem } from "@/app/(actions)/transactions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Undo2 } from "lucide-react";

export interface ReturnFormProps {
  proposalId: string;
  itemName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReturnForm({ proposalId, itemName, open, onOpenChange, onSuccess }: ReturnFormProps) {
  const [condition, setCondition] = useState<"GOOD" | "DAMAGED" | "LOST">("GOOD");
  const [isPending, startTransition] = useTransition();

  const handleReturn = () => {
    startTransition(async () => {
      try {
        const response = await returnItem({
          proposalId,
          condition,
        });

        if (!response.success) {
          toast.error(response.error?.message || "Failed to return item");
          return;
        }

        toast.success(`Successfully returned ${itemName}`);
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-emerald-600" />
            Return Item
          </DialogTitle>
          <DialogDescription>
            You are returning <span className="font-semibold text-slate-900 dark:text-white">{itemName}</span>. Please specify the condition of the item.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Item Condition</Label>
            <Select 
              value={condition} 
              onValueChange={(val: any) => setCondition(val)}
              disabled={isPending}
            >
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">Good / Normal</SelectItem>
                <SelectItem value="DAMAGED">Damaged / Needs Repair</SelectItem>
                <SelectItem value="LOST">Lost / Missing parts</SelectItem>
              </SelectContent>
            </Select>
            {condition !== "GOOD" && (
              <p className="text-xs text-amber-600 mt-2">
                Note: Returning an item as damaged or lost may require follow-up with the admin.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleReturn} 
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Confirm Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
