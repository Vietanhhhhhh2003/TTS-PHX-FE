import { NextRequest, NextResponse } from 'next/server';
import { mockEmployeeService } from '@/lib/services/employee.mock';
import { EmployeeListParams, WorkStatus } from '@/types/employee';
import { employeeSchema } from '@/lib/validations/employee.schema';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const params: EmployeeListParams = {
    page: Number(sp.get('page') ?? 1),
    pageSize: Number(sp.get('pageSize') ?? 10),
    search: sp.get('search') ?? undefined,
    department: sp.get('department') ?? undefined,
    workStatus: (sp.get('workStatus') as WorkStatus) ?? undefined,
    sort: (sp.get('sort') as 'newest' | 'oldest') ?? undefined,
  };
  const result = await mockEmployeeService.list(params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const employee = await mockEmployeeService.create({
    ...parsed.data,
    workStatus: parsed.data.workStatus ?? 'active',
  });
  return NextResponse.json(employee, { status: 201 });
}
