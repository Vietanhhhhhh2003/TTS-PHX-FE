"use strict";

// Slug khop voi constants.ts cua tuan 1 (UI map slug -> label tieng Viet).
const DEPARTMENTS = ["engineering", "marketing", "accounting", "hr", "sales", "management", "operations", "support"];
const ROLES = ["admin", "manager", "employee", "intern"];
const LEVELS = ["junior", "mid", "senior", "lead", "manager", "director"];

const rows = (names) => names.map((name) => ({ name, created_at: new Date(), updated_at: new Date() }));

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("departments", rows(DEPARTMENTS));
    await queryInterface.bulkInsert("roles", rows(ROLES));
    await queryInterface.bulkInsert("levels", rows(LEVELS));
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("levels", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("departments", null, {});
  },
};
