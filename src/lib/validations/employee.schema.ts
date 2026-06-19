import { z } from 'zod';

export const employeeSchema = z.object({
  lastName: z.string().min(1, 'Vui lòng nhập họ và tên đệm'),
  firstName: z.string().min(1, 'Vui lòng nhập tên'),
  employeeCode: z.string().min(1, 'Vui lòng nhập mã nhân viên'),
  email: z.string().email('Email không đúng định dạng'),
  phone: z
    .string()
    .regex(/^(0\d{9}|\+84\d{9})$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  department: z.string().min(1, 'Vui lòng chọn phòng ban'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  startWorkDate: z.string().optional(),
  level: z.string().optional(),
  address: z.string().optional(),
  role: z.string().optional(),
  workStatus: z.enum(['active', 'resigned']).optional(),
  avatarUrl: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
