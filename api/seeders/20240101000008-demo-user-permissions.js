module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, role FROM users;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const permissions = await queryInterface.sequelize.query(
      `SELECT id, name FROM permissions;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const userPermissions = [];

    const adminPermissions = [
      "products:read",
      "products:create",
      "products:update",
      "products:delete",
      "products:export",
      "brands:read",
      "brands:create",
      "brands:update",
      "brands:delete",
      "categories:read",
      "categories:create",
      "categories:update",
      "categories:delete",
      "users:read",
      "users:create",
      "users:update",
      "users:delete",
      "activities:read",
      "dashboard:read",
      "import:create",
    ];

    const userRolePermissions = ["products:read"];

    for (const user of users) {
      if (user.role === 'admin') {
        for (const pName of adminPermissions) {
          const permission = permissions.find(p => p.name === pName);
          if (permission) {
            userPermissions.push({
              userId: user.id,
              permissionId: permission.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      } else if (user.role === 'user') {
        for (const pName of userRolePermissions) {
          const permission = permissions.find(p => p.name === pName);
          if (permission) {
            userPermissions.push({
              userId: user.id,
              permissionId: permission.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
    }

    await queryInterface.bulkInsert('user_permissions', userPermissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_permissions', null, {});
  },
};
