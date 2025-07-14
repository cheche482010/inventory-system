const express = require("express")
const { body, param } = require("express-validator")
const { Category, Product } = require("../models")
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
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const { search } = req.query

    const where = { isActive: true }

    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id"],
          where: { isActive: true },
          required: false,
        },
      ],
      limit,
      offset,
      order: [["name", "ASC"]],
    })

    const categoriesWithProductCount = rows.map((category) => ({
      ...category.toJSON(),
      productCount: category.products ? category.products.length : 0,
    }))

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, categoriesWithProductCount, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener categorías")
  }
})

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
  async (req, res) => {
    try {
      const category = await Category.findOne({
        where: { id: req.params.id, isActive: true },
        include: [
          {
            model: Product,
            as: "products",
            attributes: ["id", "code", "name", "price", "status"],
            where: { isActive: true },
            required: false,
          },
        ],
      })

      if (!category) {
        return errorResponse(res, "Categoría no encontrada", 404)
      }

      successResponse(res, category)
    } catch (error) {
      errorResponse(res, "Error al obtener categoría")
    }
  },
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
  [authenticateToken, authorize("admin", "dev"), body("name").notEmpty().withMessage("Nombre requerido")],
  handleValidationErrors,
  logActivity("CREATE", "CATEGORY"),
  async (req, res) => {
    try {
      const category = await Category.create(req.body)
      successResponse(res, category, "Categoría creada exitosamente", 201)
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe una categoría con ese nombre", 400)
      }
      errorResponse(res, "Error al crear categoría")
    }
  },
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
    authorize("admin", "dev"),
    param("id").isInt().withMessage("ID debe ser un número"),
    body("name").notEmpty().withMessage("Nombre requerido"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "CATEGORY"),
  async (req, res) => {
    try {
      const category = await Category.findOne({
        where: { id: req.params.id, isActive: true },
      })

      if (!category) {
        return errorResponse(res, "Categoría no encontrada", 404)
      }

      await category.update(req.body)
      successResponse(res, category, "Categoría actualizada exitosamente")
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe una categoría con ese nombre", 400)
      }
      errorResponse(res, "Error al actualizar categoría")
    }
  },
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
  [authenticateToken, authorize("dev"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  logActivity("DELETE", "CATEGORY"),
  async (req, res) => {
    try {
      const category = await Category.findOne({
        where: { id: req.params.id, isActive: true },
        include: [
          {
            model: Product,
            as: "products",
            where: { isActive: true },
            required: false,
          },
        ],
      })

      if (!category) {
        return errorResponse(res, "Categoría no encontrada", 404)
      }

      // Check if category has active products
      if (category.products && category.products.length > 0) {
        return errorResponse(res, "No se puede eliminar una categoría con productos asociados", 403)
      }

      await category.update({ isActive: false })
      successResponse(res, null, "Categoría eliminada exitosamente")
    } catch (error) {
      errorResponse(res, "Error al eliminar categoría")
    }
  },
)

module.exports = router
