"use server";

import { db as prisma } from "@/lib/db";
import { getCurrentUser, requireMember, requireAdmin } from "@/lib/auth";
import {
  CreateProposalInput,
  ApproveProposalInput,
  RejectProposalInput,
  ProposalResponse,
  ActionResponse,
} from "./types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * CREATE PROPOSAL (MEMBER)
 */
export async function createProposal(
  input: unknown
): Promise<ActionResponse<ProposalResponse>> {
  try {
    const user = await requireMember();
    const data = CreateProposalInput.parse(input);

    const item = await prisma.inventoryItem.findUnique({
      where: { id: data.itemId },
      include: { department: true },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    if (item.departmentId !== (user as any).departmentId) {
      throw new Error("Item not available in your department");
    }

    if (item.status !== "ACTIVE") {
      throw new Error("Item is not available for borrowing");
    }

    if (data.quantity > item.qtyAvailable) {
      throw new Error(
        `Only ${item.qtyAvailable} ${item.unit} available (requested ${data.quantity})`
      );
    }

    const proposal = await prisma.borrowRequest.create({
      data: {
        itemId: data.itemId,
        userId: user.id,
        quantity: data.quantity,
        type: data.type as any,
        purpose: data.purpose,
        status: "PENDING",
      },
      include: { item: true, user: true },
    });

    revalidatePath("/member/requests");
    revalidatePath("/admin/queue");

    return {
      success: true,
      data: {
        id: proposal.id,
        itemId: proposal.itemId,
        itemName: proposal.item.name,
        userId: proposal.userId,
        userName: proposal.user.name,
        quantity: proposal.quantity,
        type: proposal.type as "LOAN" | "CONSUMPTION",
        purpose: proposal.purpose || undefined,
        status: "PENDING",
        createdAt: proposal.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "CREATE_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to create proposal",
        details: error instanceof z.ZodError ? (error.issues as any) : undefined,
      },
    };
  }
}

/**
 * GET PENDING PROPOSALS (ADMIN)
 */
export async function getPendingProposals(filters?: {
  departmentId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResponse<{ proposals: ProposalResponse[]; total: number }>> {
  try {
    await requireAdmin();

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { status: "PENDING" };
    if (filters?.departmentId) {
      where.item = { departmentId: filters.departmentId };
    }

    const [proposals, total] = await Promise.all([
      prisma.borrowRequest.findMany({
        where,
        include: { item: true, user: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: "asc" },
      }),
      prisma.borrowRequest.count({ where }),
    ]);

    return {
      success: true,
      data: {
        proposals: proposals.map((p) => ({
          id: p.id,
          itemId: p.itemId,
          itemName: p.item.name,
          userId: p.userId,
          userName: p.user.name,
          quantity: p.quantity,
          type: p.type as "LOAN" | "CONSUMPTION",
          purpose: p.purpose || undefined,
          status: "PENDING",
          createdAt: p.createdAt,
        })),
        total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch proposals",
      },
    };
  }
}

/**
 * APPROVE PROPOSAL (ADMIN)
 */
export async function approveProposal(
  input: unknown
): Promise<ActionResponse<ProposalResponse>> {
  try {
    const admin = await requireAdmin();
    const data = ApproveProposalInput.parse(input);

    const proposal = await prisma.borrowRequest.findUnique({
      where: { id: data.proposalId },
      include: { item: true, user: true },
    });

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    if (proposal.status !== "PENDING") {
      throw new Error("Proposal is not pending");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProposal = await tx.borrowRequest.update({
        where: { id: data.proposalId },
        data: { 
            status: "APPROVED",
            approvedById: admin.id,
            approvedAt: new Date()
        },
        include: { item: true, user: true },
      });

      if (updatedProposal.type === "LOAN") {
        await tx.transaction.create({
          data: {
            proposalId: data.proposalId,
            itemId: proposal.itemId,
            userId: proposal.userId,
            type: "LOAN",
            quantity: proposal.quantity,
            status: "ACTIVE",
            dueDate: data.dueDate,
          },
        });
        
        // For LOAN, available qty is reduced when picked up, 
        // but often we want to reserve it now. 
        // According to the diagram, we reduce qty_available here.
        await tx.inventoryItem.update({
            where: { id: proposal.itemId },
            data: {
              qtyAvailable: { decrement: proposal.quantity },
            },
          });
      } else {
        await tx.transaction.create({
          data: {
            proposalId: data.proposalId,
            itemId: proposal.itemId,
            userId: proposal.userId,
            type: "CONSUMPTION",
            quantity: proposal.quantity,
            status: "DONE",
            borrowedAt: new Date(),
          },
        });

        await tx.inventoryItem.update({
          where: { id: proposal.itemId },
          data: {
            qtyTotal: { decrement: proposal.quantity },
            qtyAvailable: { decrement: proposal.quantity },
          },
        });
      }

      return updatedProposal;
    });

    revalidatePath("/admin/queue");
    revalidatePath("/member/requests");

    return {
      success: true,
      data: {
        id: updated.id,
        itemId: updated.itemId,
        itemName: updated.item.name,
        userId: updated.userId,
        userName: updated.user.name,
        quantity: updated.quantity,
        type: updated.type as "LOAN" | "CONSUMPTION",
        purpose: updated.purpose || undefined,
        status: "APPROVED",
        createdAt: updated.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "APPROVE_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to approve proposal",
      },
    };
  }
}

/**
 * REJECT PROPOSAL (ADMIN)
 */
export async function rejectProposal(
  input: unknown
): Promise<ActionResponse<ProposalResponse>> {
  try {
    await requireAdmin();
    const data = RejectProposalInput.parse(input);

    const proposal = await prisma.borrowRequest.findUnique({
      where: { id: data.proposalId },
      include: { item: true, user: true },
    });

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    if (proposal.status !== "PENDING") {
      throw new Error("Proposal is not pending");
    }

    const updated = await prisma.borrowRequest.update({
      where: { id: data.proposalId },
      data: {
        status: "REJECTED",
        rejectionReason: data.reason,
      },
      include: { item: true, user: true },
    });

    revalidatePath("/admin/queue");
    revalidatePath("/member/requests");

    return {
      success: true,
      data: {
        id: updated.id,
        itemId: updated.itemId,
        itemName: updated.item.name,
        userId: updated.userId,
        userName: updated.user.name,
        quantity: updated.quantity,
        type: updated.type as "LOAN" | "CONSUMPTION",
        purpose: updated.purpose || undefined,
        status: "REJECTED",
        createdAt: updated.createdAt,
        rejectionReason: updated.rejectionReason || undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "REJECT_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to reject proposal",
      },
    };
  }
}

/**
 * GET MY PROPOSALS (MEMBER)
 */
export async function getMyProposals(
  filters?: { status?: string; page?: number; pageSize?: number }
): Promise<ActionResponse<{ proposals: ProposalResponse[]; total: number }>> {
  try {
    const user = await requireMember();

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { userId: user.id };
    if (filters?.status) {
      where.status = filters.status;
    }

    const [proposals, total] = await Promise.all([
      prisma.borrowRequest.findMany({
        where,
        include: { item: true, user: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.borrowRequest.count({ where }),
    ]);

    return {
      success: true,
      data: {
        proposals: proposals.map((p) => ({
          id: p.id,
          itemId: p.itemId,
          itemName: p.item.name,
          userId: p.userId,
          userName: p.user.name,
          quantity: p.quantity,
          type: p.type as "LOAN" | "CONSUMPTION",
          purpose: p.purpose || undefined,
          status: p.status as any,
          createdAt: p.createdAt,
          rejectionReason: p.rejectionReason || undefined,
        })),
        total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch proposals",
      },
    };
  }
}
