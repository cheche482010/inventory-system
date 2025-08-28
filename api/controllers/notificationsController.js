const { successResponse, errorResponse } = require("../helpers/responseHelper")
const { Notification } = require("../models")

const getAll = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    })
    successResponse(res, notifications)
  } catch (error) {
    errorResponse(res, "Error al obtener notificaciones")
  }
}

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (notification) {
      notification.read = true
      await notification.save()
      successResponse(res, notification)
    } else {
      errorResponse(res, "Notificación no encontrada", 404)
    }
  } catch (error) {
    errorResponse(res, "Error al actualizar la notificación")
  }
}

const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    )
    successResponse(res, null, "Todas las notificaciones marcadas como leídas")
  } catch (error) {
    errorResponse(res, "Error al actualizar notificaciones")
  }
}

module.exports = {
  getAll,
  markAsRead,
  markAllAsRead,
}