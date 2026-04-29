import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database, User, ArrowRight } from "lucide-react";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Premium Background Patterns */}
            <div className="absolute inset-0 bg-mesh-gradient opacity-30 -z-10" />
            <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-10 -z-10" />

            <div className="w-full max-w-4xl space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-6">
                    <div className="inline-block px-3 py-1 mb-2 border border-primary/20 bg-primary/5 rounded-none text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                        Sistem Inventaris Online
                    </div>
                    <h1 className="text-8xl font-bold tracking-tighter uppercase leading-[0.8] text-foreground">
                        Anti<span className="text-primary">gravity</span>
                    </h1>
                    <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium max-w-md mx-auto">
                        Solusi manajemen aset modern dengan efisiensi tinggi dan pelacakan real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <Link href="/login" className="group">
                        <div className="p-8 bg-card/50 backdrop-blur-md border border-border rounded-none hover:border-primary/50 hover:bg-card transition-all duration-500 space-y-6 text-left relative overflow-hidden group-hover:translate-y-[-4px]">
                            <div className="h-12 w-12 rounded-none border border-primary/20 bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <Database className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight uppercase">Portal Admin</h3>
                                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed uppercase tracking-wider">
                                    Kelola infrastruktur pusat, manajemen aset, dan persetujuan peminjaman.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-2 text-primary">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Masuk Admin</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/login" className="group">
                        <div className="p-8 bg-card/50 backdrop-blur-md border border-border rounded-none hover:border-primary/50 hover:bg-card transition-all duration-500 space-y-6 text-left relative overflow-hidden group-hover:translate-y-[-4px]">
                            <div className="h-12 w-12 rounded-none border border-primary/20 bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight uppercase">Portal Anggota</h3>
                                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed uppercase tracking-wider">
                                    Ajukan peminjaman aset, cek manifest pribadi, dan riwayat penggunaan.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-2 text-primary">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Masuk Portal</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="pt-12 font-mono text-[9px] text-muted-foreground/30 uppercase tracking-[0.5em]">
                    Versi 1.0.4 // RPL-Inventory-KIPI
                </div>
            </div>
        </div>
    );
}
