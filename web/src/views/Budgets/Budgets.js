import { onMounted, ref } from 'vue';
import { useBudgetStore } from '@/stores/budgets';
import { budgetService } from '@/services/budgetService';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

export default {
    name: 'BudgetsView',
    setup() {
        const budgetStore = useBudgetStore();
        const { budgets, loading } = storeToRefs(budgetStore);
        const selectedBudget = ref(null);

        onMounted(() => {
            budgetStore.fetchBudgets();
        });


        const calculateTotal = (items) => {
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        };

        const viewBudget = (budget) => {
            selectedBudget.value = budget;
        };

        const download = async (budget) => {
            try {
                budgetService.generateBudgetPdf(budget);
            } catch (error) {
                console.error('Error al descargar el PDF:', error);
                Swal.fire('Error', 'No se pudo descargar el PDF.', 'error');
            }
        };

        return {
            budgets,
            loading,
            selectedBudget,
            calculateTotal,
            viewBudget,
            download,
        };
    },
};
