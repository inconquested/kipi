"use client";

import { useState, useTransition, useRef } from "react";
import { createItem, updateItem } from "@/app/(actions)/items";
import { ItemResponse, DepartmentResponse } from "@/app/(actions)/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Save, Loader2 } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ItemFormProps {
  item?: ItemResponse | null;
  departments: Partial<DepartmentResponse>[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ItemForm({ item, departments, onSuccess, onCancel }: ItemFormProps) {
  const [isPending, startTransition] = useTransition();
  const [generatedQR, setGeneratedQR] = useState<string | null>(item?.qrCode || null);
  const qrRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || "",
    description: item?.description || "",
    qtyTotal: item?.qtyTotal || 1,
    unit: item?.unit || "pcs",
    departmentId: item?.departmentId || (departments.length > 0 ? departments[0].id : ""),
    lowThreshold: item?.lowThreshold || 5,
    status: item?.status || "ACTIVE",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "qtyTotal" || name === "lowThreshold" ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        let response;
        if (item) {
          response = await updateItem({
            id: item.id,
            ...formData,
          });
        } else {
          response = await createItem({
            ...formData,
          });
        }

        if (!response.success) {
          toast.error(response.error?.message || "Terjadi kesalahan");
          return;
        }

        if (!item && response.data.qrCode) {
          setGeneratedQR(response.data.qrCode);
        }

        toast.success(item ? "Berhasil memperbarui barang!" : "Berhasil mendaftarkan barang!");

        if (item) {
          onSuccess?.();
        }
      } catch (error) {
        toast.error("Terjadi kesalahan sistem");
      }
    });
  };

  const downloadQR = () => {
    if (generatedQR) {
      const link = document.createElement("a");
      link.href = generatedQR;
      link.download = `qr-${formData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <TooltipProvider>
      <Card className="max-w-4xl mx-auto border-border bg-card/80 backdrop-blur-md rounded-none shadow-none relative overflow-hidden hover:border-primary/30 transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <CardHeader className="border-b border-border/50 pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight uppercase">{item ? "Edit Data Barang" : "Tambah Barang Baru"}</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
            {item ? `ID: ${item.id}` : "Lengkapi detail informasi barang di bawah ini"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Nama Barang</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: MacBook Pro M3"
                    className="rounded-none border-border focus-visible:ring-0 focus-visible:border-primary uppercase text-xs transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Kategori</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Elektronik"
                    className="rounded-none border-border focus-visible:ring-0 focus-visible:border-primary uppercase text-xs transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Departemen</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(val) => handleSelectChange("departmentId", val)}
                    disabled={!!item}
                  >
                    <SelectTrigger id="departmentId" className="rounded-none border-border focus:ring-0 focus:border-primary uppercase text-xs transition-all duration-300">
                      <SelectValue placeholder="PILIH DEPARTEMEN" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id as string} className="uppercase text-xs">{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tambahkan informasi detail barang..."
                    className="resize-none h-32 rounded-none border-border focus-visible:ring-0 focus-visible:border-primary uppercase text-xs transition-all duration-300"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qtyTotal" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Total Stok</Label>
                    <Input
                      id="qtyTotal"
                      name="qtyTotal"
                      type="number"
                      min="1"
                      value={formData.qtyTotal}
                      onChange={handleChange}
                      required
                      className="rounded-none border-border focus-visible:ring-0 focus-visible:border-primary transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Satuan</Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      placeholder="PCS"
                      className="rounded-none border-border focus-visible:ring-0 focus-visible:border-primary uppercase text-xs transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lowThreshold" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Batas Minimum</Label>
                    <Input
                      id="lowThreshold"
                      name="lowThreshold"
                      type="number"
                      min="0"
                      value={formData.lowThreshold}
                      onChange={handleChange}
                      className="rounded-none border-border focus-visible:ring-0 focus-visible:border-primary transition-all duration-300"
                    />
                  </div>
                  {item && (
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(val) => handleSelectChange("status", val)}
                      >
                        <SelectTrigger id="status" className="rounded-none border-border focus:ring-0 focus:border-primary uppercase text-xs transition-all duration-300">
                          <SelectValue placeholder="STATUS" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border">
                          <SelectItem value="ACTIVE" className="uppercase text-xs text-emerald-600 font-bold">Aktif</SelectItem>
                          <SelectItem value="INACTIVE" className="uppercase text-xs text-muted-foreground">Tidak Aktif</SelectItem>
                          <SelectItem value="ARCHIVED" className="uppercase text-xs text-destructive font-bold">Diarsipkan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* QR Code Section */}
                {generatedQR && (
                  <div className="mt-6 p-8 bg-muted/20 border border-border border-dashed flex flex-col items-center justify-center gap-6 rounded-none animate-in fade-in zoom-in duration-500">
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Label Identitas</div>
                    <div ref={qrRef} className="p-4 bg-white shadow-none border border-border">
                      <img
                        src={generatedQR}
                        alt="QR Code Item"
                        className="w-[160px] h-[160px] object-contain"
                      />
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" variant="outline" size="sm" onClick={downloadQR} className="rounded-none border-primary text-primary hover:bg-primary/5 uppercase text-[9px] font-bold tracking-widest h-9 transition-all active:scale-95">
                          <Download className="w-4 h-4 mr-2" />
                          Unduh Label
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-[10px] uppercase font-bold">Simpan sebagai gambar PNG</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 border-t border-border/50">
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel} className="rounded-none uppercase text-[10px] font-bold tracking-widest h-10 transition-all hover:bg-muted">
                  Batal
                </Button>
              )}
              {!item && generatedQR && onSuccess ? (
                <Button type="button" onClick={onSuccess} className="rounded-none bg-primary text-primary-foreground shadow-none uppercase text-[10px] font-bold tracking-widest h-10 px-8 transition-all hover:scale-105 active:scale-95">
                  Konfirmasi & Tutup
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" disabled={isPending} className="rounded-none bg-primary text-primary-foreground shadow-none uppercase text-[10px] font-bold tracking-widest h-10 px-8 transition-all hover:scale-105 active:scale-95">
                      {isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyinkronkan...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> {item ? "Simpan Perubahan" : "Simpan Data"}</>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px] uppercase font-bold">{item ? "Simpan perubahan data barang" : "Daftarkan barang ke dalam sistem"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
