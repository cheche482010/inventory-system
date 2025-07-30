const express = require("express")
const { body, param } = require("express-validator")
const { Brand, Product } = require("../models")
const { authenticateToken, authorize, checkPermission } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { Op } = require("sequelize")

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
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const { search } = req.query

    const where = { isActive: true }

    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }

    const { count, rows } = await Brand.findAndCountAll({
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
      order: [["id", "ASC"]],
    })

    const brandsWithProductCount = rows.map((brand) => ({
      ...brand.toJSON(),
      productCount: brand.products ? brand.products.length : 0,
    }))

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, brandsWithProductCount, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener marcas")
  }
})

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
  async (req, res) => {
    try {
      const brand = await Brand.findOne({
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

      if (!brand) {
        return errorResponse(res, "Marca no encontrada", 404)
      }

      successResponse(res, brand)
    } catch (error) {
      errorResponse(res, "Error al obtener marca")
    }
  },
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
  async (req, res) => {
    try {
      const brand = await Brand.create(req.body)
      successResponse(res, brand, "Marca creada exitosamente", 201)
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe una marca con ese nombre", 400)
      }
      errorResponse(res, "Error al crear marca")
    }
  },
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
  async (req, res) => {
    try {
      const brand = await Brand.findOne({
        where: { id: req.params.id, isActive: true },
      })

      if (!brand) {
        return errorResponse(res, "Marca no encontrada", 404)
      }

      await brand.update(req.body)
      successResponse(res, brand, "Marca actualizada exitosamente")
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Ya existe una marca con ese nombre", 400)
      }
      errorResponse(res, "Error al actualizar marca")
    }
  },
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
  async (req, res) => {
    try {
      const brand = await Brand.findOne({
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

      if (!brand) {
        return errorResponse(res, "Marca no encontrada", 404)
      }

      // Check if brand has active products
      if (brand.products && brand.products.length > 0) {
        return errorResponse(res, "No se puede eliminar una marca con productos asociados", 403)
      }

      await brand.update({ isActive: false })
      successResponse(res, null, "Marca eliminada exitosamente")
    } catch (error) {
      errorResponse(res, "Error al eliminar marca")
    }
  },
)

module.exports = router
