const express = require("express")
const { body, param } = require("express-validator")
const { Permission, User } = require("../models")
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
 *     Permission:
 *       type: object
 *       required:
 *         - name
 *         - resource
 *         - action
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del permiso
 *         name:
 *           type: string
 *           description: Nombre del permiso
 *         description:
 *           type: string
 *           description: Descripción del permiso
 *         resource:
 *           type: string
 *           description: Recurso al que aplica el permiso
 *         action:
 *           type: string
 *           description: Acción permitida
 *         isActive:
 *           type: boolean
 *           description: Estado activo/inactivo
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
 *         name: "products:read"
 *         description: "Ver productos"
 *         resource: "products"
 *         action: "read"
 *         isActive: true
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Obtener todos los permisos
 *     tags: [Permissions]
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
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o descripción
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filtrar por recurso
 *     responses:
 *       200:
 *         description: Lista de permisos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Permission'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/", [authenticateToken, authorize("dev")], async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { search, resource } = req.query

    const where = { isActive: true }

    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }

    if (resource) where.resource = resource

    const { count, rows } = await Permission.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["resource", "ASC"],
        ["action", "ASC"],
      ],
    })

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, rows, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener permisos")
  }
})

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Crear nuevo permiso
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - resource
 *               - action
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del permiso
 *               description:
 *                 type: string
 *                 description: Descripción del permiso
 *               resource:
 *                 type: string
 *                 description: Recurso al que aplica
 *               action:
 *                 type: string
 *                 description: Acción permitida
 *             example:
 *               name: "reports:read"
 *               description: "Ver reportes"
 *               resource: "reports"
 *               action: "read"
 *     responses:
 *       201:
 *         description: Permiso creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post(
  "/",
  [
    authenticateToken,
    authorize("dev"),
    body("name").notEmpty().withMessage("Nombre requerido"),
    body("resource").notEmpty().withMessage("Recurso requerido"),
    body("action").notEmpty().withMessage("Acción requerida"),
  ],
  handleValidationErrors,
  logActivity("CREATE", "PERMISSION"),
  async (req, res) => {
    try {
      const permission = await Permission.create(req.body)
      successResponse(res, permission, "Permiso creado exitosamente", 201)
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe un permiso con ese nombre", 400)
      }
      errorResponse(res, "Error al crear permiso")
    }
  },
)

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Actualizar permiso
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del permiso
 *     responses:
 *       200:
 *         description: Permiso actualizado exitosamente
 *       404:
 *         description: Permiso no encontrado
 */
router.put(
  "/:id",
  [
    authenticateToken,
    authorize("dev"),
    param("id").isInt().withMessage("ID debe ser un número"),
    body("name").optional().notEmpty().withMessage("Nombre no puede estar vacío"),
    body("resource").optional().notEmpty().withMessage("Recurso no puede estar vacío"),
    body("action").optional().notEmpty().withMessage("Acción no puede estar vacía"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "PERMISSION"),
  async (req, res) => {
    try {
      const permission = await Permission.findOne({
        where: { id: req.params.id, isActive: true },
      })

      if (!permission) {
        return errorResponse(res, "Permiso no encontrado", 404)
      }

      await permission.update(req.body)
      successResponse(res, permission, "Permiso actualizado exitosamente")
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe un permiso con ese nombre", 400)
      }
      errorResponse(res, "Error al actualizar permiso")
    }
  },
)

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Eliminar permiso (soft delete)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del permiso
 *     responses:
 *       200:
 *         description: Permiso eliminado exitosamente
 *       404:
 *         description: Permiso no encontrado
 */
router.delete(
  "/:id",
  [authenticateToken, authorize("dev"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  logActivity("DELETE", "PERMISSION"),
  async (req, res) => {
    try {
      const permission = await Permission.findOne({
        where: { id: req.params.id, isActive: true },
      })

      if (!permission) {
        return errorResponse(res, "Permiso no encontrado", 404)
      }

      await permission.update({ isActive: false })
      successResponse(res, null, "Permiso eliminado exitosamente")
    } catch (error) {
      errorResponse(res, "Error al eliminar permiso")
    }
  },
)

/**
 * @swagger
 * /permissions/user/{userId}:
 *   get:
 *     summary: Obtener permisos de un usuario específico
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Permisos del usuario obtenidos exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/user/:userId",
  [authenticateToken, authorize("dev"), param("userId").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.userId, {
        include: [
          {
            model: Permission,
            as: "permissions",
            where: { isActive: true },
            required: false,
          },
        ],
      })

      if (!user) {
        return errorResponse(res, "Usuario no encontrado", 404)
      }

      successResponse(res, user.permissions, "Permisos del usuario obtenidos exitosamente")
    } catch (error) {
      errorResponse(res, "Error al obtener permisos del usuario")
    }
  },
)

module.exports = router
