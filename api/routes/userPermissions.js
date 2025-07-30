const express = require("express")
const { param, body } = require("express-validator")
const { User, Permission, UserPermission } = require("../models")
const { authenticateToken, checkPermission } = require("../middleware/auth")
const { successResponse, errorResponse } = require("../helpers/responseHelper")
const { handleValidationErrors } = require("../helpers/validationHelper")

const router = express.Router({ mergeParams: true })

/**
 * @swagger
 * /users/{userId}/permissions:
 *   get:
 *     summary: Obtener los permisos de un usuario
 *     tags: [UserPermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de permisos del usuario
 */
router.get(
  "/",
  [authenticateToken, checkPermission("users", "read")],
  async (req, res) => {
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
  },
)

/**
 * @swagger
 * /users/{userId}/permissions:
 *   post:
 *     summary: Asignar un permiso a un usuario
 *     tags: [UserPermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Permiso asignado
 */
router.post(
  "/",
  [
    authenticateToken,
    checkPermission("users", "update"),
    body("permissionId").isInt().withMessage("permissionId debe ser un número"),
  ],
  handleValidationErrors,
  async (req, res) => {
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
  },
)

/**
 * @swagger
 * /users/{userId}/permissions/{permissionId}:
 *   delete:
 *     summary: Revocar un permiso de un usuario
 *     tags: [UserPermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permiso revocado
 */
router.delete(
  "/:permissionId",
  [
    authenticateToken,
    checkPermission("users", "update"),
    param("permissionId").isInt().withMessage("permissionId debe ser un número"),
  ],
  handleValidationErrors,
  async (req, res) => {
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
  },
)

module.exports = router
