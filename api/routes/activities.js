const express = require("express")
const { query, param } = require("express-validator")
const { ActivityLog, User } = require("../models")
const { authenticateToken, authorize } = require("../middleware/auth")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { Op } = require("sequelize")

const router = express.Router()

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Obtener bitácora de actividades del sistema
 *     tags: [Activities]
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
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *         description: Filtrar por tipo de acción
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *           enum: [PRODUCT, BRAND, CATEGORY, USER]
 *         description: Filtrar por tipo de recurso
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de actividades obtenida exitosamente
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
 *                     $ref: '#/components/schemas/ActivityLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Permisos insuficientes
 */
router.get("/", [authenticateToken, authorize("admin", "dev")], async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { action, resource, userId, dateFrom, dateTo } = req.query

    const where = {}

    if (action) where.action = action
    if (resource) where.resource = resource
    if (userId) where.userId = userId

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom)
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo + " 23:59:59")
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
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
    errorResponse(res, "Error al obtener actividades")
  }
})

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Obtener actividad específica por ID
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad encontrada
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
 *                   $ref: '#/components/schemas/ActivityLog'
 *       404:
 *         description: Actividad no encontrada
 *       403:
 *         description: Permisos insuficientes
 */
router.get(
  "/:id",
  [authenticateToken, authorize("admin", "dev"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const activity = await ActivityLog.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "role"],
          },
        ],
      })

      if (!activity) {
        return errorResponse(res, "Actividad no encontrada", 404)
      }

      successResponse(res, activity)
    } catch (error) {
      errorResponse(res, "Error al obtener actividad")
    }
  },
)

/**
 * @swagger
 * /activities/stats:
 *   get:
 *     summary: Obtener estadísticas de actividades
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de días hacia atrás para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     totalActivities:
 *                       type: integer
 *                     byAction:
 *                       type: object
 *                     byResource:
 *                       type: object
 *                     byUser:
 *                       type: array
 *                     dailyActivity:
 *                       type: array
 */
router.get("/stats", [authenticateToken, authorize("admin", "dev")], async (req, res) => {
  try {
    const days = Number.parseInt(req.query.days) || 30
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const activities = await ActivityLog.findAll({
      where: {
        createdAt: {
          [Op.gte]: dateFrom,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      byAction: {},
      byResource: {},
      byUser: {},
      dailyActivity: [],
    }

    // Group by action
    activities.forEach((activity) => {
      stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1
      stats.byResource[activity.resource] = (stats.byResource[activity.resource] || 0) + 1

      const userKey = `${activity.user?.firstName} ${activity.user?.lastName}`
      stats.byUser[userKey] = (stats.byUser[userKey] || 0) + 1
    })

    // Group by day
    const dailyGroups = {}
    activities.forEach((activity) => {
      const day = activity.createdAt.toISOString().split("T")[0]
      dailyGroups[day] = (dailyGroups[day] || 0) + 1
    })

    stats.dailyActivity = Object.entries(dailyGroups)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    successResponse(res, stats, "Estadísticas obtenidas exitosamente")
  } catch (error) {
    errorResponse(res, "Error al obtener estadísticas")
  }
})

module.exports = router
