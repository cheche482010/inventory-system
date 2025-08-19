const express = require("express")
const multer = require("multer")
const { Brand, Category, Product } = require("../models")
const { authenticateToken, authorize } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { successResponse, errorResponse } = require("../helpers/responseHelper")
const { Op } = require("sequelize")
const axios = require("axios")
const fs = require("fs")
const path = require("path")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'products')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage })

const router = express.Router()

router.post(
  "/",
  [authenticateToken, authorize("admin", "dev"), upload.array('images'), logActivity("IMPORT", "PRODUCTS")],
  async (req, res) => {
    const dataToImport = JSON.parse(req.body.dataToImport)
    const imageIndexes = req.body.imageIndexes ? (Array.isArray(req.body.imageIndexes) ? req.body.imageIndexes : [req.body.imageIndexes]) : []
    const uploadedFiles = req.files || []
    const errors = []
    const results = {
      created: 0,
      updated: 0,
    }

    if (!dataToImport || !Array.isArray(dataToImport)) {
      return errorResponse(res, "No data to import or data is not in expected format.", 400)
    }

    for (let i = 0; i < dataToImport.length; i++) {
      const item = dataToImport[i]
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

        const imageIndex = imageIndexes.indexOf(i.toString())
        if (imageIndex !== -1 && uploadedFiles[imageIndex]) {
          productData.imagen = `products/${uploadedFiles[imageIndex].filename}`
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
