const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../helpers/responseHelper");
const { Notification } = require("../models");

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
router.get("/", async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        successResponse(res, notifications);
    } catch (error) {
        errorResponse(res, "Error al obtener notificaciones");
    }
});

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
router.put("/:id/read", async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (notification) {
            notification.read = true;
            await notification.save();
            successResponse(res, notification);
        } else {
            errorResponse(res, "Notificación no encontrada", 404);
        }
    } catch (error) {
        errorResponse(res, "Error al actualizar la notificación");
    }
});

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
router.put("/mark-all-read", async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, read: false } }
        );
        successResponse(res, null, "Todas las notificaciones marcadas como leídas");
    } catch (error) {
        errorResponse(res, "Error al actualizar notificaciones");
    }
});

module.exports = router;
