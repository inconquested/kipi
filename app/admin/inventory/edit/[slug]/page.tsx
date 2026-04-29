import { ItemForm } from "@/components/admin/ItemForm";
import { getDepartments } from "@/app/(actions)/departments";
import { DepartmentResponse } from "@/app/(actions)/types";
import { getItemById } from "@/app/(actions)/items";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: { slug: string } }) {
    const { slug: itemId } = await params;

    const [itemResponse, deptResponse] = await Promise.all([
        getItemById(itemId),
        getDepartments()
    ]);

    if (!itemResponse.success) {
        return notFound();
    }

    const departments: Partial<DepartmentResponse>[] = deptResponse.success ? deptResponse.data.departments : [];

    return (
        <div className="flex items-center justify-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ItemForm item={itemResponse.data} departments={departments} />
        </div>
    );
}
