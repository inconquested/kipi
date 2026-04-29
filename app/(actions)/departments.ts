"use server";

import { db } from "@/lib/db";
import { Department } from "@/generated/prisma/client";
import { ActionResponse } from "./types";

export async function getDepartments(
    filters?: {
        departmentId?: string;
    }
): Promise<ActionResponse<{
    departments: Department[];
    total: number;
}>> {
    try {
        const [departments, total] = await Promise.all([
            filters?.departmentId ? db.department.findUnique({
                where: { id: filters.departmentId },
            }) : db.department.findMany(),
            db.department.count({
                where: {
                    id: filters?.departmentId
                }
            })
        ]);

        if (departments instanceof Error) {
            throw departments;
        }

        return {
            success: true,
            data: {
                departments: (departments as Department[]).map((department) => ({
                    ...department,

                })),
                total: total
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: { message: error.message, code: "FETCH_ERROR" } };
        }
        return { success: false, error: { message: "Failed to fetch departments", code: "FETCH_ERROR" } };
    }
}