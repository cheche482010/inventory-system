import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Auth/Login.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/",
    component: () => import("@/layouts/DashboardLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/Dashboard/Dashboard.vue"),
      },
      {
        path: "/products",
        name: "Products",
        component: () => import("@/views/Products/Products.vue"),
      },
      {
        path: "/products/create",
        name: "ProductCreate",
        component: () => import("@/views/Products/ProductForm.vue"),
        meta: { requiresRole: ["admin", "dev"] },
      },
      {
        path: "/products/:id/edit",
        name: "ProductEdit",
        component: () => import("@/views/Products/ProductForm.vue"),
        meta: { requiresRole: ["admin", "dev"] },
      },
      {
        path: "/brands",
        name: "Brands",
        component: () => import("@/views/Brands/Brands.vue"),
      },
      {
        path: "/categories",
        name: "Categories",
        component: () => import("@/views/Categories/Categories.vue"),
      },
      {
        path: "/users",
        name: "Users",
        component: () => import("@/views/Users/Users.vue"),
        meta: { requiresRole: ["admin", "dev"] },
      },
      {
        path: "/activities",
        name: "Activities",
        component: () => import("@/views/Activities/Activities.vue"),
        meta: { requiresRole: ["admin", "dev"] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/")
  } else if (to.meta.requiresRole && !to.meta.requiresRole.includes(authStore.user?.role)) {
    next("/")
  } else {
    next()
  }
})

export default router
