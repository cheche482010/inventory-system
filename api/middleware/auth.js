const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Usuario no válido" })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" })
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permisos insuficientes" })
    }
    next()
  }
}

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const hasPermission = await req.user.hasPermission(resource, action)
      if (!hasPermission) {
        return res.status(403).json({ error: "Permisos insuficientes para esta acción" })
      }
      next()
    } catch (error) {
      return res.status(500).json({ error: "Error al verificar permisos" })
    }
  }
}

module.exports = { authenticateToken, authorize, checkPermission }
