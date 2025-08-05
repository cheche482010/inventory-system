const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../helpers/responseHelper");
const { Cart, CartItem, Product } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /my-budgets:
 *   get:
 *     summary: Obtener los presupuestos enviados por el usuario actual
 *     tags: [MyBudgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de presupuestos del usuario
 */
router.get("/", async (req, res) => {
    try {
        const budgets = await Cart.findAll({
            where: {
                userId: req.user.id,
                status: {
                    [Op.ne]: 'active'
                }
            },
            include: [
                { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
            ],
            order: [['updatedAt', 'DESC']]
        });
        successResponse(res, budgets);
    } catch (error) {
        errorResponse(res, "Error al obtener mis solicitudes");
    }
});

module.exports = router;
