const path = require('path')
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: path.resolve(__dirname, '../../.env') })
}

const NODE_ENV = process.env.NODE_ENV || 'development'

// Configuración de desarrollo
const localConfig = {
  username: process.env.LOCAL_DB_USER,
  password: process.env.LOCAL_DB_PASSWORD,
  database: process.env.LOCAL_DB_NAME,
  host: process.env.LOCAL_DB_HOST,
  port: process.env.LOCAL_DB_PORT,
  dialect: process.env.LOCAL_DB_SERVER,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  }
}

// Configuración de producción
const prodConfig = {
  username: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME,
  host: process.env.PROD_DB_HOST,
  port: process.env.PROD_DB_PORT,
  dialect: process.env.PROD_DB_SERVER,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  }
}

// Exportar la configuración correcta según el entorno
module.exports = NODE_ENV === 'production' ? prodConfig : localConfig
