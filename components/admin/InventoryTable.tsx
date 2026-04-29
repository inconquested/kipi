"use client";

import { useState, useEffect } from "react";
import { getItems } from "@/app/(actions)/items";
import { ItemResponse } from "@/app/(actions)/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit2, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function InventoryTable() {
  const router = useRouter();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    pageSize: 10,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setFilters(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await getItems({
          search: debouncedSearch,
          status: filters.status === "ALL" ? undefined : filters.status || undefined,
          page: filters.page,
          pageSize: filters.pageSize,
        });

        if (response.success) {
          setItems(response.data.items);
          setTotal(response.data.total);
        }
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [debouncedSearch, filters.status, filters.page, filters.pageSize]);

  const totalPages = Math.ceil(total / filters.pageSize);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative w-full sm:max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Cari nama barang, kategori, atau ID..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 rounded-none border-border focus-visible:ring-0 focus-visible:border-primary transition-all duration-300 uppercase text-[10px] font-bold tracking-widest h-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filters.status || "ALL"}
              onValueChange={(val) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
            >
              <SelectTrigger className="rounded-none border-border focus:ring-0 focus:border-primary h-10 uppercase text-[10px] font-bold tracking-widest">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border">
                <SelectItem value="ALL" className="uppercase text-[10px] font-bold">Semua Status</SelectItem>
                <SelectItem value="ACTIVE" className="uppercase text-[10px] font-bold">Aktif</SelectItem>
                <SelectItem value="INACTIVE" className="uppercase text-[10px] font-bold">Tidak Aktif</SelectItem>
                <SelectItem value="ARCHIVED" className="uppercase text-[10px] font-bold text-destructive">Diarsipkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-none border border-border bg-card overflow-hidden shadow-none animate-in fade-in duration-700">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Barang</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Kategori</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Stok</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Tersedia</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Dipinjam</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center border-none">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Menyinkronkan Data...</p>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground border-none">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Tidak ada item yang ditemukan.</p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const isLowStock = item.qtyAvailable <= item.lowThreshold;

                  return (
                    <TableRow key={item.id} className="group hover:bg-muted/50 border-border/50 transition-colors">
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted border border-border flex items-center justify-center text-[10px] group-hover:bg-primary/5 group-hover:border-primary/20 transition-all font-bold">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-tight font-bold">{item.name}</p>
                            <p className="text-[8px] font-mono text-muted-foreground uppercase">{item.id}</p>
                          </div>
                          {isLowStock && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-[10px] font-bold uppercase">Peringatan: Stok Rendah</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold uppercase text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="text-right text-xs font-bold">{item.qtyTotal}</TableCell>
                      <TableCell className={`text-right text-xs font-bold ${isLowStock ? 'text-destructive' : 'text-emerald-600'}`}>
                        {item.qtyAvailable}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-bold">{item.qtyBorrowed}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-none text-[8px] font-bold uppercase tracking-widest border-border ${
                          item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                          item.status === 'INACTIVE' ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {item.status === 'ACTIVE' ? 'Aktif' : item.status === 'INACTIVE' ? 'Tidak Aktif' : 'Arsip'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/inventory/${item.id}`)} className="h-8 w-8 rounded-none hover:bg-primary/10 hover:text-primary transition-all">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px] font-bold uppercase">Lihat Detail & Edit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Menampilkan {((filters.page - 1) * filters.pageSize) + 1} sampai {Math.min(filters.page * filters.pageSize, total)} dari {total} data
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-border uppercase text-[10px] font-bold tracking-widest h-9 px-4 transition-all hover:bg-muted active:scale-95"
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-border uppercase text-[10px] font-bold tracking-widest h-9 px-4 transition-all hover:bg-muted active:scale-95"
                disabled={filters.page === totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
