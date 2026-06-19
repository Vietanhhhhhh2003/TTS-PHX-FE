import { WorkStatus } from "@/types/employee";

type StatKey = WorkStatus | undefined; // undefined = "Tất cả"

interface StatsProps {
  total: number;
  active: number;
  resigned: number;
  selected: StatKey; // ô đang chọn (đồng bộ params.workStatus)
  onSelect: (value: StatKey) => void;
}

export function EmployeeStats({
  total,
  active,
  resigned,
  selected,
  onSelect,
}: StatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        label="Tổng cộng"
        value={total}
        color="blue"
        selected={selected === undefined}
        onClick={() => onSelect(undefined)}
      />
      <StatCard
        label="Đang làm việc"
        value={active}
        color="green"
        selected={selected === "active"}
        onClick={() => onSelect("active")}
      />
      <StatCard
        label="Đã nghỉ việc"
        value={resigned}
        color="gray"
        selected={selected === "resigned"}
        onClick={() => onSelect("resigned")}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "gray";
  selected: boolean;
  onClick: () => void;
}) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    gray: "bg-gray-50 border-gray-200 text-gray-600",
  };
  const numMap = {
    blue: "text-blue-700",
    green: "text-green-700",
    gray: "text-gray-700",
  };
  // Ô đang chọn: thêm ring nhấn theo màu để nổi bật
  const ringMap = {
    blue: "ring-2 ring-blue-500",
    green: "ring-2 ring-green-500",
    gray: "ring-2 ring-gray-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full rounded-xl border p-4 transition-all hover:brightness-95 ${
        colorMap[color]
      } ${selected ? ringMap[color] : ""}`}
    >
      {/* Nhãn: in đậm hơn khi được chọn */}
      <p className={`text-sm ${selected ? "font-bold" : "font-medium"}`}>
        {label}
      </p>
      {/* Số: luôn đậm; khi chọn cho to hơn để nhấn */}
      <p
        className={`font-bold mt-1 ${numMap[color]} ${
          selected ? "text-4xl" : "text-3xl"
        }`}
      >
        {value.toLocaleString("vi-VN")}
      </p>
    </button>
  );
}
