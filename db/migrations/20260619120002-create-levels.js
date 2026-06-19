"use strict";

/** Bang tra cuu cap bac. employees tham chieu qua level_id (FK). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("levels", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("levels");
  },
};
