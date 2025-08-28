const express = require("express")
const { body, param } = require("express-validator")
const { authenticateToken, checkPermission } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { handleValidationErrors } = require("../helpers/validationHelper")
const { search, getAll, getById, create, update, remove } = require("../controllers/usersController")

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         role:
 *           type: string
 *           enum: [user, admin, dev]
 *           description: Rol del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado activo/inactivo
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Fecha del último login
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         id: 1
 *         email: "admin@inventory.com"
 *         firstName: "Admin"
 *         lastName: "System"
 *         role: "admin"
 *         isActive: true
 *         lastLogin: "2024-01-01T12:00:00.000Z"
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 *     UserCreate:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Contraseña del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         role:
 *           type: string
 *           enum: [user, admin, dev]
 *           description: Rol del usuario
 *       example:
 *         email: "nuevo@inventory.com"
 *         password: "password123"
 *         firstName: "Nuevo"
 *         lastName: "Usuario"
 *         role: "user"
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuarios con filtros
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, dev]
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de usuarios filtrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/search", [authenticateToken, checkPermission("users", "read")], search)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, dev]
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/", [authenticateToken, checkPermission("users", "read")], getAll)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/:id",
  [authenticateToken, checkPermission("users", "read"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  getById,
)

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 */
router.post(
  "/",
  [
    authenticateToken,
    checkPermission("users", "create"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("Password debe tener al menos 6 caracteres"),
    body("firstName").notEmpty().withMessage("Nombre requerido"),
    body("lastName").notEmpty().withMessage("Apellido requerido"),
    body("role").isIn(["user", "admin", "dev"]).withMessage("Rol inválido"),
  ],
  handleValidationErrors,
  logActivity("CREATE", "USER"),
  create,
)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña (opcional)
 *               firstName:
 *                 type: string
 *                 description: Nombre del usuario
 *               lastName:
 *                 type: string
 *                 description: Apellido del usuario
 *               role:
 *                 type: string
 *                 enum: [user, admin, dev]
 *                 description: Rol del usuario
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo/inactivo
 *             example:
 *               firstName: "Nombre Actualizado"
 *               lastName: "Apellido Actualizado"
 *               role: "admin"
 *               isActive: true
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  "/:id",
  [
    authenticateToken,
    checkPermission("users", "update"),
    param("id").isInt().withMessage("ID debe ser un número"),
    body("email").optional().isEmail().withMessage("Email inválido"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password debe tener al menos 6 caracteres"),
    body("firstName").optional().notEmpty().withMessage("Nombre no puede estar vacío"),
    body("lastName").optional().notEmpty().withMessage("Apellido no puede estar vacío"),
    body("role").optional().isIn(["user", "admin", "dev"]).withMessage("Rol inválido"),
    body("isActive").optional().isBoolean().withMessage("isActive debe ser boolean"),
  ],
  handleValidationErrors,
  logActivity("UPDATE", "USER"),
  update,
)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: No se puede eliminar a sí mismo
 */
router.delete(
  "/:id",
  [authenticateToken, checkPermission("users", "delete"), param("id").isInt().withMessage("ID debe ser un número")],
  handleValidationErrors,
  logActivity("DELETE", "USER"),
  remove,
)

module.exports = router