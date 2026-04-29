import { getMemberDashboardStats } from "@/app/(actions)/dashboard";
import { getMyProposals } from "@/app/(actions)/proposals";
import { 
  PackageSearch, 
  Clock, 
  History, 
  AlertCircle,
  HandHeart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2 } from "lucide-react";

export async function MemberDashboard() {
  const [statsResponse, proposalsResponse] = await Promise.all([
    getMemberDashboardStats(),
    getMyProposals({ status: "PENDING", pageSize: 5 }), // Fetch pending requests
  ]);

  const stats = statsResponse.success ? statsResponse.data : null;
  const pendingRequests = proposalsResponse.success ? proposalsResponse.data.proposals : [];

  if (!stats) {
    return <div className="p-4 text-red-500">Gagal memuat statistik dasbor.</div>;
  }

  const statCards = [
    {
      title: "Permintaan Tertunda",
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Permintaan peminjaman yang sedang diproses admin."
    },
    {
      title: "Peminjaman Aktif",
      value: stats.activeBorrows,
      icon: PackageSearch,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Jumlah barang yang saat ini sedang Anda bawa."
    },
    {
      title: "Item Terlambat",
      value: stats.overdueItems,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: "Barang yang sudah melewati batas waktu pengembalian."
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase text-slate-900 dark:text-white">Selamat Datang!</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kelola item yang Anda pinjam dan ajukan permintaan baru.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Card className="border-border bg-card rounded-none shadow-none hover:translate-y-[-4px] hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-none ${stat.bgColor}`}>
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-[10px] font-bold uppercase">{stat.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <Card className="col-span-2 border-border bg-card rounded-none shadow-none hover:border-primary/10 transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div>
                <CardTitle className="text-lg font-bold uppercase">Permintaan Saya</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Menunggu persetujuan admin</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="rounded-none text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-muted transition-all">
                <Link href="/member/my-borrows">Lihat Riwayat</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-none border border-dashed border-border">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-none flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase">Tidak Ada Permintaan Tertunda</h3>
                  <p className="text-muted-foreground text-[10px] uppercase font-medium">Anda tidak memiliki permintaan yang menunggu persetujuan.</p>
                  <Button className="mt-4 rounded-none bg-emerald-600 hover:bg-emerald-700 h-9 px-6 uppercase text-[10px] font-bold tracking-widest transition-all hover:scale-105 active:scale-95" asChild>
                    <Link href="/member/borrow">Pinjam Item</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-none border border-border bg-card shadow-none hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-none border border-primary/20 bg-primary/5 flex items-center justify-center text-primary">
                          <PackageSearch className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight text-slate-900 dark:text-white">
                            {request.itemName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="rounded-none text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                              Jumlah: {request.quantity}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="rounded-none bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase text-[9px] font-bold">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border bg-primary text-primary-foreground rounded-none shadow-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-bold uppercase">Aksi Cepat</CardTitle>
              <CardDescription className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest mt-1">Apa yang ingin Anda lakukan?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <Button className="w-full justify-start bg-white text-primary hover:bg-white/90 rounded-none h-14 transition-all hover:translate-x-1" size="lg" asChild>
                <Link href="/member/borrow">
                  <HandHeart className="mr-3 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-bold uppercase text-xs">Pinjam Item</span>
                    <span className="text-[9px] font-medium opacity-70 uppercase">Cari atau pindai QR code</span>
                  </div>
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start bg-primary-foreground/10 hover:bg-primary-foreground/20 text-white border-transparent rounded-none h-14 transition-all hover:translate-x-1" size="lg" asChild>
                <Link href="/member/my-borrows">
                  <History className="mr-3 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-bold uppercase text-xs">Pinjaman Saya</span>
                    <span className="text-[9px] font-medium opacity-70 uppercase">Lihat aktif & riwayat</span>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
