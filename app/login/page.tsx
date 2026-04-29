"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Globe, Code, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
                callbackURL: "/",
            });

            if (error) {
                toast.error(error.message || "Login gagal. Silakan periksa kembali email dan password Anda.");
            } else {
                toast.success("Berhasil masuk!");
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: "google" | "github") => {
        setIsSocialLoading(provider);
        try {
            await authClient.signIn.social({
                provider,
                callbackURL: "/",
            });
        } catch (err) {
            toast.error(`Gagal masuk dengan ${provider}`);
            setIsSocialLoading(null);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Premium Background Patterns */}
            <div className="absolute inset-0 bg-mesh-gradient opacity-30 -z-10" />
            <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-10 -z-10" />

            <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-md rounded-none shadow-none relative overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                <CardHeader className="space-y-2 pt-8 text-center border-b border-border">
                    <div className="mx-auto w-12 h-12 border border-primary flex items-center justify-center mb-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tighter uppercase">Selamat Datang</CardTitle>
                        <CardDescription className="font-medium tracking-wide uppercase text-[10px] text-muted-foreground">
                            Silakan masuk untuk melanjutkan
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Alamat Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 h-10 bg-transparent border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all duration-300 uppercase text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-0.5">
                                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kata Sandi</Label>
                                <Link href="/auth/forgot-password" className="text-[9px] font-bold text-primary hover:bg-primary/10 px-1 uppercase transition-colors">Lupa?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10 h-10 bg-transparent border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all duration-300"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-10 rounded-none font-bold uppercase tracking-[0.2em] text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-none" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                            Masuk Ke Sistem
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-[9px] uppercase">
                            <span className="bg-card px-2 text-muted-foreground font-bold tracking-[0.3em]">Atau Lanjutkan Dengan</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant="outline" 
                            className="h-10 rounded-none border-border bg-transparent hover:bg-muted font-bold text-[9px] uppercase tracking-widest transition-none shadow-none"
                            onClick={() => handleSocialLogin("google")}
                            disabled={!!isSocialLoading}
                        >
                            {isSocialLoading === "google" ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Globe className="mr-2 h-3 w-3" />}
                            Google
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-10 rounded-none border-border bg-transparent hover:bg-muted font-bold text-[9px] uppercase tracking-widest transition-none shadow-none"
                            onClick={() => handleSocialLogin("github")}
                            disabled={!!isSocialLoading}
                        >
                            {isSocialLoading === "github" ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Code className="mr-2 h-3 w-3" />}
                            GitHub
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center border-t border-border py-6 space-y-4">
                    <p className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                        Belum terdaftar?{" "}
                        <Link href="/register" className="text-primary font-bold hover:underline">
                            Daftar Sekarang
                        </Link>
                    </p>
                    <p className="font-mono text-[7px] text-muted-foreground/40 uppercase tracking-[0.5em]">
                        PROTOKOL AKSES AMAN // v1.0.4
                    </p>
                </CardFooter>

            </Card>
        </div>
    );
}
