'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('notifications', 'type', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null for existing notifications
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('notifications', 'type');
  }
};
