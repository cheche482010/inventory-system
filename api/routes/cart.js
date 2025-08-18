const express = require("express");
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { handleValidationErrors } = require("../helpers/validationHelper");
const { successResponse, errorResponse } = require("../helpers/responseHelper");
const { Cart, CartItem, Product, User, Notification } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

// All routes in this file will be protected
router.use(authenticateToken);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Obtener el carrito activo del usuario
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito activo del usuario
 */
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({
            where: { userId, status: 'active' },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!cart) {
            cart = await Cart.create({ userId, status: 'active' });
        }

        successResponse(res, cart);
    } catch (error) {
        errorResponse(res, "Error al obtener el carrito");
    }
});

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Añadir o actualizar un item en el carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Carrito actualizado
 */
router.post(
    "/items",
    [
        body("productId").isInt().withMessage("productId debe ser un entero"),
        body("quantity").isInt({ min: 0 }).withMessage("quantity debe ser un entero mayor o igual a 0"),
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            // Get active cart, or create it
            let cart = await Cart.findOne({ where: { userId, status: 'active' } });
            if (!cart) {
                cart = await Cart.create({ userId, status: 'active' });
            }

            // Check if product exists and is available
            const product = await Product.findOne({
                where: {
                    id: productId,
                    isActive: true,
                    status: { [Op.ne]: 'agotado' }
                }
            });
            if (!product) {
                return errorResponse(res, "Producto no encontrado o está agotado", 404);
            }

            let cartItem = await CartItem.findOne({
                where: { cartId: cart.id, productId: productId },
            });

            if (cartItem) {
                if (quantity === 0) {
                    await cartItem.destroy();
                } else {
                    cartItem.quantity = quantity;
                    await cartItem.save();
                }
            } else if (quantity > 0) {
                cartItem = await CartItem.create({
                    cartId: cart.id,
                    productId: productId,
                    quantity: quantity,
                    price: product.price, // Store price at the time of adding
                });
            }

            // Get updated cart with all items
            const updatedCart = await Cart.findOne({
                where: { id: cart.id },
                include: [
                    {
                        model: CartItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }]
                    }
                ]
            });

            successResponse(res, updatedCart, "Carrito actualizado");
        } catch (error) {
            console.error(error);
            errorResponse(res, "Error al actualizar el carrito");
        }
    }
);

/**
 * @swagger
 * /cart/items/{productId}:
 *   delete:
 *     summary: Eliminar un item del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Carrito actualizado
 */
router.delete("/items/:productId", async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ where: { userId, status: 'active' } });
        if (!cart) {
            return errorResponse(res, "No hay carrito activo", 404);
        }

        const cartItem = await CartItem.findOne({
            where: { cartId: cart.id, productId: productId },
        });

        if (cartItem) {
            await cartItem.destroy();
        } else {
            return errorResponse(res, "Item no encontrado en el carrito", 404);
        }

        const updatedCart = await Cart.findOne({
            where: { id: cart.id },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        successResponse(res, updatedCart, "Item eliminado del carrito");
    } catch (error) {
        errorResponse(res, "Error al eliminar item del carrito");
    }
});

/**
 * @swagger
 * /cart/submit:
 *   post:
 *     summary: Enviar el carrito como una solicitud de presupuesto
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito enviado para presupuesto
 */
router.post("/submit", async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({
            where: { userId, status: 'active' },
            include: [{ model: CartItem, as: 'items' }]
        });

        if (!cart || cart.items.length === 0) {
            return errorResponse(res, "No se puede enviar un carrito vacío", 400);
        }

        cart.status = 'submitted';
        await cart.save();

        // Notify all admins and devs
        const admins = await User.findAll({
            where: { role: { [Op.in]: ['admin', 'dev'] } }
        });
        const message = `Nueva solicitud de presupuesto #${cart.id} del usuario ${req.user.firstName}.`;
        for (const admin of admins) {
            await Notification.create({ userId: admin.id, message, type: 'budget_submitted' });
        }

        successResponse(res, cart, "Solicitud de presupuesto enviada exitosamente");
    } catch (error) {
        console.error(error);
        errorResponse(res, "Error al enviar el presupuesto");
    }
});

module.exports = router;
