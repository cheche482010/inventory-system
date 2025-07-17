"use client"

import { defineStore } from "pinia"
import { authService } from "@/services/authService"
import { useToast } from "vue-toastification"

const toast = useToast()

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token"),
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
    canCreate: (state) => ["admin", "dev"].includes(state.user?.role),
    canDelete: (state) => ["admin", "dev"].includes(state.user?.role),
  },

  actions: {
    async login(credentials) {
      this.loading = true
      try {
        const response = await authService.login(credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem("token", this.token)
        toast.success("Inicio de sesión exitoso")
        return response
      } catch (error) {
        toast.error(error.response?.data?.message || "Error en el login")
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
      toast.info("Sesión cerrada")
    },
  },
})
