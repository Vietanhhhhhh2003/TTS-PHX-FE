// types/employee.ts
// Type tập trung cho toàn app. Mọi nơi (UI, service, validation, API route)
// đều import từ đây để dữ liệu nhất quán. Tuần 3 có thể align với GraphQL codegen.

export type Gender = "male" | "female" | "other";
export type WorkStatus = "active" | "resigned"; // Đang làm việc / Đã nghỉ việc

export interface Employee {
  id: string;
  avatarUrl?: string; // Tải ảnh lên
  lastName: string; // Họ và tên đệm
  firstName: string; // Tên
  dateOfBirth?: string; // ISO yyyy-mm-dd (hiển thị dd-mm-yyyy)
  gender?: Gender;
  startWorkDate?: string; // Ngày bắt đầu làm việc
  employeeCode: string; // Mã nhân viên - unique (vd PS5373)
  level?: string; // Thuộc cấp
  phone: string;
  address?: string;
  department: string; // Phòng ban
  workStatus: WorkStatus; // Chỉ sửa được ở màn edit
  email: string; // SSO - unique
  role?: string; // Vai trò khác
  attachments?: { name: string; url: string }[]; // Giấy tờ đính kèm (PDF/JPG/PNG)
  createdAt: string;
  updatedAt: string;
}

// Shape response BẮT BUỘC: mock và API thật (Tuần 3) phải trả về giống hệt nhau
// -> đổi nguồn dữ liệu không phải sửa lại UI.
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tham số cho hàm list() - khớp với filter/search/sort trên màn /list
export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  search?: string; // tìm theo tên / email / mã NV
  department?: string; // filter Phòng ban
  workStatus?: WorkStatus; // filter trạng thái
  sort?: "newest" | "oldest"; // tab Mới nhất / Cũ nhất
}
