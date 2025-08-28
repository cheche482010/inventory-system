const express = require("express")
const { param } = require("express-validator")
const { authenticateToken, authorize } = require("../middleware/auth")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { getAll, getById, getStats } = require("../controllers/activitiesController")

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
router.get("/", [authenticateToken, authorize("admin", "dev")], getAll)

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
  getById,
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
router.get("/stats", [authenticateToken, authorize("admin", "dev")], getStats)

module.exports = router
