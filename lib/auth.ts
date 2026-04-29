import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "sqlite",
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                input: false,
                defaultValue: "MEMBER"
            }
        }
    },
    plugins: [
        nextCookies()
    ],
    trustedOrigins: ["http://localhost:3000"]
});

export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session) {
        throw new Error("Unauthorized");
    }
    
    return session.user;
}

export async function requireAdmin() {
    const user = await getCurrentUser();
    
    if (user.role !== "ADMIN") {
        throw new Error("Forbidden: Admin access required");
    }
    
    return user;
}

export async function requireMember() {
    const user = await getCurrentUser();
    
    if (user.role !== "MEMBER") {
        throw new Error("Forbidden: Member access required");
    }
    
    return user;
}