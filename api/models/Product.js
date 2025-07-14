module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM("disponible", "nuevo", "oferta", "agotado"),
        defaultValue: "disponible",
      },
      brandId: {
        type: DataTypes.INTEGER,
        references: {
          model: "brands",
          key: "id",
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        references: {
          model: "categories",
          key: "id",
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "products",
      timestamps: true,
    },
  )

  Product.associate = (models) => {
    Product.belongsTo(models.Brand, { foreignKey: "brandId", as: "brand" })
    Product.belongsTo(models.Category, { foreignKey: "categoryId", as: "category" })
  }

  return Product
}
