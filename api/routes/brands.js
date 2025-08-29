const express = require("express")
const { body, param } = require("express-validator")
const { authenticateToken, checkPermission } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { getAll, getAllBrands, getById, create, update, remove } = require("../controllers/brandsController")

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la marca
 *         name:
 *           type: string
 *           description: Nombre de la marca
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
 *         name: "TENKEI"
 *         isActive: true
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Obtener todas las marcas
 *     tags: [Brands]
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
 *         description: Lista de marcas obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Brand'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/", authenticateToken, getAll)

/**
 * @swagger
 * /brands/all:
 *   get:
 *     summary: Obtener todas las marcas (sin paginación)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las marcas
 */
router.get("/all", authenticateToken, getAllBrands)

/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     summary: Obtener marca por ID
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Marca encontrada
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
 *                   $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Marca no encontrada
 */
router.get(
  "/:id",
  [authenticateToken, param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  getById,
)

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Crear nueva marca
 *     tags: [Brands]
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
 *                 description: Nombre de la marca
 *             example:
 *               name: "Nueva Marca"
 *     responses:
 *       201:
 *         description: Marca creada exitosamente
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
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Error de validación
 */
router.post(
  "/",
  [authenticateToken, checkPermission("brands", "create"), body("name").notEmpty().withMessage("Nombre requerido")],
  handleValidationErrors,
  logActivity("CREATE", "BRAND"),
  create,
)

/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Actualizar marca
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la marca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la marca
 *             example:
 *               name: "Marca Actualizada"
 *     responses:
 *       200:
 *         description: Marca actualizada exitosamente
 *       404:
 *         description: Marca no encontrada
 */
router.put(
  "/:id",
  [
    authenticateToken,
    checkPermission("brands", "update"),
    param("id").isInt().withMessage("ID debe ser un número"),
    body("name").notEmpty().withMessage("Nombre requerido"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "BRAND"),
  update,
)

/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     summary: Eliminar marca (soft delete)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Marca eliminada exitosamente
 *       404:
 *         description: Marca no encontrada
 *       403:
 *         description: No se puede eliminar marca con productos asociados
 */
router.delete(
  "/:id",
  [authenticateToken, checkPermission("brands", "delete"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  logActivity("DELETE", "BRAND"),
  remove,
)

module.exports = router
