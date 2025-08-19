import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/Login.vue"),
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
        meta: { requiresRole: ["admin", "dev"] },
      },
      {
        path: "/products",
        name: "Products",
        component: () => import("@/views/Products/Products.vue"),
      },
      {
        path: "/cart",
        name: "Cart",
        component: () => import("@/views/Cart/Cart.vue"),
        meta: { requiresRole: ["user"] },
      },
      {
        path: "/my-requests",
        name: "MyRequests",
        component: () => import("@/views/MyRequests/MyRequests.vue"),
        meta: { requiresRole: ["user"] },
      },
      {
        path: "/brands",
        name: "Brands",
        component: () => import("@/views/Brands/Brands.vue"),
        meta: { requiresRole: ["admin", "dev"] },
      },
      {
        path: "/categories",
        name: "Categories",
        component: () => import("@/views/Categories/Categories.vue"),
        meta: { requiresRole: ["admin", "dev"] },
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
      {
        path: "/permissions",
        name: "Permissions",
        component: () => import("@/views/Permissions/Permissions.vue"),
        meta: { requiresRole: ["dev"] },
      },
      {
        path: "/import",
        name: "Import",
        component: () => import("@/views/Import/Import.vue"),
        meta: { requiresRole: ["dev"] },
      },
      {
        path: "/budgets",
        name: "Budgets",
        component: () => import("@/views/Budgets/Budgets.vue"),
        meta: { requiresRole: ["admin", "dev"] },
      },
    ],
  },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("@/views/Errors/403/403.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("@/views/Errors/404/404.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // If we have a token but no user data, fetch it first
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next(authStore.initialRoute)
  } else if (to.path === "/" && authStore.user?.role === "user") {
    next("/products")
  } else if (to.meta.requiresRole && !to.meta.requiresRole.includes(authStore.user?.role)) {
    next("/403")
  } else {
    next()
  }
})

export default router
