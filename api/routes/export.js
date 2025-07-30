const express = require("express")
const PDFDocument = require("pdfkit")
const ExcelJS = require("exceljs")
const { Product, Brand, Category } = require("../models")
const { authenticateToken } = require("../middleware/auth")
const { Op } = require("sequelize")

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
router.get("/products/pdf", authenticateToken, async (req, res) => {
  try {
    const { search, status, brandId, categoryId } = req.query
    const where = { isActive: true }

    // Aplicar filtros
    if (search) {
      where[Op.or] = [{ code: { [Op.like]: `%${search}%` } }, { name: { [Op.like]: `%${search}%` } }]
    }
    if (status) where.status = status
    if (brandId) where.brandId = brandId
    if (categoryId) where.categoryId = categoryId

    const products = await Product.findAll({
      where,
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 })

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=productos_${new Date().toISOString().slice(0, 10)}.pdf`)

    // Pipe del documento a la respuesta
    doc.pipe(res)

    // Título del documento
    doc.fontSize(20).text("Reporte de Productos", { align: "center" })
    doc.moveDown()

    // Información del reporte
    doc.fontSize(12)
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`)
    doc.text(`Total de productos: ${products.length}`)
    doc.moveDown()

    // Estadísticas
    const stats = {
      disponible: products.filter((p) => p.status === "disponible").length,
      nuevo: products.filter((p) => p.status === "nuevo").length,
      oferta: products.filter((p) => p.status === "oferta").length,
      agotado: products.filter((p) => p.status === "agotado").length,
    }

    doc.text("Estadísticas por estado:")
    Object.entries(stats).forEach(([status, count]) => {
      doc.text(`  • ${status}: ${count} productos`)
    })
    doc.moveDown()

    // Tabla de productos
    doc.text("Lista de Productos:", { underline: true })
    doc.moveDown()

    let yPosition = doc.y
    const pageHeight = doc.page.height - 100

    products.forEach((product, index) => {
      // Verificar si necesitamos una nueva página
      if (yPosition > pageHeight) {
        doc.addPage()
        yPosition = 50
      }

      doc.fontSize(10)
      doc.text(`${index + 1}. ${product.code} - ${product.name}`, 50, yPosition)
      yPosition += 15

      doc.text(
        `   Marca: ${product.brand?.name || "N/A"} | Categoría: ${product.category?.name || "N/A"}`,
        50,
        yPosition,
      )
      yPosition += 12

      doc.text(`   Estado: ${product.status} | Precio: $${product.price}`, 50, yPosition)
      yPosition += 20
    })

    // Finalizar documento
    doc.end()
  } catch (error) {
    console.error("Error generating PDF:", error)
    res.status(500).json({ message: "Error al generar PDF" })
  }
})

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
router.get("/products/excel", authenticateToken, async (req, res) => {
  try {
    const { search, status, brandId, categoryId } = req.query
    const where = { isActive: true }

    // Aplicar filtros
    if (search) {
      where[Op.or] = [{ code: { [Op.like]: `%${search}%` } }, { name: { [Op.like]: `%${search}%` } }]
    }
    if (status) where.status = status
    if (brandId) where.brandId = brandId
    if (categoryId) where.categoryId = categoryId

    const products = await Product.findAll({
      where,
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Crear libro de trabajo
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Productos")

    // Configurar columnas
    worksheet.columns = [
      { header: "Código", key: "code", width: 15 },
      { header: "Nombre", key: "name", width: 40 },
      { header: "Descripción", key: "description", width: 50 },
      { header: "Marca", key: "brand", width: 20 },
      { header: "Categoría", key: "category", width: 20 },
      { header: "Estado", key: "status", width: 15 },
      { header: "Precio", key: "price", width: 12 },
      { header: "Fecha Creación", key: "createdAt", width: 15 },
    ]

    // Estilo del header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2980B9" },
    }
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true }

    // Agregar datos
    products.forEach((product) => {
      worksheet.addRow({
        code: product.code,
        name: product.name,
        description: product.description || "Sin descripción",
        brand: product.brand?.name || "N/A",
        category: product.category?.name || "N/A",
        status: product.status,
        price: Number.parseFloat(product.price),
        createdAt: new Date(product.createdAt).toLocaleDateString("es-ES"),
      })
    })

    // Configurar formato de precio
    worksheet.getColumn("price").numFmt = '"$"#,##0.00'

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename=productos_${new Date().toISOString().slice(0, 10)}.xlsx`)

    // Enviar archivo
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error generating Excel:", error)
    res.status(500).json({ message: "Error al generar Excel" })
  }
})

module.exports = router
