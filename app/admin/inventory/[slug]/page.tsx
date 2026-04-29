import { getItemById } from "@/app/(actions)/items";
import { getTransactionsByItemId } from "@/app/(actions)/transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Package,
    QrCode,
    History,
    AlertTriangle,
    Edit2,
    Info,
    Calendar,
    Box,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function ItemDetailPage({ params }: { params: { slug: string } }) {
    const { slug: itemId } = await params;

    const [itemResponse, historyResponse] = await Promise.all([
        getItemById(itemId),
        getTransactionsByItemId(itemId)
    ]);

    if (!itemResponse.success) {
        return notFound();
    }

    const item = itemResponse.data;
    const history = historyResponse.success ? historyResponse.data : [];
    const isLowStock = item.qtyAvailable <= item.lowThreshold;

    return (
        <TooltipProvider>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 h-8 text-muted-foreground hover:text-foreground transition-all">
                            <Link href="/admin/inventory">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight uppercase">{item.name}</h1>
                            <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'} className="rounded-none font-bold tracking-widest uppercase px-3">
                                {item.status === 'ACTIVE' ? 'Aktif' : item.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
                            ID: {item.id} // Kategori: {item.category}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-none border-border hover:bg-muted transition-all active:scale-95" asChild>
                                    <Link href={`/admin/inventory/edit/${item.id}`}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit Data
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-[10px] uppercase font-bold">Ubah informasi barang</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" className="rounded-none bg-primary text-primary-foreground shadow-none hover:scale-105 active:scale-95 transition-all">
                                    Cetak Label
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-[10px] uppercase font-bold">Cetak label QR untuk inventaris</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Item Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-border bg-card/50 backdrop-blur-sm rounded-none shadow-none relative overflow-hidden hover:border-primary/20 transition-all duration-500">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight uppercase">
                                    <Info className="w-5 h-5 text-primary" />
                                    Detail Informasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deskripsi</p>
                                        <p className="text-sm leading-relaxed">{item.description || "Tidak ada deskripsi untuk barang ini."}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 border border-border/50 bg-muted/20">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Satuan</span>
                                            </div>
                                            <span className="text-sm font-bold uppercase">{item.unit}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 border border-border/50 bg-muted/20 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest me-1 ">Departemen</span>
                                            </div>
                                            <span className="text-sm font-bold ms-1 uppercase">{item.departmentName}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats/Availability Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: "Total Stok", value: `${item.qtyTotal} ${item.unit}`, icon: Package, color: "bg-primary/10 text-primary" },
                                { 
                                    label: "Tersedia", 
                                    value: `${item.qtyAvailable} ${item.unit}`, 
                                    icon: CheckCircle2, 
                                    color: item.qtyAvailable <= item.lowThreshold ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500",
                                    textColor: item.qtyAvailable <= item.lowThreshold ? "text-destructive" : "text-emerald-500"
                                },
                                { label: "Dipinjam", value: `${item.qtyBorrowed} ${item.unit}`, icon: Clock, color: "bg-amber-500/10 text-amber-500", textColor: "text-amber-500" }
                            ].map((stat, i) => (
                                <Card key={i} className="rounded-none border-border bg-card shadow-none hover:translate-y-[-4px] transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 ${stat.color}`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                                <h3 className={`text-2xl font-bold ${stat.textColor || ""}`}>{stat.value}</h3>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* History / Transactions */}
                        <Card className="border-border bg-card rounded-none shadow-none hover:border-primary/10 transition-all duration-500">
                            <CardHeader className="border-b border-border/50">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold uppercase">
                                    <History className="w-5 h-5 text-primary" />
                                    Riwayat Transaksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {history.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm uppercase tracking-widest font-medium">
                                        Belum ada riwayat transaksi untuk barang ini.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {history.map((tx) => (
                                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-primary/5 border border-primary/10 flex items-center justify-center font-bold text-xs">
                                                        {tx.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold uppercase tracking-tight">{tx.userName}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                            {tx.type} • {new Date(tx.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{tx.quantity} {item.unit}</p>
                                                    <Badge variant={tx.type === 'BORROW' ? 'secondary' : 'default'} className="rounded-none text-[8px] h-4 uppercase">
                                                        {tx.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: QR Code & Status */}
                    <div className="space-y-8">
                        <Card className="border-border bg-card rounded-none shadow-none overflow-hidden group pt-0! hover:border-primary/30 transition-all duration-500">
                            <CardHeader className="bg-primary text-primary-foreground pt-0! mt-0!">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold uppercase">
                                    <QrCode className="w-5 h-5" />
                                    Label QR Barang
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 flex flex-col items-center gap-4">
                                <div className="relative p-4 border-2 border-primary/20 bg-white group-hover:border-primary group-hover:scale-105 transition-all duration-500">
                                    {item.qrCode ? (
                                        <Image
                                            src={item.qrCode}
                                            alt={`QR Code untuk ${item.name}`}
                                            width={200}
                                            height={200}
                                            className="aspect-square object-contain"
                                        />
                                    ) : (
                                        <div className="w-[200px] h-[200px] flex items-center justify-center bg-muted text-muted-foreground">
                                            QR Tidak Tersedia
                                        </div>
                                    )}
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-bold text-xs uppercase tracking-[0.2em]">{item.name}</p>
                                    <p className="font-mono text-[9px] text-muted-foreground uppercase">{item.id}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {isLowStock && (
                            <div className="p-6 bg-destructive/10 border border-destructive/20 space-y-2 relative overflow-hidden rounded-none animate-pulse">
                                <div className="absolute -top-4 -right-4 opacity-10">
                                    <AlertTriangle className="w-24 h-24 text-destructive" />
                                </div>
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h4 className="font-bold uppercase tracking-tighter">Peringatan Stok</h4>
                                </div>
                                <p className="text-xs font-medium leading-relaxed text-destructive/80">
                                    Stok barang ini telah mencapai ambang batas minimum.
                                </p>
                            </div>
                        )}

                        <Card className="border-border bg-card rounded-none shadow-none hover:border-primary/10 transition-all">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-muted-foreground uppercase font-bold">Daftar</span>
                                    <span className="font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <Separator className="bg-border/50" />
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-muted-foreground uppercase font-bold">Update</span>
                                    <span className="font-bold">{new Date(item.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
