import { WorkStatus } from "@/types/employee";

export function StatusBadge({ status }: { status: WorkStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-xs font-medium text-green-700">
        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
        Đang làm việc
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-400 text-xs font-medium text-white">
      <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
        <svg
          className="w-2.5 h-2.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M6 6l12 12M18 6L6 18"
          />
        </svg>
      </span>
      Đã nghỉ việc
    </span>
  );
}
