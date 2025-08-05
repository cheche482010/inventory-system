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
        async approveBudget(id) {
            this.loading = true;
            try {
                await budgetService.approve(id);
                this.toast.success('Presupuesto aprobado');
                this.fetchBudgets(); // Refresh the list
            } catch (error) {
                this.toast.error('Error al aprobar el presupuesto');
            } finally {
                this.loading = false;
            }
        },
        async rejectBudget(id) {
            this.loading = true;
            try {
                await budgetService.reject(id);
                this.toast.warning('Presupuesto rechazado');
                this.fetchBudgets(); // Refresh the list
            } catch (error) {
                this.toast.error('Error al rechazar el presupuesto');
            } finally {
                this.loading = false;
            }
        },
    },
});
