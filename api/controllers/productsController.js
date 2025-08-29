const { Product, Brand, Category } = require("../models")
const { successResponse, errorResponse, paginatedResponse } = require("../helpers/responseHelper")
const { Op } = require("sequelize")
const fs = require("fs")
const path = require("path")

const getAll = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = req.query.limit === 'all' ? null : (Number.parseInt(req.query.limit) || 10)
    const offset = limit ? (page - 1) * limit : 0
    const { search, status, brandId, categoryId, sortBy, sortOrder } = req.query

    const where = { isActive: true }

    if (search) {
      where[Op.or] = [{ code: { [Op.like]: `%${search}%` } }, { name: { [Op.like]: `%${search}%` } }]
    }

    if (status) where.status = status
    if (brandId) where.brandId = brandId
    if (categoryId) where.categoryId = categoryId

    let order = [["name", "ASC"]]
    if (sortBy && sortOrder) {
      if (sortBy === 'brand.name') {
        order = [[{ model: Brand, as: 'brand' }, 'name', sortOrder]]
      } else if (sortBy === 'category.name') {
        order = [[{ model: Category, as: 'category' }, 'name', sortOrder]]
      } else {
        order = [[sortBy, sortOrder]]
      }
    }

    const queryOptions = {
      where,
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
      order,
    }

    if (limit) {
      queryOptions.limit = limit
      queryOptions.offset = offset
    }

    const { count, rows } = await Product.findAndCountAll(queryOptions)

    const pagination = {
      currentPage: page,
      totalPages: limit ? Math.ceil(count / limit) : 1,
      totalItems: count,
      itemsPerPage: limit || count,
    }

    paginatedResponse(res, rows, pagination)
  } catch (error) {
    console.log(error)
    errorResponse(res, "Error al obtener productos")
  }
}

const getById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
    })

    if (!product) {
      return errorResponse(res, "Producto no encontrado", 404)
    }

    successResponse(res, product)
  } catch (error) {
    errorResponse(res, "Error al obtener producto")
  }
}

const create = async (req, res) => {
  try {
    const productData = { ...req.body }
    if (req.file) {
      productData.imagen = `products/${req.file.filename}`
    }

    const product = await Product.create(productData)
    const productWithRelations = await Product.findByPk(product.id, {
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
    })

    successResponse(res, productWithRelations, "Producto creado exitosamente", 201)
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "El código del producto ya existe", 400)
    }
    errorResponse(res, "Error al crear producto")
  }
}

const update = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
    })

    if (!product) {
      return errorResponse(res, "Producto no encontrado", 404)
    }

    const productData = { ...req.body }

    if (req.file) {
      if (product.imagen) {
        const oldImagePath = path.join(__dirname, "..", "uploads", product.imagen)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      productData.imagen = `products/${req.file.filename}`
    }

    await product.update(productData)

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
    })

    successResponse(res, updatedProduct, "Producto actualizado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al actualizar producto")
  }
}

const remove = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
    })

    if (!product) {
      return errorResponse(res, "Producto no encontrado", 404)
    }

    await product.update({ isActive: false })
    successResponse(res, null, "Producto eliminado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al eliminar producto")
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
}