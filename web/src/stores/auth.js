"use client"

import { defineStore } from "pinia"
import { authService } from "@/services/authService"
import { useToast } from "vue-toastification"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token"),
    loading: false,
    toast: useToast(),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,

    // Permisos basados en rol
    canCreate: (state) => ["admin", "dev"].includes(state.user?.role),
    canDelete: (state) => state.user?.role === "dev",
    canExportPdf: (state) => state.user?.role === "admin",
    canViewUsers: (state) => ["admin", "dev"].includes(state.user?.role),
    canViewActivities: (state) => ["admin", "dev"].includes(state.user?.role),
    canViewPermissions: (state) => state.user?.role === "dev",
    canViewDashboard: (state) => ["admin", "dev"].includes(state.user?.role),
    canImport: (state) => ["dev"].includes(state.user?.role),
    canExport: (state) => ["admin", "dev"].includes(state.user?.role),
    
    // Ruta inicial basada en rol
    initialRoute: (state) => {
      if (!state.user) return "/login"

      switch (state.user.role) {
        case "user":
          return "/products"
        case "admin":
        case "dev":
          return "/"
        default:
          return "/products"
      }
    },
  },

  actions: {
    async login(credentials) {
      this.loading = true
      try {
        const response = await authService.login(credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem("token", this.token)
        this.toast.success("Inicio de sesión exitoso")
        return response
      } catch (error) {
        this.toast.error(error.response?.data?.message || "Error en el login")
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const response = await authService.me()
        this.user = response.data
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem("token")
      this.toast.info("Sesión cerrada")
    },
  },
})
