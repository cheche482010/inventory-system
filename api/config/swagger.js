const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory System API",
      version: "1.0.0",
      description:
        "API completa para sistema de inventario de productos con autenticación JWT, roles de usuario y operaciones CRUD",
      contact: {
        name: "API Support",
        email: "support@inventory.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
      {
        url: "https://api.inventory.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Ingresa el token JWT obtenido del endpoint /auth/login",
        },
      },
      schemas: {
        // Common schemas
        Pagination: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              description: "Página actual",
            },
            totalPages: {
              type: "integer",
              description: "Total de páginas",
            },
            totalItems: {
              type: "integer",
              description: "Total de elementos",
            },
            itemsPerPage: {
              type: "integer",
              description: "Elementos por página",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indica si la operación fue exitosa",
            },
            message: {
              type: "string",
              description: "Mensaje descriptivo de la respuesta",
            },
            data: {
              description: "Datos de la respuesta",
            },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Mensaje de error",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Detalles específicos del error",
            },
          },
        },
        // Product schemas
        Product: {
          type: "object",
          required: ["code", "name", "price", "status", "brandId", "categoryId"],
          properties: {
            id: {
              type: "integer",
              description: "ID único del producto",
            },
            code: {
              type: "string",
              description: "Código único del producto",
            },
            name: {
              type: "string",
              description: "Nombre del producto",
            },
            description: {
              type: "string",
              description: "Descripción del producto",
            },
            price: {
              type: "number",
              format: "decimal",
              minimum: 0,
              description: "Precio del producto",
            },
            status: {
              type: "string",
              enum: ["disponible", "nuevo", "oferta", "agotado"],
              description: "Estado del producto",
            },
            brandId: {
              type: "integer",
              description: "ID de la marca",
            },
            categoryId: {
              type: "integer",
              description: "ID de la categoría",
            },
            isActive: {
              type: "boolean",
              description: "Estado activo/inactivo",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
            brand: {
              $ref: "#/components/schemas/Brand",
            },
            category: {
              $ref: "#/components/schemas/Category",
            },
          },
          example: {
            id: 1,
            code: "GD0607",
            name: "AIR MASTER BOOSTER ENCAVA/MITSUBISHI FK617/FK615",
            description: "Booster de aire para vehículos Mitsubishi",
            price: 200.0,
            status: "oferta",
            brandId: 2,
            categoryId: 1,
            isActive: true,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        },
        ProductCreate: {
          type: "object",
          required: ["code", "name", "price", "status", "brandId", "categoryId"],
          properties: {
            code: {
              type: "string",
              description: "Código único del producto",
            },
            name: {
              type: "string",
              description: "Nombre del producto",
            },
            description: {
              type: "string",
              description: "Descripción del producto",
            },
            price: {
              type: "number",
              format: "decimal",
              minimum: 0,
              description: "Precio del producto",
            },
            status: {
              type: "string",
              enum: ["disponible", "nuevo", "oferta", "agotado"],
              description: "Estado del producto",
            },
            brandId: {
              type: "integer",
              description: "ID de la marca",
            },
            categoryId: {
              type: "integer",
              description: "ID de la categoría",
            },
          },
          example: {
            code: "GD9999",
            name: "Nuevo Producto de Prueba",
            description: "Descripción del nuevo producto",
            price: 150.0,
            status: "disponible",
            brandId: 1,
            categoryId: 1,
          },
        },
        // Brand schema
        Brand: {
          type: "object",
          required: ["name"],
          properties: {
            id: {
              type: "integer",
              description: "ID único de la marca",
            },
            name: {
              type: "string",
              description: "Nombre de la marca",
            },
            isActive: {
              type: "boolean",
              description: "Estado activo/inactivo",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
            productCount: {
              type: "integer",
              description: "Número de productos asociados",
            },
          },
          example: {
            id: 1,
            name: "TENKEI",
            isActive: true,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
            productCount: 5,
          },
        },
        // Category schema
        Category: {
          type: "object",
          required: ["name"],
          properties: {
            id: {
              type: "integer",
              description: "ID único de la categoría",
            },
            name: {
              type: "string",
              description: "Nombre de la categoría",
            },
            description: {
              type: "string",
              description: "Descripción de la categoría",
            },
            isActive: {
              type: "boolean",
              description: "Estado activo/inactivo",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
            productCount: {
              type: "integer",
              description: "Número de productos asociados",
            },
          },
          example: {
            id: 1,
            name: "ALTERNADORES",
            description: "Alternadores para vehículos",
            isActive: true,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
            productCount: 3,
          },
        },
        // User schemas
        User: {
          type: "object",
          required: ["email", "firstName", "lastName"],
          properties: {
            id: {
              type: "integer",
              description: "ID único del usuario",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
            },
            firstName: {
              type: "string",
              description: "Nombre del usuario",
            },
            lastName: {
              type: "string",
              description: "Apellido del usuario",
            },
            role: {
              type: "string",
              enum: ["user", "admin", "dev"],
              description: "Rol del usuario",
            },
            isActive: {
              type: "boolean",
              description: "Estado activo/inactivo",
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              description: "Fecha del último login",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
            activityCount: {
              type: "integer",
              description: "Número de actividades registradas",
            },
          },
          example: {
            id: 1,
            email: "admin@inventory.com",
            firstName: "Admin",
            lastName: "System",
            role: "admin",
            isActive: true,
            lastLogin: "2024-01-01T12:00:00.000Z",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
            activityCount: 25,
          },
        },
        // Activity Log schema
        ActivityLog: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID único de la actividad",
            },
            userId: {
              type: "integer",
              description: "ID del usuario que realizó la acción",
            },
            action: {
              type: "string",
              enum: ["CREATE", "UPDATE", "DELETE"],
              description: "Tipo de acción realizada",
            },
            resource: {
              type: "string",
              enum: ["PRODUCT", "BRAND", "CATEGORY", "USER"],
              description: "Recurso afectado",
            },
            resourceId: {
              type: "integer",
              description: "ID del recurso afectado",
            },
            details: {
              type: "object",
              description: "Detalles técnicos de la operación",
            },
            ipAddress: {
              type: "string",
              description: "Dirección IP del usuario",
            },
            userAgent: {
              type: "string",
              description: "User Agent del navegador",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de la actividad",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
          example: {
            id: 1,
            userId: 1,
            action: "CREATE",
            resource: "PRODUCT",
            resourceId: 1,
            details: {
              method: "POST",
              url: "/api/products",
              body: { code: "GD9999", name: "Nuevo Producto" },
            },
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0...",
            createdAt: "2024-01-01T12:00:00.000Z",
          },
        },
        // Auth schemas
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
            },
            password: {
              type: "string",
              description: "Contraseña del usuario",
            },
          },
          example: {
            email: "admin@inventory.com",
            password: "admin123",
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login exitoso",
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "JWT token para autenticación",
                },
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Endpoints de autenticación y autorización",
      },
      {
        name: "Products",
        description: "Gestión de productos del inventario",
      },
      {
        name: "Brands",
        description: "Gestión de marcas de productos",
      },
      {
        name: "Categories",
        description: "Gestión de categorías de productos",
      },
      {
        name: "Users",
        description: "Administración de usuarios del sistema",
      },
      {
        name: "Activities",
        description: "Bitácora de actividades del sistema",
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
}

const specs = swaggerJsdoc(options)

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
}
