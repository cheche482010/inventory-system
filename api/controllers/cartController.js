const axios = require('axios')
const { successResponse, errorResponse } = require("../helpers/responseHelper")
const { sendNewBudgetAdminNotification, sendBudgetConfirmationToUser } = require("../helpers/mailHelper")
const { Cart, CartItem, Product, User } = require("../models")
const { Op } = require("sequelize")

const getCart = async (req, res) => {
  try {
    const userId = req.user.id

    let cart = await Cart.findOne({
      where: { userId, status: 'active' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    })

    if (!cart) {
      cart = await Cart.create({ userId, status: 'active' })
    }

    successResponse(res, cart)
  } catch (error) {
    errorResponse(res, "Error al obtener el carrito")
  }
}

const addItem = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, quantity } = req.body

    let cart = await Cart.findOne({ where: { userId, status: 'active' } })
    if (!cart) {
      cart = await Cart.create({ userId, status: 'active' })
    }

    const product = await Product.findOne({
      where: {
        id: productId,
        isActive: true,
        status: { [Op.ne]: 'agotado' }
      }
    })
    if (!product) {
      return errorResponse(res, "Producto no encontrado o está agotado", 404)
    }

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId: productId },
    })

    if (cartItem) {
      if (quantity === 0) {
        await cartItem.destroy()
      } else {
        cartItem.quantity = quantity
        await cartItem.save()
      }
    } else if (quantity > 0) {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
        price: product.price,
      })
    }

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    })

    successResponse(res, updatedCart, "Carrito actualizado")
  } catch (error) {
    console.error(error)
    errorResponse(res, "Error al actualizar el carrito")
  }
}

const removeItem = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId } = req.params

    const cart = await Cart.findOne({ where: { userId, status: 'active' } })
    if (!cart) {
      return errorResponse(res, "No hay carrito activo", 404)
    }

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId: productId },
    })

    if (cartItem) {
      await cartItem.destroy()
    } else {
      return errorResponse(res, "Item no encontrado en el carrito", 404)
    }

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    })

    successResponse(res, updatedCart, "Item eliminado del carrito")
  } catch (error) {
    errorResponse(res, "Error al eliminar item del carrito")
  }
}

const submit = async (req, res) => {
  try {
    const userId = req.user.id

    const cart = await Cart.findOne({
      where: { userId, status: 'active' },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    })

    if (!cart || !cart.items || cart.items.length === 0) {
      return errorResponse(res, "No se puede enviar un carrito vacío", 400)
    }

    cart.status = 'submitted'
    await cart.save()

    let dolarRate = null
    try {
      const dolarResponse = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial')
      if (dolarResponse.data && dolarResponse.data.promedio) {
        dolarRate = dolarResponse.data.promedio
        console.log(`Successfully fetched Dolar rate: ${dolarRate}`)
      }
    } catch (apiError) {
      console.error("Could not fetch Dolar rate. Proceeding without it.", apiError.message)
    }

    sendNewBudgetAdminNotification(cart, req.user, dolarRate)
    sendBudgetConfirmationToUser(cart, req.user, dolarRate)

    successResponse(res, cart, "Solicitud de presupuesto enviada exitosamente")
  } catch (error) {
    console.error("Error al enviar el presupuesto:", error)
    errorResponse(res, "Error al enviar el presupuesto")
  }
}

module.exports = {
  getCart,
  addItem,
  removeItem,
  submit,
}