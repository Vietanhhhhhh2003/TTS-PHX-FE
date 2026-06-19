import { Employee, EmployeeListParams, PaginatedResponse } from '@/types/employee';

export interface IEmployeeService {
  list(params: EmployeeListParams): Promise<PaginatedResponse<Employee>>;
  getById(id: string): Promise<Employee>;
  create(input: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee>;
  update(id: string, input: Partial<Employee>): Promise<Employee>;
  remove(id: string): Promise<void>;
  stats(): Promise<{ total: number; active: number; resigned: number }>;
}

import { mockEmployeeService } from './employee.mock';
// import { graphqlEmployeeService } from './employee.graphql'; // bật ở tuần 3

export const employeeService: IEmployeeService =
  process.env.NEXT_PUBLIC_DATA_SOURCE === 'graphql'
    ? /* graphqlEmployeeService */ mockEmployeeService
    : mockEmployeeService;
