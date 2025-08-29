const { successResponse, errorResponse } = require("../helpers/responseHelper")
const { generateBudgetExcel } = require("../helpers/excelHelper")
const { Cart, CartItem, Product, User, Sequelize } = require("../models")
const { Op } = Sequelize

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10)
    let perPage = req.query.perPage
    const { sortBy = 'updatedAt', sortOrder = 'DESC', search = '' } = req.query
    
    let limit = null
    let offset = null

    if (perPage !== 'all') {
      perPage = parseInt(perPage || '10', 10)
      limit = perPage
      offset = (page - 1) * perPage
    }

    const whereClause = { status: 'submitted' }

    if (search) {
      const searchConditions = [
        { '$user.firstName$': { [Op.like]: `%${search}%` } },
        { '$user.lastName$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } },
      ]

      if (!isNaN(search)) {
        searchConditions.push({ id: parseInt(search, 10) })
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(search)) {
        searchConditions.push(
          Sequelize.where(Sequelize.fn('DATE', Sequelize.col('Cart.updatedAt')), '=', search)
        )
      }
      
      whereClause[Op.or] = searchConditions
    }

    const order = []
    if (sortBy.includes('.')) {
      const [model, field] = sortBy.split('.')
      order.push([model, field, sortOrder])
    } else {
      order.push([sortBy, sortOrder])
    }

    const { count, rows: budgets } = await Cart.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      order: order,
      limit: limit,
      offset: offset,
      distinct: true,
      subQuery: false,
    })

    successResponse(res, {
      budgets,
      total: count,
      currentPage: page,
      totalPages: limit ? Math.ceil(count / limit) : 1
    })
  } catch (error) {
    console.error(error)
    errorResponse(res, "Error al obtener las solicitudes de presupuesto")
  }
}

const getMy = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10)
    let perPage = req.query.perPage
    const { sortBy = 'updatedAt', sortOrder = 'DESC', search = '' } = req.query

    let limit = null
    let offset = null

    if (perPage !== 'all') {
      perPage = parseInt(perPage || '10', 10)
      limit = perPage
      offset = (page - 1) * perPage
    }

    const whereClause = {
      userId: req.user.id,
      status: 'submitted',
    }

    if (search) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
      ]
    }

    const { count, rows: budgets } = await Cart.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      order: [[sortBy, sortOrder]],
      limit: limit,
      offset: offset,
      distinct: true,
    })

    successResponse(res, {
      budgets,
      total: count,
      currentPage: page,
      totalPages: limit ? Math.ceil(count / limit) : 1
    })
  } catch (error) {
    console.error(error)
    errorResponse(res, "Error al obtener tus solicitudes de presupuesto")
  }
}

const getById = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    })

    if (!cart) {
      return errorResponse(res, "Presupuesto no encontrado", 404)
    }

    const isOwner = cart.userId === req.user.id
    const isAdminOrDev = ['admin', 'dev'].includes(req.user.role)

    if (!isOwner && !isAdminOrDev) {
      return errorResponse(res, "Permisos insuficientes", 403)
    }

    successResponse(res, cart)
  } catch (error) {
    console.error("Error al obtener el presupuesto:", error)
    errorResponse(res, "Error al obtener el presupuesto")
  }
}

const downloadExcel = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { 
          model: CartItem, 
          as: 'items', 
          include: [{ model: Product, as: 'product' }] 
        }
      ]
    });

    if (!cart) {
      return errorResponse(res, "Presupuesto no encontrado", 404);
    }

    const excelBuffer = await generateBudgetExcel(cart, cart.user);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${cart.id}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error al generar el Excel:", error);
    errorResponse(res, "Error al generar el archivo Excel");
  }
};

module.exports = {
  getAll,
  getMy,
  getById,
  downloadExcel,
}