const express = require("express")
const { body, param } = require("express-validator")
const { User, ActivityLog } = require("../models")
const { authenticateToken, authorize } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { Op } = require("sequelize")

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         role:
 *           type: string
 *           enum: [user, admin, dev]
 *           description: Rol del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado activo/inactivo
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Fecha del último login
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         id: 1
 *         email: "admin@inventory.com"
 *         firstName: "Admin"
 *         lastName: "System"
 *         role: "admin"
 *         isActive: true
 *         lastLogin: "2024-01-01T12:00:00.000Z"
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 *     UserCreate:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Contraseña del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         role:
 *           type: string
 *           enum: [user, admin, dev]
 *           description: Rol del usuario
 *       example:
 *         email: "nuevo@inventory.com"
 *         password: "password123"
 *         firstName: "Nuevo"
 *         lastName: "Usuario"
 *         role: "user"
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuarios con filtros
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, dev]
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de usuarios filtrada exitosamente
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/search", [authenticateToken, authorize("admin", "dev")], async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const { search, role, isActive } = req.query

    const where = {}

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive === "true"

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, rows, pagination)
  } catch (error) {
    errorResponse(res, "Error al buscar usuarios")
  }
})

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, dev]
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/", [authenticateToken, authorize("admin", "dev")], async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const { search, role, isActive } = req.query

    const where = {}

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive === "true"

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: ActivityLog,
          as: "activities",
          attributes: ["id"],
          required: false,
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })

    const usersWithActivityCount = rows.map((user) => ({
      ...user.toJSON(),
      activityCount: user.activities ? user.activities.length : 0,
    }))

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, usersWithActivityCount, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener usuarios")
  }
})

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/:id",
  [authenticateToken, authorize("admin", "dev"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: ActivityLog,
            as: "activities",
            limit: 10,
            order: [["createdAt", "DESC"]],
          },
        ],
      })

      if (!user) {
        return errorResponse(res, "Usuario no encontrado", 404)
      }

      successResponse(res, user)
    } catch (error) {
      errorResponse(res, "Error al obtener usuario")
    }
  },
)

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *       400:
 *         description: Error de validación
 */
router.post(
  "/",
  [
    authenticateToken,
    authorize("admin", "dev"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("Password debe tener al menos 6 caracteres"),
    body("firstName").notEmpty().withMessage("Nombre requerido"),
    body("lastName").notEmpty().withMessage("Apellido requerido"),
    body("role").isIn(["user", "admin", "dev"]).withMessage("Rol inválido"),
  ],
  handleValidationErrors,
  logActivity("CREATE", "USER"),
  async (req, res) => {
    try {
      const user = await User.create(req.body)
      const { password, ...userWithoutPassword } = user.toJSON()
      successResponse(res, userWithoutPassword, "Usuario creado exitosamente", 201)
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe un usuario con ese email", 400)
      }
      errorResponse(res, "Error al crear usuario")
    }
  },
)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña (opcional)
 *               firstName:
 *                 type: string
 *                 description: Nombre del usuario
 *               lastName:
 *                 type: string
 *                 description: Apellido del usuario
 *               role:
 *                 type: string
 *                 enum: [user, admin, dev]
 *                 description: Rol del usuario
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo/inactivo
 *             example:
 *               firstName: "Nombre Actualizado"
 *               lastName: "Apellido Actualizado"
 *               role: "admin"
 *               isActive: true
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  "/:id",
  [
    authenticateToken,
    authorize("admin", "dev"),
    param("id").isInt().withMessage("ID debe ser un número"),
    body("email").optional().isEmail().withMessage("Email inválido"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password debe tener al menos 6 caracteres"),
    body("firstName").optional().notEmpty().withMessage("Nombre no puede estar vacío"),
    body("lastName").optional().notEmpty().withMessage("Apellido no puede estar vacío"),
    body("role").optional().isIn(["user", "admin", "dev"]).withMessage("Rol inválido"),
    body("isActive").optional().isBoolean().withMessage("isActive debe ser boolean"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "USER"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id)

      if (!user) {
        return errorResponse(res, "Usuario no encontrado", 404)
      }

      // Prevent users from modifying themselves
      if (user.id === req.user.id && req.body.hasOwnProperty("isActive")) {
        return errorResponse(res, "No puedes desactivar tu propia cuenta", 403)
      }

      await user.update(req.body)
      const { password, ...userWithoutPassword } = user.toJSON()
      successResponse(res, userWithoutPassword, "Usuario actualizado exitosamente")
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe un usuario con ese email", 400)
      }
      errorResponse(res, "Error al actualizar usuario")
    }
  },
)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: No se puede eliminar a sí mismo
 */
router.delete(
  "/:id",
  [authenticateToken, authorize("dev"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  logActivity("DELETE", "USER"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id)

      if (!user) {
        return errorResponse(res, "Usuario no encontrado", 404)
      }

      // Prevent users from deleting themselves
      if (user.id === req.user.id) {
        return errorResponse(res, "No puedes eliminar tu propia cuenta", 403)
      }

      await user.update({ isActive: false })
      successResponse(res, null, "Usuario eliminado exitosamente")
    } catch (error) {
      errorResponse(res, "Error al eliminar usuario")
    }
  },
)

module.exports = router
