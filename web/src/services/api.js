"use client"

import axios from "axios"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification"

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

const toast = useToast()

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = "/login"
    } else if (error.response?.status >= 500) {
      toast.error("Error interno del servidor")
    }
    return Promise.reject(error)
  },
)

export default api
