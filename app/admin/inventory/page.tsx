import { InventoryTable } from "@/components/admin/InventoryTable";

export default function Page() {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight uppercase">Daftar Barang</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
          Manajemen dan Pelacakan Aset Inventaris
        </p>
      </div>
      <InventoryTable />
    </div>
  );
}
