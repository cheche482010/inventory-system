const express = require("express")
const multer = require("multer")
const { authenticateToken, authorize } = require("../middleware/auth")
const { logActivity } = require("../middleware/activityLogger")
const { importProducts } = require("../controllers/importController")
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
  importProducts,
)

module.exports = router
