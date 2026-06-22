// Types cho luồng import (Tuần 4). Đọc bảng employees_raw qua postGraphile.

export type RawStatus = "pending" | "valid" | "invalid";

// 1 dòng thô trong employees_raw (đã thẩm định hoặc chưa).
export interface ImportRawRow {
  id: number;
  rowIndex: number | null;
  lastName: string | null;
  firstName: string | null;
  employeeCode: string | null;
  email: string | null;
  status: RawStatus;
  errorMessage: string | null;
  isScanned: boolean;
}

// 1 dòng hiển thị ở bảng Lịch sử (raw + thông tin lần upload).
export interface ImportRowView extends ImportRawRow {
  batchId: string;
  fileName: string | null;
  createdAt: string;
}

// Toàn bộ bản ghi import (phẳng, mới nhất trước) + số liệu tổng hợp cho 4 thẻ trên đầu.
export interface ImportOverview {
  rows: ImportRowView[];
  total: number;
  valid: number;
  invalid: number;
  pending: number;
}

// Kết quả API import trả về ngay sau khi đổ raw.
export interface ImportResult {
  batchId: string;
  totalRows: number;
  fileName: string;
}
