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

  User.associate = (models) => {
    User.hasMany(models.ActivityLog, { foreignKey: "userId", as: "activities" })
  }

  return User
}
