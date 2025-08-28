const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getAll, markAsRead, markAllAsRead } = require("../controllers/notificationsController");

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtener las notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get("/", getAll);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
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
 *         description: Notificación actualizada
 */
router.put("/:id/read", markAsRead);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones actualizadas
 */
router.put("/mark-all-read", markAllAsRead);

module.exports = router;
