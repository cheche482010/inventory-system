module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "brands",
      [
        {
          name: "TENKEI",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "TW",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "ISUZU",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "MONROE",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "MITSUBISHI",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("brands", null, {})
  },
}
