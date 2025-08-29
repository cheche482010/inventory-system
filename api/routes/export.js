const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const { exportToPDF, exportToExcel } = require("../controllers/exportController")

const router = express.Router()

/**
 * @swagger
 * /export/products/pdf:
 *   get:
 *     summary: Exportar productos a PDF
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Archivo PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/products/pdf", authenticateToken, exportToPDF)

/**
 * @swagger
 * /export/products/excel:
 *   get:
 *     summary: Exportar productos a Excel
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Archivo Excel generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/products/excel", authenticateToken, exportToExcel)

module.exports = router
