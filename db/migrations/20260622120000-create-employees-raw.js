"use strict";

/**
 * Bang staging cho import (Tuan 4). API import do du lieu THO vao day (chua validate),
 * cronjob quet is_scanned=false -> validate -> day dong hop le sang bang employees.
 * Moi cot du lieu deu TEXT: raw chua thuc su tham dinh, viec map/ep kieu de cho cron.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("employees_raw", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      // Gom cac dong cua 1 lan upload -> man "Lich su tai len" group theo cot nay.
      import_batch_id: { type: Sequelize.UUID, allowNull: false },
      file_name: { type: Sequelize.TEXT, allowNull: true },
      row_index: { type: Sequelize.INTEGER, allowNull: true }, // so dong trong file, de bao loi

      // Du lieu THO tu file (deu text, chua validate/map slug->id, chua ep kieu).
      last_name: { type: Sequelize.TEXT, allowNull: true },
      first_name: { type: Sequelize.TEXT, allowNull: true },
      employee_code: { type: Sequelize.TEXT, allowNull: true },
      email: { type: Sequelize.TEXT, allowNull: true },
      phone: { type: Sequelize.TEXT, allowNull: true },
      department: { type: Sequelize.TEXT, allowNull: true },
      level: { type: Sequelize.TEXT, allowNull: true },
      role: { type: Sequelize.TEXT, allowNull: true },
      gender: { type: Sequelize.TEXT, allowNull: true },
      date_of_birth: { type: Sequelize.TEXT, allowNull: true },
      start_work_date: { type: Sequelize.TEXT, allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },

      // Dieu phoi + trang thai tham dinh (cho man Lich su).
      is_scanned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "valid", "invalid"),
        allowNull: false,
        defaultValue: "pending",
      },
      error_message: { type: Sequelize.TEXT, allowNull: true },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      scanned_at: { type: Sequelize.DATE, allowNull: true },
    });

    // Cron loc theo is_scanned -> index cho nhanh.
    await queryInterface.addIndex("employees_raw", ["is_scanned"]);
    await queryInterface.addIndex("employees_raw", ["import_batch_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("employees_raw");
    // dropTable khong xoa kieu ENUM Sequelize tao -> xoa tay de migrate lai sach
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_employees_raw_status";',
    );
  },
};
