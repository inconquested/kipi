"use client";

import { useState, useEffect, useTransition } from "react";
import { getPendingProposals, approveProposal, rejectProposal } from "@/app/(actions)/proposals";
import { ProposalResponse } from "@/app/(actions)/types";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApprovalQueue() {
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedProposal, setSelectedProposal] = useState<ProposalResponse | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  
  const [dueDate, setDueDate] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      try {
        const response = await getPendingProposals();
        if (response.success) {
          setProposals(response.data.proposals);
        }
      } catch (error) {
        console.error("Failed to fetch proposals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const handleApprove = () => {
    if (!selectedProposal) return;
    
    // For loans, we might want to require a due date or set a default.
    // Spec says optional for loans, let's just pass it if provided.

    startTransition(async () => {
      try {
        const response = await approveProposal({
          proposalId: selectedProposal.id,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        });

        if (response.success) {
          setProposals(p => p.filter(x => x.id !== selectedProposal.id));
          toast.success("Proposal approved successfully");
          setSelectedProposal(null);
          setAction(null);
          setDueDate("");
        } else {
          toast.error(response.error?.message || "Failed to approve proposal");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleReject = async (reason?: string) => {
    if (!selectedProposal || !reason) return;

    startTransition(async () => {
      try {
        const response = await rejectProposal({
          proposalId: selectedProposal.id,
          reason,
        });

        if (response.success) {
          setProposals(p => p.filter(x => x.id !== selectedProposal.id));
          toast.success("Proposal rejected successfully");
          setSelectedProposal(null);
          setAction(null);
        } else {
          toast.error(response.error?.message || "Failed to reject proposal");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const openApprove = (p: ProposalResponse) => {
    setSelectedProposal(p);
    setAction("approve");
    // Set default due date to 7 days from now for loans if we wanted to
    if (p.type === "LOAN") {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
    } else {
      setDueDate("");
    }
  };

  const openReject = (p: ProposalResponse) => {
    setSelectedProposal(p);
    setAction("reject");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Approval Queue</h2>
          <p className="text-muted-foreground">Manage pending borrow and consumption requests.</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {proposals.length} Pending
        </Badge>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                </TableCell>
              </TableRow>
            ) : proposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  No pending proposals to review.
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <TableCell className="font-medium">{p.itemName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {p.userName.charAt(0)}
                      </div>
                      {p.userName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.type === "LOAN" ? "default" : "outline"} className={p.type === "LOAN" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-purple-100 text-purple-800 hover:bg-purple-100"}>
                      {p.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{p.quantity}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={p.purpose || "N/A"}>
                    {p.purpose || <span className="text-muted-foreground italic">No purpose provided</span>}
                  </TableCell>
                  <TableCell>{format(new Date(p.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={() => openApprove(p)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => openReject(p)}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approve Dialog */}
      <Dialog open={action === "approve"} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request from {selectedProposal?.userName}?
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal?.type === "LOAN" && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  Due Date (Required for loans)
                </Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={isPending}>Cancel</Button>
            <Button 
              onClick={handleApprove} 
              disabled={isPending || (selectedProposal?.type === "LOAN" && !dueDate)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <ConfirmDialog
        open={action === "reject"}
        title="Reject Proposal"
        description={`Are you sure you want to reject the request for ${selectedProposal?.quantity}x ${selectedProposal?.itemName} from ${selectedProposal?.userName}?`}
        onConfirm={handleReject}
        onCancel={() => setAction(null)}
        requireReason
        isLoading={isPending}
        confirmText="Reject Request"
        variant="destructive"
      />
    </div>
  );
}
