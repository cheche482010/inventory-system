const express = require("express")
const { body, param } = require("express-validator")
const { authenticateToken, checkPermission } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { getAll, getAllCategories, getById, create, update, remove } = require("../controllers/categoriesController")

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la categoría
 *         name:
 *           type: string
 *           description: Nombre de la categoría
 *         description:
 *           type: string
 *           description: Descripción de la categoría
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
 *         name: "ALTERNADORES"
 *         description: "Alternadores para vehículos"
 *         isActive: true
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categories]
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
 *         description: Buscar por nombre
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Category'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/", authenticateToken, getAll)

/**
 * @swagger
 * /categories/all:
 *   get:
 *     summary: Obtener todas las categorías (sin paginación)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las categorías
 */
router.get("/all", authenticateToken, getAllCategories)

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
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
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoría no encontrada
 */
router.get(
  "/:id",
  [authenticateToken, param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  getById,
)

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear nueva categoría
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *               description:
 *                 type: string
 *                 description: Descripción de la categoría
 *             example:
 *               name: "Nueva Categoría"
 *               description: "Descripción de la nueva categoría"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
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
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Error de validación
 */
router.post(
  "/",
  [authenticateToken, checkPermission("categories", "create"), body("name").notEmpty().withMessage("Nombre requerido")],
  handleValidationErrors,
  logActivity("CREATE", "CATEGORY"),
  create,
)

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *               description:
 *                 type: string
 *                 description: Descripción de la categoría
 *             example:
 *               name: "Categoría Actualizada"
 *               description: "Nueva descripción"
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       404:
 *         description: Categoría no encontrada
 */
router.put(
  "/:id",
  [
    authenticateToken,
    checkPermission("categories", "update"),
    param("id").isInt().withMessage("ID debe ser un número"),
    body("name").notEmpty().withMessage("Nombre requerido"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "CATEGORY"),
  update,
)

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar categoría (soft delete)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *       404:
 *         description: Categoría no encontrada
 *       403:
 *         description: No se puede eliminar categoría con productos asociados
 */
router.delete(
  "/:id",
  [authenticateToken, checkPermission("categories", "delete"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  logActivity("DELETE", "CATEGORY"),
  remove,
)

module.exports = router
