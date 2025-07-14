module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define(
    "ActivityLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.INTEGER,
      },
      details: {
        type: DataTypes.JSON,
      },
      ipAddress: {
        type: DataTypes.STRING,
      },
      userAgent: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "activity_logs",
      timestamps: true,
      updatedAt: false,
    },
  )

  ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.User, { foreignKey: "userId", as: "user" })
  }

  return ActivityLog
}
