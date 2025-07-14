const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }))
    return res.status(400).json({ error: "Errores de validación", details: errors })
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({ error: "El registro ya existe" })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Token inválido" })
  }

  // Default error
  res.status(500).json({ error: "Error interno del servidor" })
}

module.exports = { errorHandler }
