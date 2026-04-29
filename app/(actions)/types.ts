import { User } from "@/generated/prisma/browser";
import { z } from "zod";

// ============================================
// ITEM TYPES
// ============================================

export const CreateItemInput = z.object({
  name: z.string().min(1, "Name required").max(255),
  category: z.string().min(1, "Category required"),
  description: z.string().optional(),
  qtyTotal: z.number().int().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit required"), // "pcs", "box", "unit"
  departmentId: z.string().min(1, "Department required"),
  lowThreshold: z.number().int().nonnegative().default(5),
});
export type CreateItemInput = z.infer<typeof CreateItemInput>;

export const UpdateItemInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  qtyTotal: z.number().int().positive().optional(),
  lowThreshold: z.number().int().nonnegative().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});
export type UpdateItemInput = z.infer<typeof UpdateItemInput>;

export interface ItemResponse {
  id: string;
  name: string;
  category: string;
  description?: string;
  qrCode: string;
  qtyTotal: number;
  qtyAvailable: number;
  qtyBorrowed: number;
  unit: string;
  lowThreshold: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  departmentId: string;
  departmentName: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PROPOSAL/REQUEST TYPES
// ============================================

export const CreateProposalInput = z.object({
  itemId: z.string().min(1, "Item required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  type: z.enum(["LOAN", "CONSUMPTION"], {
    error: "Type must be LOAN or CONSUMPTION",
  }),
  purpose: z.string().optional(),
});
export type CreateProposalInput = z.infer<typeof CreateProposalInput>;

export interface ProposalResponse {
  id: string;
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  quantity: number;
  type: "LOAN" | "CONSUMPTION";
  purpose?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  rejectionReason?: string;
}

// ============================================
// APPROVAL TYPES
// ============================================

export const ApproveProposalInput = z.object({
  proposalId: z.string(),
  dueDate: z.date().optional(), // For loans only
});
export type ApproveProposalInput = z.infer<typeof ApproveProposalInput>;

export const RejectProposalInput = z.object({
  proposalId: z.string(),
  reason: z.string().min(1, "Reason required").max(500),
});
export type RejectProposalInput = z.infer<typeof RejectProposalInput>;

// ============================================
// TRANSACTION TYPES
// ============================================

export interface TransactionResponse {
  id: string;
  proposalId: string;
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  quantity: number;
  type: "LOAN" | "CONSUMPTION";
  status: "ACTIVE" | "BORROWED" | "RETURNED" | "DONE" | "OVERDUE";
  borrowedAt?: Date;
  returnedAt?: Date;
  dueDate?: Date;
  createdAt: Date;
}

export const ConfirmPickupInput = z.object({
  proposalId: z.string(),
});
export type ConfirmPickupInput = z.infer<typeof ConfirmPickupInput>;

export const ReturnItemInput = z.object({
  proposalId: z.string(),
  condition: z.enum(["GOOD", "DAMAGED", "LOST"]).optional(),
});
export type ReturnItemInput = z.infer<typeof ReturnItemInput>;

// ============================================
// RESPONSE TYPES
// ============================================

export interface ActionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ActionResponse<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ActionError };

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}


// ============================================
// DEPARTMENTS TYPES
// ============================================
export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  InventoryItems: ItemResponse[];
  user: User[];
}