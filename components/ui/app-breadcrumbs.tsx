"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

const routeMap: Record<string, string> = {
  admin: "Admin",
  inventory: "Inventaris",
  items: "Barang",
  create: "Tambah",
  edit: "Edit",
  approvals: "Persetujuan",
  members: "Anggota",
  settings: "Pengaturan",
  member: "Member",
  borrow: "Pinjam",
  "my-borrows": "Pinjaman Saya",
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <Breadcrumb className="animate-in fade-in slide-in-from-left-2 duration-500">
      <BreadcrumbList className="gap-1 sm:gap-2">
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const label = routeMap[path] || path;

          // Detect UUID or slug and simplify
          const isId = /^[0-9a-fA-F-]{8,}$/.test(path);
          const displayLabel = isId ? "Detail" : label;

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-bold uppercase tracking-widest text-[10px] text-primary">
                    {displayLabel}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={href}
                      className="font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-colors"
                    >
                      {displayLabel}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="text-muted-foreground/30">
                  <span className="text-[10px]">//</span>
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
