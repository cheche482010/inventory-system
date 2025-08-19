const path = require('path')
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: path.resolve(__dirname, '../.env') })
}

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")

const { sequelize } = require("./models")
const routes = require("./routes")
const { errorHandler } = require("./middleware/errorHandler")
const swaggerSetup = require("./config/swagger")

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security middleware
app.use(helmet())

// CORS configuration based on environment
const allowedOrigins = NODE_ENV === 'production' 
    ? [process.env.PROD_FRONTEND_URL]
    : [process.env.LOCAL_FRONTEND_URL]

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['Authorization', 'Set-Cookie']
}))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'))

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Swagger documentation
swaggerSetup(app)

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

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
            if (NODE_ENV === 'development') {
                console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
            }
        })
    } catch (error) {
        console.error("❌ Unable to connect to database:", error)
        process.exit(1)
    }
}

startServer()
