"use client"

import axios from "axios"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification"

const toast = useToast()

const url = import.meta.env.NODE_ENV === "production"
  ? `${import.meta.env.PROD_BACKEND_URL}/api`
  : `${import.meta.env.LOCAL_BACKEND_URL}/api`

const api = axios.create({
  baseURL: url,
  timeout: 10000,
  withCredentials: true
})

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
