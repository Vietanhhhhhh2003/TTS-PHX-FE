"use strict";

/**
 * Bang employees. Cot khop dung type Employee cua tuan 1.
 * FK -> departments/levels/roles (nhieu-mot). id dung UUID (gen_random_uuid co san o PG13+).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("employees", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      avatar_url: { type: Sequelize.TEXT, allowNull: true },
      last_name: { type: Sequelize.STRING, allowNull: false }, // Ho va ten dem
      first_name: { type: Sequelize.STRING, allowNull: false }, // Ten
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: true,
      },
      start_work_date: { type: Sequelize.DATEONLY, allowNull: true },
      employee_code: { type: Sequelize.STRING, allowNull: false, unique: true }, // Ma NV
      phone: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true }, // SSO
      work_status: {
        type: Sequelize.ENUM("active", "resigned"),
        allowNull: false,
        defaultValue: "active",
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "departments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "levels", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "roles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("employees");
    // dropTable khong xoa kieu ENUM Sequelize tao -> xoa tay de migrate lai sach
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_employees_gender";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_employees_work_status";',
    );
  },
};
