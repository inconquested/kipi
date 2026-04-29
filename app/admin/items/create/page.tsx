import { ItemForm } from "@/components/admin/ItemForm";
import { getDepartments } from "@/app/(actions)/departments";
import { DepartmentResponse } from "@/app/(actions)/types";

export default async function CreatePage() {
    const response = await getDepartments();
    const departments: Partial<DepartmentResponse>[] = response.success ? response.data.departments : [];

    return (
        <div className="flex items-center justify-center">
            <ItemForm departments={departments} />
        </div>
    );
}