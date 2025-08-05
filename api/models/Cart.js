module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("active", "submitted", "approved", "rejected"),
        defaultValue: "active",
        allowNull: false,
      },
    },
    {
      tableName: "carts",
      timestamps: true,
    },
  )

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    })
    Cart.hasMany(models.CartItem, {
      foreignKey: "cartId",
      as: "items",
    })
  }

  return Cart
}