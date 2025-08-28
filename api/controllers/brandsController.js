const { Brand, Product } = require("../models")
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
      where.name = { [Op.like]: `%${search}%` }
    }

    const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [["id", "ASC"]]

    const { count, rows } = await Brand.findAndCountAll({
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

    const brandsWithProductCount = rows.map((brand) => ({
      ...brand.toJSON(),
      productCount: brand.products ? brand.products.length : 0,
    }))

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit,
    }

    paginatedResponse(res, brandsWithProductCount, pagination)
  } catch (error) {
    errorResponse(res, "Error al obtener marcas")
  }
}

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({ where: { isActive: true }, order: [["name", "ASC"]] })
    successResponse(res, brands)
  } catch (error) {
    errorResponse(res, "Error al obtener todas las marcas")
  }
}

const getById = async (req, res) => {
  try {
    const brand = await Brand.findOne({
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

    if (!brand) {
      return errorResponse(res, "Marca no encontrada", 404)
    }

    successResponse(res, brand)
  } catch (error) {
    errorResponse(res, "Error al obtener marca")
  }
}

const create = async (req, res) => {
  try {
    const brand = await Brand.create(req.body)
    successResponse(res, brand, "Marca creada exitosamente", 201)
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe una marca con ese nombre", 400)
    }
    errorResponse(res, "Error al crear marca")
  }
}

const update = async (req, res) => {
  try {
    const brand = await Brand.findOne({
      where: { id: req.params.id, isActive: true },
    })

    if (!brand) {
      return errorResponse(res, "Marca no encontrada", 404)
    }

    await brand.update(req.body)
    successResponse(res, brand, "Marca actualizada exitosamente")
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "Ya existe una marca con ese nombre", 400)
    }
    errorResponse(res, "Error al actualizar marca")
  }
}

const remove = async (req, res) => {
  try {
    const brand = await Brand.findOne({
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

    if (!brand) {
      return errorResponse(res, "Marca no encontrada", 404)
    }

    if (brand.products && brand.products.length > 0) {
      return errorResponse(res, "No se puede eliminar una marca con productos asociados", 403)
    }

    await brand.update({ isActive: false })
    successResponse(res, null, "Marca eliminada exitosamente")
  } catch (error) {
    errorResponse(res, "Error al eliminar marca")
  }
}

module.exports = {
  getAll,
  getAllBrands,
  getById,
  create,
  update,
  remove,
}