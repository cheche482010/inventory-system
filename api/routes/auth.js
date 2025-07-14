const express = require("express")
const jwt = require("jsonwebtoken")
const { body } = require("express-validator")
const { User } = require("../models")
const { successResponse, errorResponse } = require("../helpers/responseHelper")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Password requerido"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ where: { email, isActive: true } })

      if (!user || !(await user.validatePassword(password))) {
        return errorResponse(res, "Credenciales inválidas", 401)
      }

      // Update last login
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
  },
)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token no válido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/me", authenticateToken, (req, res) => {
  successResponse(res, req.user, "Usuario obtenido")
})

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de autenticación
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Nuevo JWT token
 *       401:
 *         description: Token no válido
 */
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const newToken = jwt.sign({ userId: req.user.id, role: req.user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    successResponse(res, { token: newToken }, "Token renovado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al renovar token")
  }
})

module.exports = router
