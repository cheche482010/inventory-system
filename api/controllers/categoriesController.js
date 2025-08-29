const { Category, Product } = require("../models")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { Op } = require("sequelize")

const getAll = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const { search, sortBy, sortOrder } = req.query

    const where = { isActive: true }

    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }

    const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [["name", "ASC"]]

    const { count, rows } = await Category.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id"],
          where: { isActive: true },
          required: false,
        },
      ],
      limit,
      offset,
      order,
      distinct: true,
    })

    const categoriesWithProductCount = rows.map((category) => ({
      ...category.toJSON(),
      productCount: category.products ? category.products.length : 0,
    }))

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, categoriesWithProductCount, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener categorías")
  }
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { isActive: true }, order: [["name", "ASC"]] })
    successResponse(res, categories)
  } catch (error) {
    errorResponse(res, "Error al obtener todas las categorías")
  }
}

const getById = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "code", "name", "price", "status"],
          where: { isActive: true },
          required: false,
        },
      ],
    })

    if (!category) {
      return errorResponse(res, "Categoría no encontrada", 404)
    }

    successResponse(res, category)
  } catch (error) {
    errorResponse(res, "Error al obtener categoría")
  }
}

const create = async (req, res) => {
  try {
    const category = await Category.create(req.body)
    successResponse(res, category, "Categoría creada exitosamente", 201)
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe una categoría con ese nombre", 400)
    }
    errorResponse(res, "Error al crear categoría")
  }
}

const update = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, isActive: true },
    })

    if (!category) {
      return errorResponse(res, "Categoría no encontrada", 404)
    }

    await category.update(req.body)
    successResponse(res, category, "Categoría actualizada exitosamente")
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe una categoría con ese nombre", 400)
    }
    errorResponse(res, "Error al actualizar categoría")
  }
}

const remove = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        {
          model: Product,
          as: "products",
          where: { isActive: true },
          required: false,
        },
      ],
    })

    if (!category) {
      return errorResponse(res, "Categoría no encontrada", 404)
    }

    if (category.products && category.products.length > 0) {
      return errorResponse(res, "No se puede eliminar una categoría con productos asociados", 403)
    }

    await category.update({ isActive: false })
    successResponse(res, null, "Categoría eliminada exitosamente")
  } catch (error) {
    errorResponse(res, "Error al eliminar categoría")
  }
}

module.exports = {
  getAll,
  getAllCategories,
  getById,
  create,
  update,
  remove,
}