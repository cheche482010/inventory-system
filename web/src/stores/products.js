import { defineStore } from 'pinia';
import { productService } from '@/services/productService';
import { useToast } from 'vue-toastification';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    pagination: {},
    filters: {
      search: '',
      status: '',
      brandId: '',
      categoryId: '',
      perPage: '10',
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    loading: false,
    toast: useToast(),
  }),
  getters: {
    hasNoResults: (state) => state.products.length === 0 && !state.loading,
    showPagination: (state) => state.filters.perPage !== 'all' && state.pagination.totalPages > 1,
  },
  actions: {
    async fetchProducts() {
      this.loading = true;
      try {
        const params = { ...this.filters };
        if (!params.page) params.page = 1;
        const response = await productService.getAll(params);
        this.products = response.data;
        this.pagination = response.pagination;
      } catch (error) {
        this.toast.error('Error al obtener productos');
      } finally {
        this.loading = false;
      }
    },
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },
    setPage(page) {
      this.filters.page = page;
    },
    async deleteProduct(productId) {
      try {
        await productService.delete(productId);
        this.toast.success('Producto eliminado exitosamente');
        this.fetchProducts();
      } catch (error) {
        this.toast.error('Error al eliminar producto');
      }
    },
  },
});
