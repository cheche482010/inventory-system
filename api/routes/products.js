const express = require("express")
const { body, query } = require("express-validator")
const { Product, Brand, Category } = require("../models")
const { authenticateToken, authorize, checkPermission } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { Op } = require("sequelize")
const upload = require("../middleware/upload")
const fs = require("fs")
const path = require("path")

const router = express.Router()

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener productos con paginación y filtros
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por código o nombre
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *         description: Filtrar por marca
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = req.query.limit === 'all' ? null : (Number.parseInt(req.query.limit) || 10)
    const offset = limit ? (page - 1) * limit : 0
    const { search, status, brandId, categoryId, sortBy, sortOrder } = req.query

    const where = { isActive: true }

    if (search) {
      where[Op.or] = [{ code: { [Op.like]: `%${search}%` } }, { name: { [Op.like]: `%${search}%` } }]
    }

    if (status) where.status = status
    if (brandId) where.brandId = brandId
    if (categoryId) where.categoryId = categoryId

    let order = [["name", "ASC"]]
    if (sortBy && sortOrder) {
      if (sortBy === 'brand.name') {
        order = [[{ model: Brand, as: 'brand' }, 'name', sortOrder]]
      } else if (sortBy === 'category.name') {
        order = [[{ model: Category, as: 'category' }, 'name', sortOrder]]
      } else {
        order = [[sortBy, sortOrder]]
      }
    }

    const queryOptions = {
      where,
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
      order,
    }

    if (limit) {
      queryOptions.limit = limit
      queryOptions.offset = offset
    }

    const { count, rows } = await Product.findAndCountAll(queryOptions)

    const pagination = {
      currentPage: page,
      totalPages: limit ? Math.ceil(count / limit) : 1,
      totalItems: count,
      itemsPerPage: limit || count,
    }

    paginatedResponse(res, rows, pagination)
  } catch (error) {
    console.log(error)
    errorResponse(res, "Error al obtener productos")
  }
})

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
    })

    if (!product) {
      return errorResponse(res, "Producto no encontrado", 404)
    }

    successResponse(res, product)
  } catch (error) {
    errorResponse(res, "Error al obtener producto")
  }
})

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *               brandId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post(
  "/",
  [
    authenticateToken,
    checkPermission("products", "create"),
    upload.single("imagen"), // Multer middleware for single file upload
    body("code").notEmpty().withMessage("Código requerido"),
    body("name").notEmpty().withMessage("Nombre requerido"),
    body("price").isFloat({ min: 0 }).withMessage("Precio debe ser mayor a 0"),
    body("status").isIn(["disponible", "nuevo", "oferta", "agotado"]).withMessage("Estado inválido"),
    body("brandId").isInt().withMessage("Marca requerida"),
    body("categoryId").isInt().withMessage("Categoría requerida"),
  ],
  handleValidationErrors,
  logActivity("CREATE", "PRODUCT"),
  async (req, res) => {
    try {
      const productData = { ...req.body }
      if (req.file) {
        // Guardar solo la ruta relativa
        productData.imagen = `products/${req.file.filename}`
      }

      const product = await Product.create(productData)
      const productWithRelations = await Product.findByPk(product.id, {
        include: [
          { model: Brand, as: "brand" },
          { model: Category, as: "category" },
        ],
      })

      successResponse(res, productWithRelations, "Producto creado exitosamente", 201)
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "El código del producto ya existe", 400)
      }
      errorResponse(res, "Error al crear producto")
    }
  },
)

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put(
  "/:id",
  [
    authenticateToken,
    checkPermission("products", "update"),
    upload.single("imagen"), // Multer middleware for single file upload
    body("code").optional().notEmpty().withMessage("Código no puede estar vacío"),
    body("name").optional().notEmpty().withMessage("Nombre no puede estar vacío"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Precio debe ser mayor a 0"),
    body("status").optional().isIn(["disponible", "nuevo", "oferta", "agotado"]).withMessage("Estado inválido"),
    body("brandId").optional().isInt().withMessage("Marca requerida"),
    body("categoryId").optional().isInt().withMessage("Categoría requerida"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "PRODUCT"),
  async (req, res) => {
    try {
      const product = await Product.findOne({
        where: { id: req.params.id, isActive: true },
      })

      if (!product) {
        return errorResponse(res, "Producto no encontrado", 404)
      }

      const productData = { ...req.body }

      if (req.file) {
        // Si se sube una nueva imagen, eliminar la anterior si existe
        if (product.imagen) {
          const oldImagePath = path.join(__dirname, "..", "uploads", product.imagen)
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath)
          }
        }
        productData.imagen = `products/${req.file.filename}`
      }

      await product.update(productData)

      const updatedProduct = await Product.findByPk(product.id, {
        include: [
          { model: Brand, as: "brand" },
          { model: Category, as: "category" },
        ],
      })

      successResponse(res, updatedProduct, "Producto actualizado exitosamente")
    } catch (error) {
      errorResponse(res, "Error al actualizar producto")
    }
  },
)

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar producto (soft delete)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
router.delete("/:id", [authenticateToken, checkPermission("products", "delete")], logActivity("DELETE", "PRODUCT"), async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
    })

    if (!product) {
      return errorResponse(res, "Producto no encontrado", 404)
    }

    await product.update({ isActive: false })
    successResponse(res, null, "Producto eliminado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al eliminar producto")
  }
})

module.exports = router
