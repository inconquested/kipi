"use server";

import { db as prisma } from "@/lib/db";
import { requireAdmin, requireMember } from "@/lib/auth";
import { ActionResponse } from "./types";

export async function getAdminDashboardStats(): Promise<ActionResponse<{
  totalItems: number;
  pendingProposals: number;
  activeBorrows: number;
  overdueItems: number;
  lowStockItems: number;
}>> {
  try {
    await requireAdmin();

    const [totalItems, pendingProposals, activeBorrows, overdueItems] =
      await Promise.all([
        prisma.inventoryItem.count({ where: { status: "ACTIVE" } }),
        prisma.borrowRequest.count({ where: { status: "PENDING" } }),
        prisma.transaction.count({ where: { status: "BORROWED" } }),
        prisma.transaction.count({ where: { status: "OVERDUE" } }),
      ]);

    const items = await prisma.inventoryItem.findMany({
        where: { status: "ACTIVE" }
    });
    const lowStockItems = items.filter(item => item.qtyAvailable <= item.lowThreshold).length;

    const data = {
        totalItems,
        pendingProposals,
        activeBorrows,
        overdueItems,
        lowStockItems,
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch stats",
      },
    };
  }
}

export async function getMemberDashboardStats(): Promise<ActionResponse<{
  pendingRequests: number;
  activeBorrows: number;
  overdueItems: number;
}>> {
  try {
    const user = await requireMember();

    const [pendingRequests, activeBorrows, overdueItems] = await Promise.all([
      prisma.borrowRequest.count({
        where: { userId: user.id, status: "PENDING" },
      }),
      prisma.transaction.count({
        where: { userId: user.id, status: "BORROWED" },
      }),
      prisma.transaction.count({
        where: { userId: user.id, status: "OVERDUE" },
      }),
    ]);

    return {
      success: true,
      data: {
        pendingRequests,
        activeBorrows,
        overdueItems,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch stats",
      },
    };
  }
}
