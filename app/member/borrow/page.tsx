import { BorrowForm } from "@/components/member/BorrowForm";

export default function Page() {
  return (
    <div className="p-6 lg:p-10 space-y-8">
        <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Ajukan Peminjaman</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
                Inisialisasi Protokol Permintaan Aset
            </p>
        </div>
        <BorrowForm />
    </div>
  );
}
