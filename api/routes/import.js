const express = require("express")
const { Brand, Category, Product } = require("../models")
const { authenticateToken, authorize } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { successResponse, errorResponse } = require("../helpers/responseHelper")
const { Op } = require("sequelize")

const router = express.Router()

router.post(
  "/",
  [authenticateToken, authorize("admin", "dev"), logActivity("IMPORT", "PRODUCTS")],
  async (req, res) => {
    const { dataToImport } = req.body
    const errors = []
    const results = {
      created: 0,
      updated: 0,
    }

    if (!dataToImport || !Array.isArray(dataToImport)) {
      return errorResponse(res, "No data to import or data is not in expected format.", 400)
    }

    for (const item of dataToImport) {
      try {
        let brand = await Brand.findOne({ where: { name: item.brand } })
        if (!brand) {
          brand = await Brand.create({ name: item.brand })
        }

        let category = await Category.findOne({ where: { name: item.category } })
        if (!category) {
          category = await Category.create({ name: item.category })
        }

        let product = await Product.findOne({ where: { code: item.code } })

        const productData = {
          name: item.name,
          price: item.price,
          status: item.status,
          brandId: brand.id,
          categoryId: category.id,
        }

        if (item.description !== null && item.description !== undefined) {
          productData.description = item.description
        }

        if (product) {
          await product.update(productData)
          results.updated++
        } else {
          productData.code = item.code
          await Product.create(productData)
          results.created++
        }
      } catch (error) {
        errors.push({ code: item.code, error: error.message })
      }
    }

    if (errors.length > 0) {
      return errorResponse(res, { message: "Import completed with errors", errors, results }, 422)
    }

    successResponse(res, { message: "Import completed successfully", results }, 200)
  },
)

module.exports = router
