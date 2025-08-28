const { User, ActivityLog } = require("../models")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { Op } = require("sequelize")

const search = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const { search, role, isActive, sortBy, sortOrder } = req.query

    const where = {}

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive === "true"

    const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [["createdAt", "DESC"]]

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order,
    })

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, rows, pagination)
  } catch (error) {
    errorResponse(res, "Error al buscar usuarios")
  }
}

const getAll = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const { search, role, isActive, sortBy, sortOrder } = req.query

    const where = {}

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive === "true"

    const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [["createdAt", "DESC"]]

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: ActivityLog,
          as: "activities",
          attributes: ["id"],
          required: false,
        },
      ],
      limit,
      offset,
      order,
    })

    const usersWithActivityCount = rows.map((user) => ({
      ...user.toJSON(),
      activityCount: user.activities ? user.activities.length : 0,
    }))

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, usersWithActivityCount, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener usuarios")
  }
}

const getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: ActivityLog,
          as: "activities",
          limit: 10,
          order: [["createdAt", "DESC"]],
        },
      ],
    })

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    successResponse(res, user)
  } catch (error) {
    errorResponse(res, "Error al obtener usuario")
  }
}

const create = async (req, res) => {
  try {
    const user = await User.create(req.body)
    const { password, ...userWithoutPassword } = user.toJSON()
    successResponse(res, userWithoutPassword, "Usuario creado exitosamente", 201)
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe un usuario con ese email", 400)
    }
    errorResponse(res, "Error al crear usuario")
  }
}

const update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    if (user.id === req.user.id && req.body.hasOwnProperty("isActive")) {
      return errorResponse(res, "No puedes desactivar tu propia cuenta", 403)
    }

    await user.update(req.body)
    const { password, ...userWithoutPassword } = user.toJSON()
    successResponse(res, userWithoutPassword, "Usuario actualizado exitosamente")
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe un usuario con ese email", 400)
    }
    errorResponse(res, "Error al actualizar usuario")
  }
}

const remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    if (user.id === req.user.id) {
      return errorResponse(res, "No puedes eliminar tu propia cuenta", 403)
    }

    await user.update({ isActive: false })
    successResponse(res, null, "Usuario eliminado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al eliminar usuario")
  }
}

module.exports = {
  search,
  getAll,
  getById,
  create,
  update,
  remove,
}