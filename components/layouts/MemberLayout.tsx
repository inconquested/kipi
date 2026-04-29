"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { 
  LayoutDashboard, 
  HandHeart, 
  History, 
  LogOut,
  UserCircle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/ui/app-breadcrumbs";

const navItems = [
  { name: "Dashboard", href: "/member", icon: LayoutDashboard },
  { name: "Pinjam Item", href: "/member/borrow", icon: HandHeart },
  { name: "Pinjaman Saya", href: "/member/my-borrows", icon: History },
];

export function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-none bg-primary text-primary-foreground">
              <span className="font-bold">K</span>
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold text-base tracking-tight">Kipi Member</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/member" && pathname?.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Profil Saya">
                    <Link href="/member/profile">
                      <UserCircle />
                      <span>Profil Saya</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Keluar"
                    onClick={async () => {
                      await authClient.signOut();
                      router.push("/login");
                      router.refresh();
                    }}
                  >
                    <LogOut className="text-red-500" />
                    <span className="text-red-500">Keluar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>

      </Sidebar>
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-md px-6 lg:h-[60px] shrink-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 hover:bg-muted transition-all" />
            <Separator orientation="vertical" className="h-4" />
            <AppBreadcrumbs />
          </div>
        </header>
        <main className="flex-1 overflow-auto relative">
          {/* Main Background Pattern */}
          <div className="absolute inset-0 bg-mesh-gradient -z-10 opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-dot-pattern -z-10 opacity-20 pointer-events-none" />

          <div className="p-8 max-w-7xl mx-auto w-full relative">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
