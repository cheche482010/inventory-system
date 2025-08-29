const express = require("express")
const { param, body } = require("express-validator")
const { authenticateToken, checkPermission, authorize } = require("../middleware/auth")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { getPermissions, assignPermission, revokePermission } = require("../controllers/userPermissionsController")

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
const canGetUserPermissions = async (req, res, next) => {
  const requestedUserId = parseInt(req.params.userId, 10);
  const loggedInUserId = req.user.id;

  if (requestedUserId === loggedInUserId) {
    return next();
  }

  // If not accessing their own, fall back to permission check
  return checkPermission("users", "read")(req, res, next);
};

router.get(
  "/",
  [authenticateToken, canGetUserPermissions],
  getPermissions,
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
    authorize("dev"),
    body("permissionId").isInt().withMessage("permissionId debe ser un número"),
  ],
  handleValidationErrors,
  assignPermission,
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
    authorize("dev"),
    param("permissionId").isInt().withMessage("permissionId debe ser un número"),
  ],
  handleValidationErrors,
  revokePermission,
)

module.exports = router
