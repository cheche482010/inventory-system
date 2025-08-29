const { ActivityLog, User } = require("../models")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { Op } = require("sequelize")

const getAll = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { action, resource, userId, dateFrom, dateTo } = req.query

    const where = {}

    if (action) where.action = action
    if (resource) where.resource = resource
    if (userId) where.userId = userId

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom)
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo + " 23:59:59")
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, rows, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener actividades")
  }
}

const getById = async (req, res) => {
  try {
    const activity = await ActivityLog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
    })

    if (!activity) {
      return errorResponse(res, "Actividad no encontrada", 404)
    }

    successResponse(res, activity)
  } catch (error) {
    errorResponse(res, "Error al obtener actividad")
  }
}

const getStats = async (req, res) => {
  try {
    const days = Number.parseInt(req.query.days) || 30
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const activities = await ActivityLog.findAll({
      where: {
        createdAt: {
          [Op.gte]: dateFrom,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    const stats = {
      totalActivities: activities.length,
      byAction: {},
      byResource: {},
      byUser: {},
      dailyActivity: [],
    }

    activities.forEach((activity) => {
      stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1
      stats.byResource[activity.resource] = (stats.byResource[activity.resource] || 0) + 1

      const userKey = `${activity.user?.firstName} ${activity.user?.lastName}`
      stats.byUser[userKey] = (stats.byUser[userKey] || 0) + 1
    })

    const dailyGroups = {}
    activities.forEach((activity) => {
      const day = activity.createdAt.toISOString().split("T")[0]
      dailyGroups[day] = (dailyGroups[day] || 0) + 1
    })

    stats.dailyActivity = Object.entries(dailyGroups)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    successResponse(res, stats, "Estadísticas obtenidas exitosamente")
  } catch (error) {
    errorResponse(res, "Error al obtener estadísticas")
  }
}

module.exports = {
  getAll,
  getById,
  getStats,
}