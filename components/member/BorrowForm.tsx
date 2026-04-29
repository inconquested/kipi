"use client";

import { useState, useTransition } from "react";
import { ItemSearch } from "@/components/shared/ItemSearch";
import { QRScanner } from "@/components/shared/QRScanner";
import { createProposal } from "@/app/(actions)/proposals";
import { getItemByQRCode } from "@/app/(actions)/items";
import { ItemResponse } from "@/app/(actions)/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, PackageSearch, ScanLine, X, Package } from "lucide-react";

export interface BorrowFormProps {
  onSuccess?: () => void;
}

export function BorrowForm({ onSuccess }: BorrowFormProps) {
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<"LOAN" | "CONSUMPTION">("LOAN");
  const [purpose, setPurpose] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error("Please select an item first");
      return;
    }

    if (quantity <= 0 || quantity > selectedItem.qtyAvailable) {
      toast.error(`Invalid quantity (max available: ${selectedItem.qtyAvailable})`);
      return;
    }

    startTransition(async () => {
      try {
        const response = await createProposal({
          itemId: selectedItem.id,
          quantity,
          type,
          purpose: purpose.trim() || undefined,
        });

        if (!response.success) {
          toast.error(response.error?.message || "Failed to create request");
          return;
        }

        toast.success("Request created successfully!");
        onSuccess?.();
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleQRScan = async (qrCode: string) => {
    setIsScanning(true);
    try {
      const response = await getItemByQRCode(qrCode);
      if (response.success) {
        setSelectedItem(response.data);
        toast.success("Item found!");
      } else {
        toast.error(response.error?.message || "Item not found");
      }
    } catch (error) {
      toast.error("Failed to process QR code");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-md overflow-hidden">
      <div className="bg-emerald-600 h-2 w-full"></div>
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b pb-8">
        <CardTitle className="text-2xl text-slate-900 dark:text-white flex items-center gap-2">
          <PackageSearch className="w-6 h-6 text-emerald-600" />
          Request an Item
        </CardTitle>
        <CardDescription>
          Search for an item or scan its QR code to submit a borrow or consumption request.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <form id="borrow-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Request Type */}
          <div className="space-y-3">
            <Label className="text-base">Request Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`border rounded-xl p-4 cursor-pointer transition-all ${type === "LOAN" ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30" : "border-slate-200 hover:border-emerald-200"}`}
                onClick={() => setType("LOAN")}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">Borrow (Loan)</h4>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === "LOAN" ? "border-emerald-500" : "border-slate-300"}`}>
                    {type === "LOAN" && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                  </div>
                </div>
                <p className="text-xs text-slate-500">You will return this item later.</p>
              </div>
              <div 
                className={`border rounded-xl p-4 cursor-pointer transition-all ${type === "CONSUMPTION" ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30" : "border-slate-200 hover:border-emerald-200"}`}
                onClick={() => setType("CONSUMPTION")}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">Consume</h4>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${type === "CONSUMPTION" ? "border-emerald-500" : "border-slate-300"}`}>
                    {type === "CONSUMPTION" && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                  </div>
                </div>
                <p className="text-xs text-slate-500">Single-use item, no return needed.</p>
              </div>
            </div>
          </div>

          {!selectedItem ? (
            <div className="space-y-4">
              <Label className="text-base">Select Item</Label>
              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-900">
                  <TabsTrigger value="search" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                    <PackageSearch className="w-4 h-4 mr-2" /> Search Item
                  </TabsTrigger>
                  <TabsTrigger value="scan" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                    <ScanLine className="w-4 h-4 mr-2" /> Scan QR
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="search" className="mt-0">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-dashed">
                    <ItemSearch onSelect={setSelectedItem} />
                    <p className="text-xs text-center text-slate-500 mt-4">
                      Type the name or category of the item you need.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="scan" className="mt-0">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-dashed flex flex-col items-center">
                    {isScanning ? (
                      <div className="py-12 flex flex-col items-center gap-4 text-emerald-600">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="font-medium">Processing QR code...</p>
                      </div>
                    ) : (
                      <QRScanner onScan={handleQRScan} />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base flex justify-between">
                  <span>Selected Item</span>
                  <button type="button" onClick={() => setSelectedItem(null)} className="text-sm text-red-500 hover:text-red-700 flex items-center">
                    <X className="w-3 h-3 mr-1" /> Change Item
                  </button>
                </Label>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-emerald-600">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1">{selectedItem.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="bg-white dark:bg-slate-900">{selectedItem.category}</Badge>
                      <Badge variant="outline">{selectedItem.departmentName}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-slate-500">Available:</span>
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        {selectedItem.qtyAvailable} {selectedItem.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="relative">
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      max={selectedItem.qtyAvailable}
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                      className="pr-16 text-lg font-medium h-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      {selectedItem.unit}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Max allowed: {selectedItem.qtyAvailable}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose (Optional)</Label>
                <Textarea 
                  id="purpose"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="Briefly describe why you need this item..."
                  className="resize-none h-24"
                />
              </div>
            </div>
          )}

        </form>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900 p-6 border-t flex justify-end">
        <Button 
          type="submit" 
          form="borrow-form"
          disabled={!selectedItem || isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto px-8"
          size="lg"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
          ) : (
            "Submit Request"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
