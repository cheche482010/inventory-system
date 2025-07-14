const bcrypt = require("bcryptjs")

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 12)
    const userPassword = await bcrypt.hash("user123", 12)
    const devPassword = await bcrypt.hash("dev123", 12)

    await queryInterface.bulkInsert(
      "users",
      [
        {
          email: "admin@inventory.com",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "System",
          role: "admin",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "user@inventory.com",
          password: userPassword,
          firstName: "Usuario",
          lastName: "General",
          role: "user",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "dev@inventory.com",
          password: devPassword,
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
