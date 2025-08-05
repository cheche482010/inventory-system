const express = require("express");
const { authenticateToken, authorize } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../helpers/responseHelper");
const { sendBudgetEmail } = require("../helpers/mailHelper");
const { Cart, CartItem, Product, User, Notification } = require("../models");
const { Op } = require("sequelize");
const PDFDocument = require('pdfkit');

const router = express.Router();

// All routes in this file are for admins/devs only
router.use(authenticateToken, authorize('admin', 'dev'));

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
router.get("/", async (req, res) => {
    try {
        const budgets = await Cart.findAll({
            where: {
                status: {
                    [Op.in]: ['submitted', 'approved', 'rejected']
                }
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
 * /budgets/{id}/approve:
 *   put:
 *     summary: Aprobar una solicitud de presupuesto
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
 *         description: Presupuesto aprobado
 */
router.put("/:id/approve", async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { id: req.params.id, status: 'submitted' },
            include: [
                { model: User, as: 'user' },
                { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
            ]
        });

        if (!cart) {
            return errorResponse(res, "Solicitud de presupuesto no encontrada o ya procesada", 404);
        }

        cart.status = 'approved';
        await cart.save();

        // Notify user
        const message = `Tu solicitud de presupuesto #${cart.id} ha sido aprobada.`;
        await Notification.create({ userId: cart.userId, message, type: 'budget_approved' });

        // Send email
        await sendBudgetEmail(cart.user, cart);

        successResponse(res, cart, "Presupuesto aprobado y email enviado");
    } catch (error) {
        console.error(error);
        errorResponse(res, "Error al aprobar el presupuesto");
    }
});

/**
 * @swagger
 * /budgets/{id}/reject:
 *   put:
 *     summary: Rechazar una solicitud de presupuesto
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
 *         description: Presupuesto rechazado
 */
router.put("/:id/reject", async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { id: req.params.id, status: 'submitted' } });

        if (!cart) {
            return errorResponse(res, "Solicitud de presupuesto no encontrada o ya procesada", 404);
        }

        cart.status = 'rejected';
        await cart.save();

        // Notify user
        const message = `Tu solicitud de presupuesto #${cart.id} ha sido rechazada.`;
        await Notification.create({ userId: cart.userId, message, type: 'budget_rejected' });

        successResponse(res, cart, "Presupuesto rechazado");
    } catch (error) {
        errorResponse(res, "Error al rechazar el presupuesto");
    }
});

/**
 * @swagger
 * /budgets/{id}/pdf:
 *   get:
 *     summary: Descargar un presupuesto en PDF
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
 *         description: Archivo PDF del presupuesto
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/:id/pdf", async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user' },
                { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
            ]
        });

        if (!cart) {
            return errorResponse(res, "Presupuesto no encontrado", 404);
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${cart.id}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text(`Presupuesto #${cart.id}`, { align: 'center' });
        doc.moveDown();

        // User Info
        doc.fontSize(12).text(`Cliente: ${cart.user.firstName} ${cart.user.lastName}`);
        doc.text(`Email: ${cart.user.email}`);
        doc.text(`Fecha: ${new Date(cart.updatedAt).toLocaleDateString()}`);
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Producto', 50, tableTop);
        doc.text('Cantidad', 280, tableTop, { width: 90, align: 'right' });
        doc.text('Precio Unit.', 370, tableTop, { width: 90, align: 'right' });
        doc.text('Subtotal', 460, tableTop, { width: 90, align: 'right' });
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Table Rows
        let total = 0;
        cart.items.forEach(item => {
            const subtotal = item.quantity * item.price;
            total += subtotal;
            const y = doc.y;
            doc.text(item.product.name, 50, y, { width: 220 });
            doc.text(item.quantity.toString(), 280, y, { width: 90, align: 'right' });
            doc.text(`$${item.price}`, 370, y, { width: 90, align: 'right' });
            doc.text(`$${subtotal.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
            doc.moveDown();
        });

        // Table Footer
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(12).text(`Total: $${total.toFixed(2)}`, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error(error);
        errorResponse(res, "Error al generar el PDF");
    }
});


module.exports = router;
