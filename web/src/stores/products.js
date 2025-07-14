"use client"

import { defineStore } from "pinia"
import { productService } from "@/services/productService"
import { useToast } from "vue-toastification"

const toast = useToast()

export const useProductStore = defineStore("products", {
  state: () => ({
    products: [],
    currentProduct: null,
    loading: false,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
    filters: {
      search: "",
      status: "",
      brandId: "",
      categoryId: "",
    },
  }),

  actions: {
    async fetchProducts(params = {}) {
      this.loading = true
      try {
        const response = await productService.getAll({
          ...this.filters,
          page: this.pagination.currentPage,
          limit: this.pagination.itemsPerPage,
          ...params,
        })
        this.products = response.data
        this.pagination = response.pagination
      } catch (error) {
        toast.error("Error al cargar productos")
      } finally {
        this.loading = false
      }
    },

    async fetchProduct(id) {
      this.loading = true
      try {
        const response = await productService.getById(id)
        this.currentProduct = response.data
        return response.data
      } catch (error) {
        toast.error("Error al cargar producto")
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProduct(productData) {
      this.loading = true
      try {
        const response = await productService.create(productData)
        toast.success("Producto creado exitosamente")
        await this.fetchProducts()
        return response.data
      } catch (error) {
        toast.error(error.response?.data?.message || "Error al crear producto")
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id, productData) {
      this.loading = true
      try {
        const response = await productService.update(id, productData)
        toast.success("Producto actualizado exitosamente")
        await this.fetchProducts()
        return response.data
      } catch (error) {
        toast.error(error.response?.data?.message || "Error al actualizar producto")
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id) {
      try {
        await productService.delete(id)
        toast.success("Producto eliminado exitosamente")
        await this.fetchProducts()
      } catch (error) {
        toast.error("Error al eliminar producto")
        throw error
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.currentPage = 1
    },

    setPage(page) {
      this.pagination.currentPage = page
    },
  },
})
