const bcrypt = require("bcryptjs")

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedAdminPassword = await bcrypt.hash("admin123", 12)
    const hashedUserPassword = await bcrypt.hash("user123", 12)
    const hashedDevPassword = await bcrypt.hash("dev123", 12)

    await queryInterface.bulkInsert(
      "users",
      [
        {
          email: "admin@inventory.com",
          password: hashedAdminPassword,
          firstName: "Admin",
          lastName: "System",
          role: "admin",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "user@inventory.com",
          password: hashedUserPassword,
          firstName: "Usuario",
          lastName: "General",
          role: "user",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "dev@inventory.com",
          password: hashedDevPassword,
          firstName: "Developer",
          lastName: "System",
          role: "dev",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {})
  },
}
