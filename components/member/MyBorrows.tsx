"use client";

import { useState, useEffect, useTransition } from "react";
import { getMyTransactions, confirmPickup } from "@/app/(actions)/transactions";
import { TransactionResponse } from "@/app/(actions)/types";
import { ReturnForm } from "./ReturnForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { Loader2, Package, Clock, Undo2, History, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function MyBorrows() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedForReturn, setSelectedForReturn] = useState<{id: string, name: string} | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await getMyTransactions({ pageSize: 50 });
      if (response.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleConfirmPickup = (proposalId: string) => {
    startTransition(async () => {
      try {
        const response = await confirmPickup({ proposalId });
        if (response.success) {
          toast.success("Pickup confirmed!");
          fetchTransactions();
        } else {
          toast.error(response.error?.message || "Failed to confirm pickup");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const active = transactions.filter(t => 
    t.status === "ACTIVE" || t.status === "BORROWED" || t.status === "OVERDUE"
  );
  
  const history = transactions.filter(t => 
    t.status === "RETURNED" || t.status === "DONE"
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Borrows</h2>
        <p className="text-muted-foreground">Manage your active loans and view history.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">
            <Package className="w-4 h-4 mr-2" />
            Active Loans ({active.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History ({history.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Active Loans Tab */}
        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : active.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No active loans</h3>
              <p className="text-slate-500 text-sm mt-1">You don't have any active borrowed items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map(txn => {
                const isOverdue = txn.dueDate && isPast(new Date(txn.dueDate));
                const isReadyForPickup = txn.status === "ACTIVE"; // From proposal APPROVED -> transaction ACTIVE

                return (
                  <div key={txn.id} className={`p-5 border rounded-xl shadow-sm bg-white dark:bg-slate-950 flex flex-col ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{txn.itemName}</h3>
                        <p className="text-sm text-slate-500">Qty: {txn.quantity}</p>
                      </div>
                      <Badge variant={isOverdue ? "destructive" : isReadyForPickup ? "secondary" : "default"} className={
                        isReadyForPickup ? "bg-amber-100 text-amber-800 border-amber-200" : 
                        !isOverdue ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""
                      }>
                        {isOverdue ? "OVERDUE" : isReadyForPickup ? "READY FOR PICKUP" : txn.status}
                      </Badge>
                    </div>

                    <div className="mt-auto pt-4 border-t space-y-4">
                      {txn.dueDate && !isReadyForPickup && (
                        <div className="flex items-center text-sm">
                          <Clock className={`w-4 h-4 mr-2 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`} />
                          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}>
                            Due {format(new Date(txn.dueDate), "MMM d, yyyy")} 
                            {!isOverdue && <span className="text-slate-400 ml-1">({formatDistanceToNow(new Date(txn.dueDate))} left)</span>}
                          </span>
                        </div>
                      )}
                      
                      {isReadyForPickup && (
                        <div className="flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded-md">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Please pick up this item from the admin.
                        </div>
                      )}

                      <div className="flex gap-2 w-full">
                        {isReadyForPickup ? (
                          <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700" 
                            onClick={() => handleConfirmPickup(txn.proposalId)}
                            disabled={isPending}
                          >
                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            Confirm Pickup
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700" 
                            onClick={() => setSelectedForReturn({ id: txn.proposalId, name: txn.itemName })}
                            disabled={isPending}
                          >
                            <Undo2 className="w-4 h-4 mr-2" /> Return Item
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No history</h3>
              <p className="text-slate-500 text-sm mt-1">Your past transactions will appear here.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
              <div className="divide-y">
                {history.map(txn => (
                  <div key={txn.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-lg">{txn.itemName}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs font-normal">
                            {txn.type}
                          </Badge>
                        </span>
                        <span>•</span>
                        <span>Qty: {txn.quantity}</span>
                        {txn.returnedAt && (
                          <>
                            <span>•</span>
                            <span>Returned: {format(new Date(txn.returnedAt), "MMM d, yyyy")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge variant="secondary" className={txn.status === "RETURNED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Return Modal */}
      {selectedForReturn && (
        <ReturnForm 
          open={!!selectedForReturn} 
          onOpenChange={(open) => !open && setSelectedForReturn(null)}
          proposalId={selectedForReturn.id}
          itemName={selectedForReturn.name}
          onSuccess={fetchTransactions}
        />
      )}
    </div>
  );
}
