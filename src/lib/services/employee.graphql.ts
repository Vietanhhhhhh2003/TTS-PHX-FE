// Nhánh A (Tuần 3): implement IEmployeeService bằng GraphQL qua postGraphile.
// UI tuần 1 không đổi — chỉ gạt NEXT_PUBLIC_DATA_SOURCE=graphql.
//
// Hai điểm map quan trọng (postGraphile <-> type Employee phẳng của FE):
//  1. Quan hệ: DB lưu department_id (FK int) -> GraphQL lồng departmentByDepartmentId.name.
//     Bảng tra cứu lưu name = slug ("engineering"...) khớp constants.ts, nên đọc lấy .name,
//     ghi phải đổi slug -> id (cache lookup bên dưới).
//  2. Enum: DB/GraphQL dùng CHỮ HOA (ACTIVE, MALE...), FE dùng chữ thường (active, male).
import { GraphQLClient, gql } from 'graphql-request';
import { IEmployeeService } from './employee.service';
import {
  Employee,
  EmployeeListParams,
  Gender,
  PaginatedResponse,
  WorkStatus,
} from '@/types/employee';

const client = new GraphQLClient(
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5433/graphql',
);

// Field chung chọn cho mọi truy vấn trả về 1 employee -> đảm bảo toEmployee đủ dữ liệu.
const EMP_FIELDS = gql`
  fragment EmpFields on Employee {
    id
    avatarUrl
    lastName
    firstName
    dateOfBirth
    gender
    startWorkDate
    employeeCode
    phone
    address
    email
    workStatus
    createdAt
    updatedAt
    departmentByDepartmentId {
      name
    }
    levelByLevelId {
      name
    }
    roleByRoleId {
      name
    }
  }
`;

// ---- Map node GraphQL -> Employee phẳng của FE ----
function toEmployee(node: any): Employee {
  return {
    id: node.id,
    avatarUrl: node.avatarUrl ?? undefined,
    lastName: node.lastName,
    firstName: node.firstName,
    employeeCode: node.employeeCode,
    email: node.email,
    phone: node.phone,
    gender: node.gender ? (node.gender.toLowerCase() as Gender) : undefined,
    dateOfBirth: node.dateOfBirth ?? undefined,
    startWorkDate: node.startWorkDate ?? undefined,
    address: node.address ?? undefined,
    department: node.departmentByDepartmentId?.name ?? '',
    level: node.levelByLevelId?.name ?? undefined,
    role: node.roleByRoleId?.name ?? undefined,
    workStatus: node.workStatus.toLowerCase() as WorkStatus,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

// ---- Cache tra cứu slug <-> id cho department/level/role (chỉ tải 1 lần) ----
type LookupKind = 'department' | 'level' | 'role';
let lookupCache: Record<LookupKind, Map<string, number>> | null = null;

async function loadLookups() {
  if (lookupCache) return lookupCache;
  const data = await client.request<{
    allDepartments: { nodes: { id: number; name: string }[] };
    allLevels: { nodes: { id: number; name: string }[] };
    allRoles: { nodes: { id: number; name: string }[] };
  }>(gql`
    query Lookups {
      allDepartments {
        nodes {
          id
          name
        }
      }
      allLevels {
        nodes {
          id
          name
        }
      }
      allRoles {
        nodes {
          id
          name
        }
      }
    }
  `);
  const toMap = (nodes: { id: number; name: string }[]) =>
    new Map(nodes.map((n) => [n.name, n.id]));
  lookupCache = {
    department: toMap(data.allDepartments.nodes),
    level: toMap(data.allLevels.nodes),
    role: toMap(data.allRoles.nodes),
  };
  return lookupCache;
}

async function slugToId(kind: LookupKind, slug: string): Promise<number> {
  const cache = await loadLookups();
  const id = cache[kind].get(slug);
  if (id == null) throw new Error(`Không tìm thấy ${kind} "${slug}"`);
  return id;
}

// Đổi 1 phần Employee (FE) -> EmployeeInput/EmployeePatch (GraphQL):
// uppercase enum, slug -> *_id, "" -> null (để xóa giá trị khi update). Chỉ gồm field có mặt.
async function toInput(input: Partial<Employee>): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  const has = (k: keyof Employee) => Object.prototype.hasOwnProperty.call(input, k);
  const nz = (v?: string) => (v === undefined || v === '' ? null : v);

  if (has('avatarUrl')) out.avatarUrl = nz(input.avatarUrl);
  if (has('lastName')) out.lastName = input.lastName;
  if (has('firstName')) out.firstName = input.firstName;
  if (has('employeeCode')) out.employeeCode = input.employeeCode;
  if (has('email')) out.email = input.email;
  if (has('phone')) out.phone = input.phone;
  if (has('address')) out.address = nz(input.address);
  if (has('dateOfBirth')) out.dateOfBirth = nz(input.dateOfBirth);
  if (has('startWorkDate')) out.startWorkDate = nz(input.startWorkDate);
  if (has('gender')) out.gender = input.gender ? input.gender.toUpperCase() : null;
  if (has('workStatus') && input.workStatus)
    out.workStatus = input.workStatus.toUpperCase();
  if (has('department'))
    out.departmentId = input.department
      ? await slugToId('department', input.department)
      : null;
  if (has('level'))
    out.levelId = input.level ? await slugToId('level', input.level) : null;
  if (has('role'))
    out.roleId = input.role ? await slugToId('role', input.role) : null;

  return out;
}

export const graphqlEmployeeService: IEmployeeService = {
  async list(params: EmployeeListParams): Promise<PaginatedResponse<Employee>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const offset = (page - 1) * pageSize;
    const orderBy = params.sort === 'oldest' ? ['CREATED_AT_ASC'] : ['CREATED_AT_DESC'];

    // Lọc chính xác qua condition (workStatus, departmentId).
    const condition: Record<string, unknown> = {};
    if (params.workStatus) condition.workStatus = params.workStatus.toUpperCase();
    if (params.department)
      condition.departmentId = await slugToId('department', params.department);

    // Search gần đúng (ILIKE) qua filter (cần plugin connection-filter).
    let filter: Record<string, unknown> | undefined;
    if (params.search) {
      const q = params.search;
      filter = {
        or: [
          { firstName: { includesInsensitive: q } },
          { lastName: { includesInsensitive: q } },
          { email: { includesInsensitive: q } },
          { employeeCode: { includesInsensitive: q } },
        ],
      };
    }

    const data = await client.request<{
      allEmployees: { totalCount: number; nodes: any[] };
    }>(
      gql`
        ${EMP_FIELDS}
        query ListEmployees(
          $first: Int!
          $offset: Int!
          $orderBy: [EmployeesOrderBy!]
          $condition: EmployeeCondition
          $filter: EmployeeFilter
        ) {
          allEmployees(
            first: $first
            offset: $offset
            orderBy: $orderBy
            condition: $condition
            filter: $filter
          ) {
            totalCount
            nodes {
              ...EmpFields
            }
          }
        }
      `,
      {
        first: pageSize,
        offset,
        orderBy,
        condition: Object.keys(condition).length ? condition : undefined,
        filter,
      },
    );

    const total = data.allEmployees.totalCount;
    return {
      data: data.allEmployees.nodes.map(toEmployee),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getById(id: string): Promise<Employee> {
    const data = await client.request<{ employeeById: any }>(
      gql`
        ${EMP_FIELDS}
        query GetEmployee($id: UUID!) {
          employeeById(id: $id) {
            ...EmpFields
          }
        }
      `,
      { id },
    );
    if (!data.employeeById) throw new Error(`Không tìm thấy nhân viên với id ${id}`);
    return toEmployee(data.employeeById);
  },

  async create(input: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const employee = await toInput(input);
    const data = await client.request<{ createEmployee: { employee: any } }>(
      gql`
        ${EMP_FIELDS}
        mutation CreateEmployee($input: CreateEmployeeInput!) {
          createEmployee(input: $input) {
            employee {
              ...EmpFields
            }
          }
        }
      `,
      { input: { employee } },
    );
    return toEmployee(data.createEmployee.employee);
  },

  async update(id: string, input: Partial<Employee>): Promise<Employee> {
    const employeePatch = await toInput(input);
    const data = await client.request<{ updateEmployeeById: { employee: any } }>(
      gql`
        ${EMP_FIELDS}
        mutation UpdateEmployee($input: UpdateEmployeeByIdInput!) {
          updateEmployeeById(input: $input) {
            employee {
              ...EmpFields
            }
          }
        }
      `,
      { input: { id, employeePatch } },
    );
    return toEmployee(data.updateEmployeeById.employee);
  },

  async remove(id: string): Promise<void> {
    await client.request(
      gql`
        mutation DeleteEmployee($input: DeleteEmployeeByIdInput!) {
          deleteEmployeeById(input: $input) {
            deletedEmployeeId
          }
        }
      `,
      { input: { id } },
    );
  },

  async stats(): Promise<{ total: number; active: number; resigned: number }> {
    const data = await client.request<{
      total: { totalCount: number };
      active: { totalCount: number };
      resigned: { totalCount: number };
    }>(gql`
      query EmployeeStats {
        total: allEmployees {
          totalCount
        }
        active: allEmployees(condition: { workStatus: ACTIVE }) {
          totalCount
        }
        resigned: allEmployees(condition: { workStatus: RESIGNED }) {
          totalCount
        }
      }
    `);
    return {
      total: data.total.totalCount,
      active: data.active.totalCount,
      resigned: data.resigned.totalCount,
    };
  },
};
