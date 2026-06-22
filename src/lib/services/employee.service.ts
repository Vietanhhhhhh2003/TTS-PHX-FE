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
import { graphqlEmployeeService } from './employee.graphql';
import { apiEmployeeService } from './employee.api'; // nhánh B (NestJS)

const source = process.env.NEXT_PUBLIC_DATA_SOURCE;
export const employeeService: IEmployeeService =
  source === 'graphql'
    ? graphqlEmployeeService
    : source === 'api'
      ? apiEmployeeService
      : mockEmployeeService;
