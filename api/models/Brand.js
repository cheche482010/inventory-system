module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define(
    "Brand",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "brands",
      timestamps: true,
    },
  )

  Brand.associate = (models) => {
    Brand.hasMany(models.Product, { foreignKey: "brandId", as: "products" })
  }

  return Brand
}
