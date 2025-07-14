# Inventory System

Sistema de inventario completo para gestión de productos de tienda.

## Estructura del Proyecto

\`\`\`
inventory-system/
├── api/          # Backend Node.js
├── web/          # Frontend Vue.js
└── README.md
\`\`\`

## Instalación y Ejecución

### Backend (API)
\`\`\`bash
cd api
npm install
npm run migrate
npm run seed
npm run dev
\`\`\`

### Frontend (Web)
\`\`\`bash
cd web
npm install
npm run dev
\`\`\`

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
\`\`\`

Ahora creemos el backend completo:
