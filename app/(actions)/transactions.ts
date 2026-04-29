"use server";

import { db as prisma } from "@/lib/db";
import { getCurrentUser, requireMember } from "@/lib/auth";
import {
  ConfirmPickupInput,
  ReturnItemInput,
  TransactionResponse,
  ActionResponse,
} from "./types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * CONFIRM PICKUP (MEMBER)
 */
export async function confirmPickup(
  input: unknown
): Promise<ActionResponse<TransactionResponse>> {
  try {
    const user = await requireMember();
    const data = ConfirmPickupInput.parse(input);

    const transaction = await prisma.transaction.findUnique({
      where: { proposalId: data.proposalId },
      include: { proposal: { include: { item: true, user: true } } },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.proposal.userId !== user.id) {
      throw new Error("Unauthorized: Not your transaction");
    }

    if (transaction.status !== "ACTIVE") {
      throw new Error("Transaction is not ready for pickup");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedTxn = await tx.transaction.update({
        where: { proposalId: data.proposalId },
        data: {
          status: "BORROWED",
          borrowedAt: new Date(),
        },
        include: { proposal: { include: { item: true, user: true } } },
      });

      await tx.borrowRequest.update({
        where: { id: data.proposalId },
        data: { 
            status: "BORROWED",
            borrowedAt: new Date(),
        },
      });

      await tx.inventoryItem.update({
        where: { id: transaction.itemId },
        data: {
          qtyBorrowed: { increment: transaction.quantity },
        },
      });

      return updatedTxn;
    });

    revalidatePath("/member/requests");
    revalidatePath("/member/dashboard");

    return {
      success: true,
      data: {
        id: updated.id,
        proposalId: updated.proposalId,
        itemId: updated.itemId,
        itemName: updated.proposal.item.name,
        userId: updated.proposal.userId,
        userName: updated.proposal.user.name,
        quantity: updated.quantity,
        type: updated.type as "LOAN" | "CONSUMPTION",
        status: updated.status as any,
        borrowedAt: updated.borrowedAt || undefined,
        returnedAt: updated.returnedAt || undefined,
        dueDate: updated.dueDate || undefined,
        createdAt: updated.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "PICKUP_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to confirm pickup",
      },
    };
  }
}

/**
 * RETURN ITEM (MEMBER)
 */
export async function returnItem(
  input: unknown
): Promise<ActionResponse<TransactionResponse>> {
  try {
    const user = await requireMember();
    const data = ReturnItemInput.parse(input);

    const transaction = await prisma.transaction.findUnique({
      where: { proposalId: data.proposalId },
      include: { proposal: { include: { item: true, user: true } } },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.proposal.userId !== user.id) {
      throw new Error("Unauthorized: Not your transaction");
    }

    if (transaction.status !== "BORROWED" && transaction.status !== "OVERDUE") {
      throw new Error("Item is not currently borrowed");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedTxn = await tx.transaction.update({
        where: { proposalId: data.proposalId },
        data: {
          status: "RETURNED",
          returnedAt: new Date(),
        },
        include: { proposal: { include: { item: true, user: true } } },
      });

      await tx.borrowRequest.update({
        where: { id: data.proposalId },
        data: { 
            status: "RETURNED",
            returnedAt: new Date(),
        },
      });

      await tx.inventoryItem.update({
        where: { id: transaction.itemId },
        data: {
          qtyAvailable: { increment: transaction.quantity },
          qtyBorrowed: { decrement: transaction.quantity },
        },
      });

      return updatedTxn;
    });

    revalidatePath("/member/requests");
    revalidatePath("/member/dashboard");

    return {
      success: true,
      data: {
        id: updated.id,
        proposalId: updated.proposalId,
        itemId: updated.itemId,
        itemName: updated.proposal.item.name,
        userId: updated.proposal.userId,
        userName: updated.proposal.user.name,
        quantity: updated.quantity,
        type: updated.type as "LOAN" | "CONSUMPTION",
        status: updated.status as any,
        borrowedAt: updated.borrowedAt || undefined,
        returnedAt: updated.returnedAt || undefined,
        dueDate: updated.dueDate || undefined,
        createdAt: updated.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "RETURN_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to return item",
      },
    };
  }
}

/**
 * GET MY TRANSACTIONS (MEMBER)
 */
export async function getMyTransactions(
  filters?: { status?: string; page?: number; pageSize?: number }
): Promise<ActionResponse<{ transactions: TransactionResponse[]; total: number }>> {
  try {
    const user = await requireMember();

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      userId: user.id,
    };
    if (filters?.status) {
      where.status = filters.status;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { proposal: { include: { item: true, user: true } } },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          proposalId: t.proposalId,
          itemId: t.itemId,
          itemName: t.proposal.item.name,
          userId: t.proposal.userId,
          userName: t.proposal.user.name,
          quantity: t.quantity,
          type: t.type as "LOAN" | "CONSUMPTION",
          status: t.status as any,
          borrowedAt: t.borrowedAt || undefined,
          returnedAt: t.returnedAt || undefined,
          dueDate: t.dueDate || undefined,
          createdAt: t.createdAt,
        })),
        total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch transactions",
      },
    };
  }
}

/**
 * GET TRANSACTIONS BY ITEM ID (ADMIN)
 */
export async function getTransactionsByItemId(
  itemId: string
): Promise<ActionResponse<TransactionResponse[]>> {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { itemId },
      include: { proposal: { include: { item: true, user: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      success: true,
      data: transactions.map((t) => ({
        id: t.id,
        proposalId: t.proposalId,
        itemId: t.itemId,
        itemName: t.proposal.item.name,
        userId: t.proposal.userId,
        userName: t.proposal.user.name,
        quantity: t.quantity,
        type: t.type as "LOAN" | "CONSUMPTION",
        status: t.status as any,
        borrowedAt: t.borrowedAt || undefined,
        returnedAt: t.returnedAt || undefined,
        dueDate: t.dueDate || undefined,
        createdAt: t.createdAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch transactions",
      },
    };
  }
}

