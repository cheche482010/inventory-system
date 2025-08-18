import { defineStore } from 'pinia';
import { budgetService } from '@/services/budgetService';
import { useToast } from 'vue-toastification';

export const useBudgetStore = defineStore('budgets', {
    state: () => ({
        budgets: [],
        loading: false,
        toast: useToast(),
    }),
    actions: {
        async fetchBudgets() {
            this.loading = true;
            try {
                const response = await budgetService.getAll();
                this.budgets = response.data;
            } catch (error) {
                this.toast.error('Error al obtener las solicitudes');
            } finally {
                this.loading = false;
            }
        },
    },
});
