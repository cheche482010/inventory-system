const express = require("express");
const { authenticateToken, authorize } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../helpers/responseHelper");
const { sendBudgetEmail } = require("../helpers/mailHelper");
const { Cart, CartItem, Product, User, Notification } = require("../models");
const { Op } = require("sequelize");

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
            order: [['updatedAt', 'DESC']]
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


module.exports = router;
