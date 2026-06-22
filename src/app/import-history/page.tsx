"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Check, Clock, Search, X } from "lucide-react";
import { listImportRows } from "@/lib/services/import.service";
import { ImportOverview, RawStatus } from "@/types/import";
import { Pagination } from "@/components/ui/Pagination";

const POLL_MS = 3000; // cron đổi trạng thái theo nhịp -> polling là đủ, không cần realtime

const EMPTY: ImportOverview = {
  rows: [],
  total: 0,
  valid: 0,
  invalid: 0,
  pending: 0,
};

const SCHOOL_YEARS = ["2024-2025", "2025-2026", "2026-2027"];

// Map 1 bản ghi raw -> các cột theo design (sản phẩm thu phí). Cột không có dữ liệu
// nhân viên thì để giá trị mặc định (Số thu/chi = 0đ, Diễn giải = "Import nhân viên").
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}
function feeMonth(iso: string) {
  const d = new Date(iso);
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}
function voucherNo(batchId: string) {
  return `CT/${batchId.slice(0, 8).toUpperCase()}`;
}

export default function ImportHistoryPage() {
  const [data, setData] = useState<ImportOverview>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [schoolYear, setSchoolYear] = useState("2025-2026");
  const [month, setMonth] = useState("all");

  useEffect(() => {
    let active = true;
    // Poll: đồng bộ state với BE — setState chỉ chạy sau await (bất đồng bộ).
    async function poll() {
      try {
        const res = await listImportRows();
        if (active) setData(res);
      } catch {
        // im lặng khi poll lỗi để không spam toast
      } finally {
        if (active) setLoading(false);
      }
    }
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  // Lọc theo Năm học (năm của createdAt nằm trong khoảng) + Tháng + tìm kiếm.
  const filtered = useMemo(() => {
    const [y1, y2] = schoolYear.split("-").map(Number);
    const q = search.trim().toLowerCase();
    return data.rows.filter((r) => {
      const d = new Date(r.createdAt);
      if (![y1, y2].includes(d.getFullYear())) return false;
      if (month !== "all" && d.getMonth() + 1 !== Number(month)) return false;
      if (q) {
        const hay =
          `${r.employeeCode ?? ""} ${voucherNo(r.batchId)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.rows, schoolYear, month, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const processing = data.pending > 0;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-4">
      {/* Header + chỉ báo trạng thái thẩm định */}
      <div className="flex items-center gap-3">
        <Link href="/list" className="inline-flex items-center gap-2 group">
          <ArrowLeft className="w-5 h-5 text-gray-500 transition-colors group-hover:text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
            Lịch sử tải lên
          </h1>
        </Link>
        {data.total > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              processing
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                processing ? "bg-amber-500 animate-pulse" : "bg-green-500"
              }`}
            />
            {processing ? "Đang tiếp nhận file" : "Hoàn thành thẩm định"}
          </span>
        )}
      </div>

      {/* Thanh bộ lọc */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
          Năm học:
          <select
            value={schoolYear}
            onChange={(e) => {
              setSchoolYear(e.target.value);
              setPage(1);
            }}
            className="font-medium text-gray-800 focus:outline-none bg-transparent"
          >
            {SCHOOL_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
          Tháng nộp:
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="font-medium text-gray-800 focus:outline-none bg-transparent"
          >
            <option value="all">Tất cả</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </label>

        <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          90 ngày qua
        </span>
      </div>

      {/* 4 thẻ tổng hợp */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Tổng bản ghi" value={data.total} tone="blue" />
        <SummaryCard label="Bản ghi hợp lệ" value={data.valid} tone="green" />
        <SummaryCard
          label="Bản ghi không hợp lệ"
          value={data.invalid}
          tone="red"
        />
        <SummaryCard
          label="Bản ghi chờ xử lý"
          value={data.pending}
          tone="amber"
        />
      </div>

      {/* Bảng bản ghi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Ô tìm kiếm */}
        <div className="flex justify-end px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm mã đối tượng, số chứng từ..."
              className="pl-9 pr-3 py-2 w-72 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left text-xs text-black bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 font-bold">STT</th>
                <th className="px-3 py-3 font-bold">Mã đối tượng</th>
                <th className="px-3 py-3 font-bold">Diễn giải</th>
                <th className="px-3 py-3 font-bold">Nhập phí tháng</th>
                <th className="px-3 py-3 font-bold">Ngày hạch toán</th>
                <th className="px-3 py-3 font-bold">Số chứng từ</th>
                <th className="px-3 py-3 font-bold">Trạng thái</th>
                <th className="px-3 py-3 font-bold text-right">Số thu</th>
                <th className="px-3 py-3 font-bold text-right">Số chi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center text-gray-400"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center text-gray-500"
                  >
                    Chưa có bản ghi nào.
                  </td>
                </tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr key={r.id} className="border-b border-gray-50 align-top">
                    <td className="px-5 py-3 text-gray-500">
                      {(safePage - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {r.employeeCode ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      Import nhân viên
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {feeMonth(r.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {fmtDate(r.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {voucherNo(r.batchId)}
                    </td>
                    <td className="px-3 py-3">
                      <RawBadge status={r.status} />
                      {r.status === "invalid" && r.errorMessage && (
                        <p className="mt-1 text-xs text-gray-500 whitespace-normal break-words max-w-xs">
                          {r.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700">0 đ</td>
                    <td className="px-3 py-3 text-right text-gray-700">0 đ</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          pageSize={pageSize}
          total={filtered.length}
          totalPages={totalPages}
          onPageChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "red" | "amber";
}) {
  const map = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${map[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value.toLocaleString("vi-VN")}</p>
    </div>
  );
}

function RawBadge({ status }: { status: RawStatus }) {
  const map = {
    pending: {
      text: "Chờ xử lý",
      pill: "bg-amber-100 text-amber-700",
      circle: "bg-amber-500",
      Icon: Clock,
    },
    valid: {
      text: "Hợp lệ",
      pill: "bg-green-100 text-green-700",
      circle: "bg-green-500",
      Icon: Check,
    },
    invalid: {
      text: "Không hợp lệ",
      pill: "bg-red-100 text-red-600",
      circle: "bg-red-500",
      Icon: X,
    },
  }[status];
  const { Icon } = map;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map.pill}`}
    >
      <span
        className={`w-4 h-4 rounded-full ${map.circle} flex items-center justify-center`}
      >
        <Icon className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </span>
      {map.text}
    </span>
  );
}
