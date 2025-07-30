const bcrypt = require("bcryptjs")

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "dev"),
        defaultValue: "user",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, Number.parseInt(process.env.BCRYPT_ROUNDS))
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, Number.parseInt(process.env.BCRYPT_ROUNDS))
          }
        },
      },
    },
  )

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password)
  }

  User.prototype.hasPermission = async function (resource, action) {
    // Los dev tienen todos los permisos
    if (this.role === "dev") return true

    // Los admin tienen permisos específicos
    if (this.role === "admin") {
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
        "import:create", // Permiso futuro
      ]
      return adminPermissions.includes(`${resource}:${action}`)
    }

    // Los users solo pueden leer productos
    if (this.role === "user") {
      const userPermissions = ["products:read"]
      return userPermissions.includes(`${resource}:${action}`)
    }

    return false
  }

  User.associate = (models) => {
    User.hasMany(models.ActivityLog, { foreignKey: "userId", as: "activities" })
    User.belongsToMany(models.Permission, {
      through: "user_permissions",
      foreignKey: "userId",
      otherKey: "permissionId",
      as: "permissions",
    })
  }

  return User
}
