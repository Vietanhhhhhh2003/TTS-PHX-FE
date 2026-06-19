import { NextRequest, NextResponse } from 'next/server';
import { mockEmployeeService } from '@/lib/services/employee.mock';
import { employeeSchema } from '@/lib/validations/employee.schema';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const employee = await mockEmployeeService.getById(id);
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const updated = await mockEmployeeService.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await mockEmployeeService.remove(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
  }
}
