// app/actions/auth-actions.ts
"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            // Note: In most cases, nextCookies handles headers for mutations,
            // but passing them ensures consistency.
            headers: await headers()
        });
    } catch (error) {
        return { error: "Invalid credentials" };
    }

    redirect("/dashboard");
}