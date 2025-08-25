const express = require("express");
const ExcelJS = require("exceljs");
const { authenticateToken, authorize } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../helpers/responseHelper");
const { Cart, CartItem, Product, User } = require("../models");

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Obtener todas las solicitudes de presupuesto (submitted)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes de presupuesto
 */
router.get("/", authorize('admin', 'dev'), async (req, res) => {
    try {
        const budgets = await Cart.findAll({
            where: {
                status: 'submitted'
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
            ],
            order: [['updatedAt', 'DESC']]
        });
        successResponse(res, budgets);
    } catch (error) {
        errorResponse(res, "Error al obtener las solicitudes de presupuesto");
    }
});

/**
 * @swagger
 * /budgets/my:
 *   get:
 *     summary: Obtener mis solicitudes de presupuesto
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis solicitudes de presupuesto
 */
router.get("/my", async (req, res) => {
    try {
        const budgets = await Cart.findAll({
            where: {
                userId: req.user.id,
                status: 'submitted'
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
            ],
            order: [['updatedAt', 'ASC']]
        });
        successResponse(res, budgets);
    } catch (error) {
        errorResponse(res, "Error al obtener tus solicitudes de presupuesto");
    }
});


/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     summary: Obtener un presupuesto por ID
 *     tags: [Budgets]
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
 *         description: Datos del presupuesto
 */
router.get("/:id", async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
            ]
        });

        if (!cart) {
            return errorResponse(res, "Presupuesto no encontrado", 404);
        }

        // Permission check
        const isOwner = cart.userId === req.user.id;
        const isAdminOrDev = ['admin', 'dev'].includes(req.user.role);

        if (!isOwner && !isAdminOrDev) {
            return errorResponse(res, "Permisos insuficientes", 403);
        }

        successResponse(res, cart);

    } catch (error) {
        console.error("Error al obtener el presupuesto:", error);
        errorResponse(res, "Error al obtener el presupuesto");
    }
});


/**
 * @swagger
 * /budgets/{id}/download-excel:
 *   get:
 *     summary: Descargar un presupuesto como archivo Excel
 *     tags: [Budgets]
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
 *         description: Archivo Excel del presupuesto
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/:id/download-excel", authorize('admin', 'dev'), async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!cart) {
            return errorResponse(res, "Presupuesto no encontrado", 404);
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Presupuesto ${cart.id}`);

        // Header
        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').value = `Presupuesto #${cart.id}`;
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.getCell('A1').font = { size: 16, bold: true };

        // User Info
        worksheet.mergeCells('A2:E2');
        worksheet.getCell('A2').value = `Cliente: ${cart.user.firstName} ${cart.user.lastName} (${cart.user.email})`;
        worksheet.mergeCells('A3:E3');
        worksheet.getCell('A3').value = `Fecha: ${new Date(cart.updatedAt).toLocaleDateString()}`;

        worksheet.addRow([]); // Empty row for spacing

        // Table Header
        worksheet.addRow(['Código', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']);
        worksheet.getRow(6).font = { bold: true };
        worksheet.getRow(6).eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' }
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        });


        // Table Data
        cart.items.forEach(item => {
            worksheet.addRow([
                item.product.code,
                item.product.name,
                item.quantity,
                item.price,
                item.quantity * item.price
            ]);
        });

        // Add total row
        const total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        worksheet.addRow([]);
        const totalRow = worksheet.addRow(['', '', '', 'Total:', total]);
        totalRow.font = { bold: true };
        worksheet.getCell(`D${totalRow.number}`).alignment = { horizontal: 'right' };


        // Set column widths
        worksheet.getColumn('A').width = 20;
        worksheet.getColumn('B').width = 40;
        worksheet.getColumn('C').width = 15;
        worksheet.getColumn('D').width = 20;
        worksheet.getColumn('E').width = 20;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${cart.id}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error al generar el Excel:", error);
        errorResponse(res, "Error al generar el archivo Excel");
    }
});

module.exports = router;
