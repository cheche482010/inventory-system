module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "categories",
      [
        {
          name: "AIR MASTER",
          description: "Productos relacionados con sistemas de aire",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "ALTERNADORES",
          description: "Alternadores para vehículos",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "AMORTIGUADORES",
          description: "Amortiguadores y componentes de suspensión",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categories", null, {})
  },
}
