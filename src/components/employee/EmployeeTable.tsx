import { Employee } from "@/types/employee";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DEPARTMENTS, GENDER_OPTIONS } from "@/lib/utils/constants";

interface Props {
  employees: Employee[];
  page: number;
  pageSize: number;
  onRowClick: (id: string) => void;
}

function getLabel(list: { value: string; label: string }[], value: string) {
  return list.find((x) => x.value === value)?.label ?? value;
}

export function EmployeeTable({
  employees,
  page,
  pageSize,
  onRowClick,
}: Props) {
  const columns = [
    {
      key: "stt",
      header: "STT",
      render: (_: Employee, idx: number) => (page - 1) * pageSize + idx + 1,
    },
    {
      key: "name",
      header: "Họ tên",
      render: (e: Employee) => (
        <span className="text-gray-900">
          {e.lastName} {e.firstName}
        </span>
      ),
    },
    {
      key: "code",
      header: "Mã nhân viên",
      render: (e: Employee) => (
        <span className="text-gray-600">{e.employeeCode}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (e: Employee) => e.email,
    },
    {
      key: "phone",
      header: "Số điện thoại",
      render: (e: Employee) => e.phone,
    },
    {
      key: "gender",
      header: "Giới tính",
      render: (e: Employee) => getLabel(GENDER_OPTIONS, e.gender ?? ""),
    },
    {
      key: "department",
      header: "Phòng ban",
      render: (e: Employee) => getLabel(DEPARTMENTS, e.department),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (e: Employee) => <StatusBadge status={e.workStatus} />,
    },
  ];

  return (
    <Table
      columns={columns}
      data={employees}
      onRowClick={(e) => onRowClick(e.id)}
      emptyMessage="Không tìm thấy nhân viên nào"
    />
  );
}
