const express = require("express")
const router = express.Router()

const authRoutes = require("./auth")
const productRoutes = require("./products")
const brandRoutes = require("./brands")
const categoryRoutes = require("./categories")
const userRoutes = require("./users")
const activityRoutes = require("./activities")

router.use("/auth", authRoutes)
router.use("/products", productRoutes)
router.use("/brands", brandRoutes)
router.use("/categories", categoryRoutes)
router.use("/users", userRoutes)
router.use("/activities", activityRoutes)

module.exports = router
