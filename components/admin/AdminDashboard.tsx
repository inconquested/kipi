import { getAdminDashboardStats } from "@/app/(actions)/dashboard";
import { getPendingProposals } from "@/app/(actions)/proposals";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";

export async function AdminDashboard() {
  const [statsResponse, proposalsResponse] = await Promise.all([
    getAdminDashboardStats(),
    getPendingProposals({ pageSize: 5 }), // Fetch top 5 pending for recent activity
  ]);

  const stats = statsResponse.success ? statsResponse.data : null;
  const recentActivity = proposalsResponse.success ? proposalsResponse.data.proposals : [];

  const statCards = [
    {
      title: "Total Item",
      value: stats?.totalItems || 0,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Total seluruh aset yang terdaftar dalam sistem."
    },
    {
      title: "Persetujuan",
      value: stats?.pendingProposals || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Permintaan peminjaman yang menunggu konfirmasi admin."
    },
    {
      title: "Pinjaman Aktif",
      value: stats?.activeBorrows || 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Barang yang sedang dipinjam oleh anggota."
    },
    {
      title: "Terlambat",
      value: stats?.overdueItems || 0,
      icon: AlertOctagon,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      description: "Barang yang melewati batas waktu pengembalian."
    },
    {
      title: "Stok Rendah",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Item dengan stok di bawah ambang batas peringatan."
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase text-slate-900 dark:text-white">Panel Admin</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ringkasan inventaris dan permintaan peminjaman terbaru.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Card className="border-border bg-card rounded-none shadow-none hover:translate-y-[-4px] hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-none ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                        <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
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
          {/* Recent Activity */}
          <Card className="col-span-2 border-border bg-card rounded-none shadow-none hover:border-primary/10 transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 mb-6">
              <CardTitle className="text-lg font-bold uppercase">Proposal Terbaru</CardTitle>
              <Button variant="outline" size="sm" asChild className="rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">
                <Link href="/admin/approvals">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-bold uppercase tracking-widest">
                  Tidak ada proposal tertunda saat ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-none border border-border bg-muted/20 hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-none border border-primary/20 bg-primary/5 flex items-center justify-center text-primary font-bold">
                          {activity.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight text-slate-900 dark:text-white">
                            {activity.userName} <span className="text-muted-foreground font-medium lowercase">meminta</span> {activity.quantity}x {activity.itemName}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                            {new Date(activity.createdAt).toLocaleDateString()} • {activity.type}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="rounded-none bg-amber-100 text-amber-700 hover:bg-amber-100 uppercase text-[9px] font-bold">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border bg-card rounded-none shadow-none hover:border-primary/10 transition-all duration-500">
            <CardHeader className="border-b border-border/50 mb-6">
              <CardTitle className="text-lg font-bold uppercase">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start rounded-none h-12 uppercase text-[10px] font-bold tracking-widest hover:scale-105 active:scale-95 transition-all shadow-none" size="lg" asChild>
                <Link href="/admin/items/create">
                  <Package className="mr-2 h-5 w-5" />
                  Tambah Item Baru
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-none h-12 uppercase text-[10px] font-bold tracking-widest border-border hover:bg-muted transition-all active:scale-95" size="lg" asChild>
                <Link href="/admin/approvals">
                  <Clock className="mr-2 h-5 w-5" />
                  Tinjau Persetujuan
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
