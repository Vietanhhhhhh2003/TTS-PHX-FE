"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  employeeSchema,
  EmployeeFormValues,
} from "@/lib/validations/employee.schema";
import { Employee } from "@/types/employee";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { FileUpload } from "@/components/ui/FileUpload";
import { Modal } from "@/components/ui/Modal";
import {
  DEPARTMENTS,
  ROLES,
  LEVELS,
  GENDER_OPTIONS,
  WORK_STATUS_OPTIONS,
} from "@/lib/utils/constants";

interface EmployeeFormProps {
  formType: "add" | "edit";
  initialData?: Employee;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export function EmployeeForm({
  formType,
  initialData,
  onSubmit,
  onDelete,
  onCancel,
}: EmployeeFormProps) {
  const [attachments, setAttachments] = useState<
    { name: string; url: string }[]
  >(initialData?.attachments ?? []);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    initialData?.avatarUrl,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData
      ? {
          lastName: initialData.lastName,
          firstName: initialData.firstName,
          employeeCode: initialData.employeeCode,
          email: initialData.email,
          phone: initialData.phone,
          department: initialData.department,
          dateOfBirth: initialData.dateOfBirth ?? "",
          gender: initialData.gender,
          startWorkDate: initialData.startWorkDate ?? "",
          level: initialData.level ?? "",
          address: initialData.address ?? "",
          role: initialData.role ?? "",
          workStatus: initialData.workStatus,
          avatarUrl: initialData.avatarUrl ?? "",
        }
      : { workStatus: "active" },
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleDelete() {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  }

  async function internalSubmit(data: EmployeeFormValues) {
    await onSubmit({ ...data, avatarUrl: avatarPreview });
  }

  return (
    <>
      <form onSubmit={handleSubmit(internalSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-2">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7">
            {/* Hồ sơ nhân viên */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Hồ sơ nhân viên
              </h3>
              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-block text-sm font-medium text-blue-600 border border-blue-300 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors">
                      Tải ảnh lên
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Họ và tên đệm"
                    required
                    error={errors.lastName?.message}
                  >
                    <input
                      {...register("lastName")}
                      placeholder="VD: Nguyễn Văn"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? "border-red-400" : "border-gray-300"}`}
                    />
                  </FormField>
                  <FormField
                    label="Tên"
                    required
                    error={errors.firstName?.message}
                  >
                    <input
                      {...register("firstName")}
                      placeholder="VD: An"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? "border-red-400" : "border-gray-300"}`}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Ngày sinh"
                    error={errors.dateOfBirth?.message}
                  >
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <DatePicker {...field} error={!!errors.dateOfBirth} />
                      )}
                    />
                  </FormField>
                  <FormField label="Giới tính" error={errors.gender?.message}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={GENDER_OPTIONS}
                          placeholder="Chọn giới tính"
                          error={!!errors.gender}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Ngày bắt đầu làm việc"
                    error={errors.startWorkDate?.message}
                  >
                    <Controller
                      name="startWorkDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker {...field} error={!!errors.startWorkDate} />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Mã nhân viên"
                    required
                    error={errors.employeeCode?.message}
                  >
                    <input
                      {...register("employeeCode")}
                      placeholder="VD: PS5373"
                      disabled={formType === "edit"}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formType === "edit"
                          ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                          : ""
                      } ${errors.employeeCode ? "border-red-400" : "border-gray-300"}`}
                    />
                  </FormField>
                </div>

                {/* ===== Thuộc cấp & Số điện thoại ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Thuộc cấp */}
                  <FormField label="Thuộc cấp" error={errors.level?.message}>
                    <Controller
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={LEVELS}
                          placeholder="Chọn cấp bậc"
                          error={!!errors.level}
                        />
                      )}
                    />
                  </FormField>

                  {/* Số điện thoại */}
                  <FormField
                    label="Số điện thoại"
                    required
                    error={errors.phone?.message}
                  >
                    <input
                      {...register("phone")}
                      placeholder="VD: 0912345678"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? "border-red-400" : "border-gray-300"
                      }`}
                    />
                  </FormField>
                </div>

                {/* ===== Địa chỉ ===== */}
                <FormField label="Địa chỉ" error={errors.address?.message}>
                  <textarea
                    {...register("address")}
                    placeholder="Địa chỉ"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </FormField>

                {/* ===== Phòng ban ===== */}
                <FormField
                  label="Phòng ban"
                  required
                  error={errors.department?.message}
                >
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={DEPARTMENTS}
                        placeholder="Chọn phòng ban"
                        error={!!errors.department}
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>

            {/* Giấy tờ đính kèm */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Giấy tờ đính kèm
              </h3>
              <FileUpload files={attachments} onFilesChange={setAttachments} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-3 space-y-6">
            {/* Trạng thái làm việc — chỉ hiện ở edit */}
            {formType === "edit" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Trạng thái làm việc
                </h3>
                <FormField
                  label="Trạng thái"
                  error={errors.workStatus?.message}
                >
                  <Controller
                    name="workStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={WORK_STATUS_OPTIONS}
                        error={!!errors.workStatus}
                      />
                    )}
                  />
                </FormField>
              </div>
            )}

            {/* Tài khoản đăng nhập SSO */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Tài khoản đăng nhập SSO
              </h3>
              <FormField label="Email" required error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="VD: nguyen.van.an@company.vn"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-400" : "border-gray-300"}`}
                />
              </FormField>
            </div>

            {/* Vai trò khác */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Vai trò khác
              </h3>
              <FormField label="Vai trò" error={errors.role?.message}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={ROLES}
                      placeholder="Chọn vai trò"
                      error={!!errors.role}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div>
            {formType === "edit" && (
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Xoá bản ghi
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {formType === "add" ? "Hủy thay đổi" : "Huỷ thay đổi"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && (
                <svg
                  className="w-4 h-4 animate-spin"
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
              )}
              {formType === "add" ? "Đăng ký" : "Cập nhật"}
            </button>
          </div>
        </div>
      </form>

      {/* Delete confirm modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xoá"
      >
        <p className="text-sm text-gray-600 mb-6">
          Bạn có chắc muốn xoá nhân viên này? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
          >
            {isDeleting && (
              <svg
                className="w-4 h-4 animate-spin"
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
            )}
            Xoá
          </button>
        </div>
      </Modal>
    </>
  );
}
