const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const { sequelize } = require("./models")
const routes = require("./routes")
const { errorHandler } = require("./middleware/errorHandler")
const swaggerSetup = require("./config/swagger")

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? "https://yourdomain.com" : "http://localhost:5173",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Logging
app.use(morgan("combined"))

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Swagger documentation
swaggerSetup(app)

// Routes
app.use("/api", routes)

// Error handling
app.use(errorHandler)

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("✅ Database connected successfully")

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error("❌ Unable to connect to database:", error)
    process.exit(1)
  }
}

startServer()
