require("dotenv").config()

const { Sequelize } = require("sequelize")
const config = require("../config/database")

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    define: {
      timestamps: true,
      underscored: false 
    }
  }
)

const db = {}

// Import models
db.User = require("./User")(sequelize, Sequelize.DataTypes)
db.Brand = require("./Brand")(sequelize, Sequelize.DataTypes)
db.Category = require("./Category")(sequelize, Sequelize.DataTypes)
db.Product = require("./Product")(sequelize, Sequelize.DataTypes)
db.ActivityLog = require("./ActivityLog")(sequelize, Sequelize.DataTypes)

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
