"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { employeeService } from "@/lib/services/employee.service";
import { EmployeeFormValues } from "@/lib/validations/employee.schema";

export default function AddEmployeePage() {
  const router = useRouter();

  async function handleSubmit(data: EmployeeFormValues) {
    await employeeService.create({
      ...data,
      workStatus: "active",
    });

    toast.success("Thêm nhân viên thành công");
    router.push("/list");
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/list" className="inline-flex items-center gap-2 group">
          <ArrowLeft className="w-5 h-5 text-gray-500 transition-colors group-hover:text-blue-600" />

          <h1 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
            Thêm mới nhân viên
          </h1>
        </Link>
      </div>

      <EmployeeForm
        formType="add"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/list")}
      />
    </div>
  );
}
