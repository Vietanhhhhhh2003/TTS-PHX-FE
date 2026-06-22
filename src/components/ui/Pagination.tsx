"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/lib/utils/constants";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center px-4 py-3 border-t border-gray-200 bg-white">
      {/* Số bản ghi / trang */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap">bản ghi/trang</span>
      </div>

      {/* Text */}
      <span className="ml-auto mr-4 text-sm text-gray-500 whitespace-nowrap">
        Hiển thị {from}–{to} trên {total} bản ghi
      </span>

      {/* Pagination */}
      <div className="flex items-center gap-1 ">
        <PageBtn
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          side="left"
          icon={<ChevronLeft className="h-5 w-5" />}
        />

        <PageBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          side="right"
          icon={<ChevronRight className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

interface PageBtnProps {
  onClick: () => void;
  disabled: boolean;
  side: "left" | "right";
  icon: React.ReactNode;
}

function PageBtn({ onClick, disabled, side, icon }: PageBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center border border-gray-200 bg-gray-200 transition-colors
        ${side === "left" ? "rounded-l-md" : "rounded-r-md"}
        ${
          disabled
            ? "cursor-not-allowed bg-gray-200 text-gray-300"
            : "text-gray-700 hover:bg-gray-200 active:bg-gray-200"
        }`}
    >
      {icon}
    </button>
  );
}
