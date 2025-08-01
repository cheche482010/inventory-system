const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Asegurarse de que el directorio de uploads existe
const uploadDir = path.join(__dirname, "../uploads/products")
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/
    const mimetype = allowedFileTypes.test(file.mimetype)
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
        return cb(null, true)
    }
    cb(new Error("Error: Solo se permiten archivos de imagen (jpeg, jpg, png, gif)!"))
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter: fileFilter,
})

module.exports = upload
