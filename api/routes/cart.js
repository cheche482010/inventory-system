const express = require("express");
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { handleValidationErrors } = require("../helpers/validationHelper");
const { getCart, addItem, removeItem, submit } = require("../controllers/cartController");

const router = express.Router();

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
router.get("/", getCart);

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
    addItem
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
router.delete("/items/:productId", removeItem);

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
router.post("/submit", submit);

module.exports = router;
