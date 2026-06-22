// Service cho luồng import (Tuần 4).
//  - importFile: upload multipart LÊN NestJS (3001) — chỉ NestJS mới parse + đổ raw,
//    nên hàm này luôn gọi API_URL bất kể NEXT_PUBLIC_DATA_SOURCE.
//  - listImportBatches: ĐỌC employees_raw trực tiếp qua postGraphile (giống cách
//    graphqlEmployeeService đọc allEmployees), gom theo import_batch_id cho màn Lịch sử.
import { GraphQLClient, gql } from "graphql-request";
import { ImportOverview, ImportResult, ImportRowView, RawStatus } from "@/types/import";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const client = new GraphQLClient(
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5433/graphql",
);

export async function importFile(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  // KHÔNG set Content-Type — browser tự thêm boundary multipart.
  const res = await fetch(`${API_URL}/employees/import`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const msg = err?.message
      ? Array.isArray(err.message)
        ? err.message.join(", ")
        : err.message
      : `Tải lên thất bại (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

interface RawNode {
  id: number;
  importBatchId: string;
  fileName: string | null;
  createdAt: string;
  rowIndex: number | null;
  lastName: string | null;
  firstName: string | null;
  employeeCode: string | null;
  email: string | null;
  status: string; // PENDING | VALID | INVALID
  errorMessage: string | null;
  isScanned: boolean;
}

// Đọc các bản ghi raw gần đây ở dạng PHẲNG (mỗi dòng 1 bản ghi) + số liệu tổng hợp.
// Khớp design: 4 thẻ tổng hợp trên đầu + 1 bảng liệt kê tất cả bản ghi.
export async function listImportRows(): Promise<ImportOverview> {
  const data = await client.request<{ allEmployeesRaws: { nodes: RawNode[] } }>(gql`
    query ImportHistory {
      allEmployeesRaws(orderBy: ID_DESC, first: 2000) {
        nodes {
          id
          importBatchId
          fileName
          createdAt
          rowIndex
          lastName
          firstName
          employeeCode
          email
          status
          errorMessage
          isScanned
        }
      }
    }
  `);

  const rows: ImportRowView[] = data.allEmployeesRaws.nodes.map((n) => ({
    id: n.id,
    rowIndex: n.rowIndex,
    lastName: n.lastName,
    firstName: n.firstName,
    employeeCode: n.employeeCode,
    email: n.email,
    status: n.status.toLowerCase() as RawStatus,
    errorMessage: n.errorMessage,
    isScanned: n.isScanned,
    batchId: n.importBatchId,
    fileName: n.fileName,
    createdAt: n.createdAt,
  }));

  return {
    rows, // đã ID_DESC -> mới nhất trước
    total: rows.length,
    valid: rows.filter((r) => r.status === "valid").length,
    invalid: rows.filter((r) => r.status === "invalid").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };
}
