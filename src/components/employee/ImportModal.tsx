"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import * as ExcelJS from "exceljs";
import { Modal } from "@/components/ui/Modal";
import { importFile } from "@/lib/services/import.service";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (batchId: string) => void; // gọi sau khi đổ raw thành công
}

// Cột file mẫu. Header PHẢI trùng tên field BE đọc (IMPORT_COLUMNS) -> file tải về import được ngay.
// department/level/role là SLUG (không phải id); gender là male/female/other.
const TEMPLATE_COLUMNS = [
  { header: "lastName", key: "lastName", width: 16 },
  { header: "firstName", key: "firstName", width: 12 },
  { header: "employeeCode", key: "employeeCode", width: 14 },
  { header: "email", key: "email", width: 28 },
  { header: "phone", key: "phone", width: 16 },
  { header: "department", key: "department", width: 16 },
  { header: "level", key: "level", width: 12 },
  { header: "role", key: "role", width: 12 },
  { header: "gender", key: "gender", width: 10 },
  { header: "dateOfBirth", key: "dateOfBirth", width: 14 },
  { header: "startWorkDate", key: "startWorkDate", width: 14 },
  { header: "address", key: "address", width: 40 },
];

// 1 dòng mẫu hợp lệ (slug khớp constants FE/seed).
const TEMPLATE_SAMPLE: (string | number)[][] = [
  [
    "Nguyen Van",
    "An",
    "PS0001",
    "an@example.com",
    "0901234567",
    "engineering",
    "senior",
    "employee",
    "male",
    "1990-01-01",
    "2020-01-01",
    "123 Đường Lê Lợi, Quận 1, TP.HCM",
  ],
];

const THIN_BORDER = {
  top: { style: "thin" as const, color: { argb: "FFBFBFBF" } },
  left: { style: "thin" as const, color: { argb: "FFBFBFBF" } },
  bottom: { style: "thin" as const, color: { argb: "FFBFBFBF" } },
  right: { style: "thin" as const, color: { argb: "FFBFBFBF" } },
};

// Sinh file mẫu .xlsx có style (header xanh, border, xen kẽ màu) ngay tại trình duyệt.
async function downloadTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Nhân viên");
  sheet.columns = TEMPLATE_COLUMNS;

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2F5496" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = THIN_BORDER;
  });

  TEMPLATE_SAMPLE.forEach((row, i) => {
    const excelRow = sheet.addRow(row);
    excelRow.height = 18;
    const bgColor = i % 2 === 0 ? "FFFFFFFF" : "FFD6E4F7"; // trắng / xanh nhạt xen kẽ
    excelRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgColor },
      };
      cell.alignment = { vertical: "middle" };
      cell.border = THIN_BORDER;
    });
    // Căn giữa các cột mã/ngắn: employeeCode(3), phone(5), gender(9), dateOfBirth(10), startWorkDate(11)
    [3, 5, 9, 10, 11].forEach((col) => {
      excelRow.getCell(col).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mau-import-nhan-vien.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

const SCHOOL_YEARS = ["2024-2025", "2025-2026", "2026-2027"];

export function ImportModal({ open, onClose, onImported }: ImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 3 trường theo design (gắn nhãn lần import). Hiện chưa lưu ở BE -> mang tính ghi chú.
  const [schoolYear, setSchoolYear] = useState("2025-2026");
  const [batchLabel, setBatchLabel] = useState("");
  const [identifier, setIdentifier] = useState("");

  function reset() {
    setFile(null);
    setBatchLabel("");
    setIdentifier("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!file) {
      toast.error("Vui lòng chọn file để tải lên");
      return;
    }
    setSubmitting(true);
    try {
      const res = await importFile(file);
      toast.success(
        `Đã nhận ${res.totalRows} dòng, đang xử lý nền...`,
      );
      reset();
      onImported(res.batchId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tải lên thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Tải lên danh sách nhân viên">
      <div className="space-y-4">
        {/* Năm học */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm học
          </label>
          <select
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SCHOOL_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Đợt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đợt
          </label>
          <input
            value={batchLabel}
            onChange={(e) => setBatchLabel(e.target.value)}
            placeholder="VD: Đợt 1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Dùng tên để nhận diện theo ngày, theo khối, theo đợt.
          </p>
        </div>

        {/* Mã định danh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã định danh
          </label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="VD: 221221"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Mã định danh giúp nhận diện theo đợt import.
          </p>
        </div>

        {/* Vùng chọn file */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <svg
            className="w-8 h-8 text-gray-400 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          {file ? (
            <p className="text-sm font-medium text-gray-800 truncate">
              {file.name}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Chọn file để tải lên</p>
          )}
          <p className="text-xs text-gray-400 mt-1">.xlsx hoặc .csv</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />

        <p className="text-xs text-gray-500">
          File được đổ vào hàng chờ và thẩm định nền theo lịch. Theo dõi kết quả ở
          màn <span className="font-medium">Lịch sử tải lên</span>.
        </p>

        {/* Footer: tải file mẫu (trái) — Huỷ / Tải lên (phải) */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => void downloadTemplate()}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            ↓ Tải xuống file mẫu
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !file}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang tải lên..." : "Tải lên"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
