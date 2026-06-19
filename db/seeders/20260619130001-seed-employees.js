"use strict";

const employees = require("../../mock/employees.json");

// Lay map slug -> id tu mot bang tra cuu da seed.
async function nameToId(queryInterface, table) {
  const [rows] = await queryInterface.sequelize.query(`SELECT id, name FROM ${table}`);
  return Object.fromEntries(rows.map((r) => [r.name, r.id]));
}

module.exports = {
  async up(queryInterface) {
    const deptMap = await nameToId(queryInterface, "departments");
    const roleMap = await nameToId(queryInterface, "roles");
    const levelMap = await nameToId(queryInterface, "levels");

    // Khong set id: de Postgres tu sinh UUID (mock id "1".."20" khong phai UUID).
    const rows = employees.map((e) => ({
      avatar_url: e.avatarUrl ?? null,
      last_name: e.lastName,
      first_name: e.firstName,
      date_of_birth: e.dateOfBirth ?? null,
      gender: e.gender ?? null,
      start_work_date: e.startWorkDate ?? null,
      employee_code: e.employeeCode,
      phone: e.phone,
      address: e.address ?? null,
      email: e.email,
      work_status: e.workStatus,
      department_id: deptMap[e.department] ?? null,
      level_id: levelMap[e.level] ?? null,
      role_id: roleMap[e.role] ?? null,
      created_at: new Date(e.createdAt),
      updated_at: new Date(e.updatedAt),
    }));

    await queryInterface.bulkInsert("employees", rows);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("employees", null, {});
  },
};
