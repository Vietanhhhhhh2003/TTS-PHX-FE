"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { employeeService } from "@/lib/services/employee.service";
import {
  Employee,
  EmployeeListParams,
  PaginatedResponse,
} from "@/types/employee";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { EmployeeStats } from "@/components/employee/EmployeeStats";
import { EmployeeFilters } from "@/components/employee/EmployeeFilters";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { DEFAULT_PAGE_SIZE } from "@/lib/utils/constants";

export default function EmployeeListPage() {
  const router = useRouter();

  const [params, setParams] = useState<EmployeeListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sort: "newest",
  });
  const [result, setResult] = useState<PaginatedResponse<Employee>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 0,
  });
  const [stats, setStats] = useState({ total: 0, active: 0, resigned: 0 });
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [listResult, statsResult] = await Promise.all([
          employeeService.list(params),
          employeeService.stats(),
        ]);
        if (!cancelled) {
          setResult(listResult);
          setStats(statsResult);
        }
      } catch {
        if (!cancelled) toast.error("Không thể tải danh sách nhân viên");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: search || undefined }));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function setParam<K extends keyof EmployeeListParams>(
    key: K,
    value: EmployeeListParams[K],
  ) {
    setParams((p) => ({ ...p, page: 1, [key]: value }));
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Danh sách nhân viên
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Tải lên
          </button>
          <button
            onClick={() => router.push("/add")}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="inline-block flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2">
        <EmployeeFilters
          department={params.department ?? ""}
          onDepartmentChange={(v) => setParam("department", v || undefined)}
        />
      </div>

      {/* Stats */}
      <EmployeeStats
        total={stats.total}
        active={stats.active}
        resigned={stats.resigned}
        selected={params.workStatus}
        onSelect={(value) => setParam("workStatus", value)}
      />

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs + search */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex gap-1">
            {(["newest", "oldest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setParam("sort", s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  params.sort === s
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s === "newest" ? "Mới nhất" : "Cũ nhất"}
              </button>
            ))}
          </div>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm tên, email, mã NV..."
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
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
        ) : (
          <EmployeeTable
            employees={result.data}
            page={result.page}
            pageSize={result.pageSize}
            onRowClick={(id) => router.push(`/edit/${id}`)}
          />
        )}

        {/* Pagination */}
        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          totalPages={result.totalPages}
          onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
          onPageSizeChange={(s) =>
            setParams((prev) => ({ ...prev, page: 1, pageSize: s }))
          }
        />
      </div>

      {/* Import modal placeholder */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Tải lên danh sách nhân viên"
      >
        <div className="text-sm text-gray-500 text-center py-6">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <p>Chức năng Import sẽ triển khai ở Tuần 4.</p>
        </div>
      </Modal>
    </div>
  );
}
