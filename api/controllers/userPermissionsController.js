const { User, Permission, UserPermission } = require("../models")
const { successResponse, errorResponse } = require("../helpers/responseHelper")

const getPermissions = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{ model: Permission, as: "permissions" }],
    })

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    successResponse(res, user.permissions)
  } catch (error) {
    errorResponse(res, "Error al obtener permisos del usuario")
  }
}

const assignPermission = async (req, res) => {
  try {
    const { userId } = req.params
    const { permissionId } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const permission = await Permission.findByPk(permissionId)
    if (!permission) {
      return errorResponse(res, "Permiso no encontrado", 404)
    }

    await UserPermission.create({ userId, permissionId })

    successResponse(res, null, "Permiso asignado exitosamente", 201)
  } catch (error) {
    errorResponse(res, "Error al asignar permiso")
  }
}

const revokePermission = async (req, res) => {
  try {
    const { userId, permissionId } = req.params

    const result = await UserPermission.destroy({
      where: { userId, permissionId },
    })

    if (result === 0) {
      return errorResponse(res, "El usuario no tiene este permiso", 404)
    }

    successResponse(res, null, "Permiso revocado exitosamente")
  } catch (error) {
    errorResponse(res, "Error al revocar permiso")
  }
}

module.exports = {
  getPermissions,
  assignPermission,
  revokePermission,
}