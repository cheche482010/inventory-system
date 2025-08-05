const express = require("express");
const { authenticateToken, authorize } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../helpers/responseHelper");
const { sendBudgetEmail } = require("../helpers/mailHelper");
const { Cart, CartItem, Product, User, Notification } = require("../models");
const { Op } = require("sequelize");
const { generateBudgetPdf } = require('../helpers/pdfHelper');

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
        errorResponse(res, "Error al obtener tus solicitudes de presupuesto");
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
router.put("/:id/approve", authorize('admin', 'dev'), async (req, res) => {
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
router.put("/:id/reject", authorize('admin', 'dev'), async (req, res) => {
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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${cart.id}.pdf`);
        
        generateBudgetPdf(cart, res);

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        errorResponse(res, "Error al generar el PDF");
    }
});


module.exports = router;
