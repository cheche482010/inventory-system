'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('carts', 'status', {
      type: Sequelize.ENUM('active', 'submitted'),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('carts', 'status', {
      type: Sequelize.ENUM('active', 'submitted', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'active',
    });
  }
};
