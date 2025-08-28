const express = require("express");
const { authenticateToken, authorize } = require("../middleware/auth");
const { getAll, getMy, getById, downloadExcel } = require("../controllers/budgetsController");

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Obtener todas las solicitudes de presupuesto (submitted)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes de presupuesto
 */
router.get("/", authorize('admin', 'dev'), getAll);

/**
 * @swagger
 * /budgets/my:
 *   get:
 *     summary: Obtener mis solicitudes de presupuesto
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis solicitudes de presupuesto
 */
router.get("/my", getMy);


/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     summary: Obtener un presupuesto por ID
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del presupuesto
 */
router.get("/:id", getById);


/**
 * @swagger
 * /budgets/{id}/download-excel:
 *   get:
 *     summary: Descargar un presupuesto como archivo Excel
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo Excel del presupuesto
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/:id/download-excel", authorize('admin', 'dev'), downloadExcel);

module.exports = router;
