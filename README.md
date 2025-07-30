# Inventory System

Sistema de inventario completo para gestión de productos de tienda.

## Estructura del Proyecto

```
inventory-system/
├── api/                          # Backend Node.js
│   ├── config/                   # Configuraciones
│   │   ├── database.js           # Config base de datos
│   │   └── swagger.js            # Config documentación API
│   ├── helpers/                  # Funciones auxiliares
│   │   ├── responseHelper.js     # Respuestas estandarizadas
│   │   └── validationHelper.js   # Validaciones
│   ├── middleware/               # Middlewares
│   │   ├── activityLogger.js     # Log de actividades
│   │   ├── auth.js               # Autenticación JWT
│   │   └── errorHandler.js       # Manejo de errores
│   ├── migrations/               # Migraciones de BD
│   ├── models/                   # Modelos Sequelize
│   │   ├── ActivityLog.js
│   │   ├── Brand.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/                   # Rutas de la API
│   │   ├── activities.js
│   │   ├── auth.js
│   │   ├── brands.js
│   │   ├── categories.js
│   │   ├── products.js
│   │   ├── users.js
│   │   └── index.js
│   ├── seeders/                  # Datos iniciales
│   ├── .sequelizerc             # Config Sequelize CLI
│   ├── package.json
│   └── server.js                 # Servidor principal
├── web/                          # Frontend Vue.js
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles/
│   │   │       └── main.scss     # Estilos globales
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── Activities/
│   │   │   ├── Brands/
│   │   │   ├── Categories/
│   │   │   ├── Products/
│   │   │   └── Users/
│   │   ├── layouts/
│   │   │   └── DashboardLayout.vue
│   │   ├── router/
│   │   │   └── index.js          # Configuración rutas
│   │   ├── services/             # Servicios API
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── brandService.js
│   │   │   ├── categoryService.js
│   │   │   ├── productService.js
│   │   │   └── userService.js
│   │   ├── stores/               # Estado global (Pinia)
│   │   │   ├── auth.js
│   │   │   └── products.js
│   │   ├── views/                # Páginas principales
│   │   │   ├── Activities/
│   │   │   ├── Brands/
│   │   │   ├── Categories/
│   │   │   ├── Dashboard/
│   │   │   ├── Errors/
│   │   │   ├── Login/
│   │   │   ├── Products/
│   │   │   └── Users/
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Instalación y Ejecución

### Backend (API)
```bash
cd api
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend (Web)
```bash
cd web
npm install
npm run dev
```

## Características

### Backend
- Node.js + Express
- MySQL + Sequelize ORM
- JWT Authentication
- Swagger Documentation
- Seguridad anti-inyecciones SQL
- Middleware de seguridad
- Migraciones y seeders

### Frontend
- Vue 3 + Vite
- Bootstrap 5
- Pinia (State Management)
- Vue Router
- SCSS + Variables globales
- Componentes modulares
- Toast notifications
- FontAwesome icons

## Usuarios por Defecto

- **Admin**: admin@inventory.com / admin123
- **User**: user@inventory.com / user123
- **Dev**: dev@inventory.com / dev123