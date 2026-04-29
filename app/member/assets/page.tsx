import { MyBorrows } from "@/components/member/MyBorrows";

export default function Page() {
  return (
    <div className="p-6 lg:p-10 space-y-8">
        <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Aset Saya</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
                Manifest Alokasi dan Riwayat Penggunaan
            </p>
        </div>
        <MyBorrows />
    </div>
  );
}
