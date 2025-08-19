"use client"

import { defineStore } from "pinia"
import { authService } from "@/services/authService"
import { userPermissionService } from "@/services/userPermissionService"
import { useToast } from "vue-toastification"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token"),
    permissions: [],
    loading: false,
    toast: useToast(),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,

    // Permisos basados en la base de datos
    hasPermission: (state) => (permissionName) => {
      if (state.user?.role === 'dev') return true;
      return state.permissions.some(p => p.name === permissionName);
    },
    
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
        await this.fetchPermissions()
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
        await this.fetchPermissions()
      } catch (error) {
        this.logout()
      }
    },

    async fetchPermissions() {
      if (!this.user) return
      try {
        const response = await userPermissionService.getPermissions(this.user.id)
        this.permissions = response.data
      } catch (error) {
        this.toast.error("Error al obtener permisos")
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.permissions = []
      localStorage.removeItem("token")
      this.toast.info("Sesión cerrada")
    },
  },
})
