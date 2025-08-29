import { defineStore } from 'pinia';
import { budgetService } from '@/services/budgetService';
import { useToast } from 'vue-toastification';

export const useBudgetStore = defineStore('budgets', {
    state: () => ({
        budgets: [],
        loading: false,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            total: 0,
        },
        filters: {
            search: '',
            date: '',
            perPage: '10',
            sortBy: 'updatedAt',
            sortOrder: 'DESC',
        },
        toast: useToast(),
    }),
    getters: {
        hasNoResults: (state) => {
            return !state.loading && state.budgets.length === 0;
        },
        showPagination: (state) => {
            return state.pagination.total > state.filters.perPage;
        }
    },
    actions: {
        async fetchBudgets(isMyRequests = false) {
            this.loading = true;
            try {
                const service = isMyRequests ? budgetService.getMyBudgets : budgetService.getAll;
                const params = { ...this.filters, perPage: 'all' };
                const response = await service(params);
                this.budgets = response.data.budgets;
                this.pagination.total = response.data.total;
                this.pagination.currentPage = response.data.currentPage;
                this.pagination.totalPages = response.data.totalPages;
            } catch (error) {
                this.toast.error('Error al obtener las solicitudes');
            } finally {
                this.loading = false;
            }
        },
        setFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
        },
        setPage(page) {
            this.pagination.currentPage = page;
            this.filters.page = page;
        },
    },
});
