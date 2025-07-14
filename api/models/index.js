const { Sequelize } = require("sequelize")
const config = require("../config/database")[process.env.NODE_ENV || "development"]

const sequelize = new Sequelize(config.database, config.username, config.password, config)

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
