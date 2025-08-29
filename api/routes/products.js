const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, checkPermission } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { handleValidationErrors } = require("../helpers/validationHelper")
const upload = require("../middleware/upload")
const { getAll, getById, create, update, remove } = require("../controllers/productsController")

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
router.get("/", authenticateToken, getAll)

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
router.get("/:id", authenticateToken, getById)

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
    upload.single("imagen"),
    body("code").notEmpty().withMessage("Código requerido"),
    body("name").notEmpty().withMessage("Nombre requerido"),
    body("price").isFloat({ min: 0 }).withMessage("Precio debe ser mayor a 0"),
    body("status").isIn(["disponible", "nuevo", "oferta", "agotado"]).withMessage("Estado inválido"),
    body("brandId").isInt().withMessage("Marca requerida"),
    body("categoryId").isInt().withMessage("Categoría requerida"),
  ],
  handleValidationErrors,
  logActivity("CREATE", "PRODUCT"),
  create,
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
    upload.single("imagen"),
    body("code").optional().notEmpty().withMessage("Código no puede estar vacío"),
    body("name").optional().notEmpty().withMessage("Nombre no puede estar vacío"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Precio debe ser mayor a 0"),
    body("status").optional().isIn(["disponible", "nuevo", "oferta", "agotado"]).withMessage("Estado inválido"),
    body("brandId").optional().isInt().withMessage("Marca requerida"),
    body("categoryId").optional().isInt().withMessage("Categoría requerida"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "PRODUCT"),
  update,
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
router.delete("/:id", [authenticateToken, checkPermission("products", "delete")], logActivity("DELETE", "PRODUCT"), remove)

module.exports = router
