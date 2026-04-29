"use server";

import { db } from "@/lib/db";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { CreateItemInput, UpdateItemInput, ItemResponse, ActionResponse } from "./types";
import { generateQRCode } from "@/lib/qr-generator";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * CREATE INVENTORY ITEM
 * 
 * Admin creates a new inventory item with auto-generated QR code
 */
export async function createItem(
  input: unknown
): Promise<ActionResponse<ItemResponse>> {
  try {
    const admin = await requireAdmin();
    const data = CreateItemInput.parse(input);

    const dept = await db.department.findUnique({
      where: { id: data.departmentId },
    });
    if (!dept) {
      throw new Error("Department not found");
    }

    const qrCode = await generateQRCode({
      itemName: data.name,
      departmentId: data.departmentId,
    });

    const item = await db.inventoryItem.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        qrCode,
        qtyTotal: data.qtyTotal,
        qtyAvailable: data.qtyTotal,
        qtyBorrowed: 0,
        unit: data.unit,
        lowThreshold: data.lowThreshold,
        status: "ACTIVE",
        departmentId: data.departmentId,
        createdById: admin.id,
      },
      include: { department: true },
    });

    revalidatePath("/admin/items");

    return {
      success: true,
      data: {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description || undefined,
        qrCode: item.qrCode,
        qtyTotal: item.qtyTotal,
        qtyAvailable: item.qtyAvailable,
        qtyBorrowed: item.qtyBorrowed,
        unit: item.unit,
        lowThreshold: item.lowThreshold,
        status: item.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
        departmentId: item.departmentId,
        departmentName: item.department.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "CREATE_ERROR",
        message: error instanceof Error ? error.message : "Failed to create item",
        details: error instanceof z.ZodError ? (error.issues as any) : undefined,
      },
    };
  }
}

/**
 * GET INVENTORY ITEMS
 */
export async function getItems(
  filters?: {
    departmentId?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<ActionResponse<{ items: ItemResponse[]; total: number }>> {
  try {
    const user = await getCurrentUser();

    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { category: { contains: filters.search } },
        { qrCode: { contains: filters.search } },
      ];
    }

    if (user.role === "MEMBER" && (user as any).departmentId) {
      where.departmentId = (user as any).departmentId;
    } else if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        include: { department: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      db.inventoryItem.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description || undefined,
          qrCode: item.qrCode,
          qtyTotal: item.qtyTotal,
          qtyAvailable: item.qtyAvailable,
          qtyBorrowed: item.qtyBorrowed,
          unit: item.unit,
          lowThreshold: item.lowThreshold,
          status: item.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
          departmentId: item.departmentId,
          departmentName: item.department.name,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch items",
      },
    };
  }
}

/**
 * GET ITEM BY QR CODE
 */
export async function getItemByQRCode(
  qrCode: string
): Promise<ActionResponse<ItemResponse>> {
  try {
    const user = await getCurrentUser();

    const item = await db.inventoryItem.findUnique({
      where: { qrCode },
      include: { department: true },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    if (user.role === "MEMBER" && item.departmentId !== (user as any).departmentId) {
      throw new Error("Unauthorized: Item not in your department");
    }

    return {
      success: true,
      data: {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description || undefined,
        qrCode: item.qrCode,
        qtyTotal: item.qtyTotal,
        qtyAvailable: item.qtyAvailable,
        qtyBorrowed: item.qtyBorrowed,
        unit: item.unit,
        lowThreshold: item.lowThreshold,
        status: item.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
        departmentId: item.departmentId,
        departmentName: item.department.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Item not found",
      },
    };
  }
}

/**
 * GET ITEM BY ID
 */
export async function getItemById(
  itemId: string
): Promise<ActionResponse<ItemResponse>> {
  try {
    const user = await getCurrentUser();

    const item = await db.inventoryItem.findUnique({
      where: { id: itemId },
      include: { department: true },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    if (user.role === "MEMBER" && item.departmentId !== (user as any).departmentId) {
      throw new Error("Unauthorized: Item not in your department");
    }

    return {
      success: true,
      data: {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description || undefined,
        qrCode: item.qrCode,
        qtyTotal: item.qtyTotal,
        qtyAvailable: item.qtyAvailable,
        qtyBorrowed: item.qtyBorrowed,
        unit: item.unit,
        lowThreshold: item.lowThreshold,
        status: item.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
        departmentId: item.departmentId,
        departmentName: item.department.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Item not found",
      },
    };
  }
}

export async function updateItem(
  input: unknown
): Promise<ActionResponse<ItemResponse>> {
  try {
    await requireAdmin();
    const data = UpdateItemInput.parse(input);

    const currentItem = await db.inventoryItem.findUnique({
      where: { id: data.id },
      include: { department: true },
    });

    if (!currentItem) {
      throw new Error("Item not found");
    }

    const updated = await db.inventoryItem.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.lowThreshold !== undefined && { lowThreshold: data.lowThreshold }),
        ...(data.status && { status: data.status as any }),
      },
      include: { department: true },
    });

    revalidatePath("/admin/items");

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        description: updated.description || undefined,
        qrCode: updated.qrCode,
        qtyTotal: updated.qtyTotal,
        qtyAvailable: updated.qtyAvailable,
        qtyBorrowed: updated.qtyBorrowed,
        unit: updated.unit,
        lowThreshold: updated.lowThreshold,
        status: updated.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
        departmentId: updated.departmentId,
        departmentName: updated.department.name,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "UPDATE_ERROR",
        message: error instanceof Error ? error.message : "Failed to update item",
      },
    };
  }
}

/**
 * DELETE ITEM
 */
export async function deleteItem(itemId: string): Promise<ActionResponse<null>> {
  try {
    await requireAdmin();

    const activeProposals = await db.borrowRequest.count({
      where: {
        itemId,
        status: { in: ["APPROVED", "PENDING", "BORROWED"] },
      },
    });

    if (activeProposals > 0) {
      throw new Error("Cannot delete item with active proposals or transactions");
    }

    await db.inventoryItem.update({
      where: { id: itemId },
      data: { status: "ARCHIVED" },
    });

    revalidatePath("/admin/items");

    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "DELETE_ERROR",
        message: error instanceof Error ? error.message : "Failed to delete item",
      },
    };
  }
}
