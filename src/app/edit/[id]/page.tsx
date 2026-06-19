"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { employeeService } from "@/lib/services/employee.service";
import { Employee } from "@/types/employee";
import { EmployeeFormValues } from "@/lib/validations/employee.schema";
import { EmployeeForm } from "@/components/employee/EmployeeForm";

export default function EditEmployeePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    employeeService
      .getById(id)
      .then(setEmployee)
      .catch(() => setError("Không tìm thấy nhân viên"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: EmployeeFormValues) {
    await employeeService.update(id, data);
    toast.success("Cập nhật thành công");
    router.push("/list");
  }

  async function handleDelete() {
    await employeeService.remove(id);
    toast.success("Đã xóa nhân viên");
    router.push("/list");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg
          className="w-8 h-8 animate-spin text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500">{error || "Không tìm thấy nhân viên"}</p>
        <button
          onClick={() => router.push("/list")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Breadcrumb: chỉ mũi tên + tên người, bấm để quay lại danh sách */}
      <button
        onClick={() => router.push("/list")}
        className="flex items-center gap-2 mb-6 text-gray-800 hover:text-blue-600 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-lg font-semibold">
          {employee.lastName} {employee.firstName}
        </span>
      </button>

      <EmployeeForm
        formType="edit"
        initialData={employee}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onCancel={() => router.push("/list")}
      />
    </div>
  );
}
