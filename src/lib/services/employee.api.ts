// Nhánh B (Tuần 3): implement IEmployeeService gọi REST của NestJS (cổng 3001).
// NestJS chỉ có POST /employees (create) và PATCH /employees/:id (update) theo kế hoạch.
// -> WRITE đi qua NestJS; READ (list/getById/stats) + remove tái dùng nhánh GraphQL,
//    để mode "api" vẫn dùng được đầy đủ trên UI mà không lặp code đọc.
import { IEmployeeService } from './employee.service';
import { graphqlEmployeeService } from './employee.graphql';
import { Employee, EmployeeListParams, PaginatedResponse } from '@/types/employee';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function postJson(path: string, method: 'POST' | 'PATCH', body: unknown): Promise<Employee> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // NestJS ValidationPipe trả { message: string[] | string } -> gộp để page.tsx toast.error.
    const err = await res.json().catch(() => null);
    const msg = err?.message
      ? Array.isArray(err.message)
        ? err.message.join(', ')
        : err.message
      : `Yêu cầu thất bại (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export const apiEmployeeService: IEmployeeService = {
  // READ + remove: dùng lại nhánh GraphQL (NestJS không expose các endpoint này).
  list(params: EmployeeListParams): Promise<PaginatedResponse<Employee>> {
    return graphqlEmployeeService.list(params);
  },
  getById(id: string): Promise<Employee> {
    return graphqlEmployeeService.getById(id);
  },
  stats() {
    return graphqlEmployeeService.stats();
  },
  remove(id: string): Promise<void> {
    return graphqlEmployeeService.remove(id);
  },

  // WRITE: đi qua NestJS REST.
  create(input: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    return postJson('/employees', 'POST', input);
  },
  update(id: string, input: Partial<Employee>): Promise<Employee> {
    return postJson(`/employees/${id}`, 'PATCH', input);
  },
};
