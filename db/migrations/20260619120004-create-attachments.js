"use strict";

/** Giay to dinh kem. FK o phia "nhieu"; xoa employee -> xoa luon attachments (CASCADE). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attachments", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      employee_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "employees", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING, allowNull: false },
      url: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("attachments");
  },
};
