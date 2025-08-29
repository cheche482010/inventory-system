const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { successResponse, errorResponse } = require("../helpers/responseHelper")

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email, isActive: true } })

    if (!user || !(await user.validatePassword(password))) {
      return errorResponse(res, "Credenciales inválidas", 401)
    }

    await user.update({ lastLogin: new Date() })

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      "Login exitoso",
    )
  } catch (error) {
    errorResponse(res, "Error en el login")
  }
}

const getMe = (req, res) => {
  successResponse(res, req.user, "Usuario obtenido")
}

const refreshToken = async (req, res) => {
  try {
    const newToken = jwt.sign({ userId: req.user.id, role: req.user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    successResponse(res, { token: newToken }, "Token renovado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al renovar token")
  }
}

module.exports = {
  login,
  getMe,
  refreshToken,
}