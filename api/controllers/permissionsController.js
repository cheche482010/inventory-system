const { Permission, User } = require("../models")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { Op, Sequelize } = require("sequelize")

const getAll = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { search, resource, sortBy, sortOrder } = req.query

    const where = { isActive: true }

    if (search) {
      const lowerCaseSearch = search.toLowerCase()
      where[Op.or] = [
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), { [Op.like]: "%" + lowerCaseSearch + "%" }),
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("description")), {
          [Op.like]: "%" + lowerCaseSearch + "%",
        }),
      ]
    }

    if (resource) where.resource = resource

    const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [["resource", "ASC"], ["action", "ASC"]]

    const { count, rows } = await Permission.findAndCountAll({
      where,
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
    errorResponse(res, "Error al obtener permisos")
  }
}

const create = async (req, res) => {
  try {
    const permission = await Permission.create(req.body)
    successResponse(res, permission, "Permiso creado exitosamente", 201)
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe un permiso con ese nombre", 400)
    }
    errorResponse(res, "Error al crear permiso")
  }
}

const update = async (req, res) => {
  try {
    const permission = await Permission.findOne({
      where: { id: req.params.id, isActive: true },
    })

    if (!permission) {
      return errorResponse(res, "Permiso no encontrado", 404)
    }

    await permission.update(req.body)
    successResponse(res, permission, "Permiso actualizado exitosamente")
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe un permiso con ese nombre", 400)
    }
    errorResponse(res, "Error al actualizar permiso")
  }
}

const remove = async (req, res) => {
  try {
    const permission = await Permission.findOne({
      where: { id: req.params.id, isActive: true },
    })

    if (!permission) {
      return errorResponse(res, "Permiso no encontrado", 404)
    }

    await permission.update({ isActive: false })
    successResponse(res, null, "Permiso eliminado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al eliminar permiso")
  }
}

const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [
        {
          model: Permission,
          as: "permissions",
          where: { isActive: true },
          required: false,
        },
      ],
    })

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    successResponse(res, user.permissions, "Permisos del usuario obtenidos exitosamente")
  } catch (error) {
    errorResponse(res, "Error al obtener permisos del usuario")
  }
}

module.exports = {
  getAll,
  create,
  update,
  remove,
  getUserPermissions,
}