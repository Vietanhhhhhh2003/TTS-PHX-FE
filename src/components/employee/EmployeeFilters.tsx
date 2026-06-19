"use client";

import { DEPARTMENTS } from "@/lib/utils/constants";

interface FiltersProps {
  department: string;
  onDepartmentChange: (value: string) => void;
}

export function EmployeeFilters({
  department,
  onDepartmentChange,
}: FiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Phòng ban:</span>

      <select
        value={department}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Tất cả</option>
        {DEPARTMENTS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}
