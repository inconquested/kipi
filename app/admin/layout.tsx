import { AdminLayout } from "@/components/layouts/AdminLayout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    return redirect("/member");
  }

  return <AdminLayout>{children}</AdminLayout>;
}

