const ExcelJS = require("exceljs")
const { successResponse, errorResponse } = require("../helpers/responseHelper")
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
    })

    if (!cart) {
      return errorResponse(res, "Presupuesto no encontrado", 404)
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Presupuesto ${cart.id}`)

    worksheet.mergeCells('A1:E1')
    worksheet.getCell('A1').value = `Presupuesto #${cart.id}`
    worksheet.getCell('A1').alignment = { horizontal: 'center' }
    worksheet.getCell('A1').font = { size: 16, bold: true }

    worksheet.mergeCells('A2:E2')
    worksheet.getCell('A2').value = `Cliente: ${cart.user.firstName} ${cart.user.lastName} (${cart.user.email})`
    worksheet.mergeCells('A3:E3')
    worksheet.getCell('A3').value = `Fecha: ${new Date(cart.updatedAt).toLocaleDateString()}`
    
    worksheet.addRow([])

    worksheet.addRow(['Código', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'])
    worksheet.getRow(6).font = { bold: true }
    worksheet.getRow(6).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      }
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    })

    cart.items.forEach(item => {
      worksheet.addRow([
        item.product.code,
        item.product.name,
        item.quantity,
        item.price,
        item.quantity * item.price
      ])
    })

    const total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    worksheet.addRow([])
    const totalRow = worksheet.addRow(['', '', '', 'Total:', total])
    totalRow.font = { bold: true }
    worksheet.getCell(`D${totalRow.number}`).alignment = { horizontal: 'right' }

    worksheet.getColumn('A').width = 20
    worksheet.getColumn('B').width = 40
    worksheet.getColumn('C').width = 15
    worksheet.getColumn('D').width = 20
    worksheet.getColumn('E').width = 20

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${cart.id}.xlsx"`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error al generar el Excel:", error)
    errorResponse(res, "Error al generar el archivo Excel")
  }
}

module.exports = {
  getAll,
  getMy,
  getById,
  downloadExcel,
}