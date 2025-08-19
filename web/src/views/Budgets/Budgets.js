import { onMounted, ref } from 'vue';
import { useBudgetStore } from '@/stores/budgets';
import { useDolarStore } from '@/stores/dolar';
import { budgetService } from '@/services/budgetService';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';
import { formatCurrency } from '@/helpers/formatHelper';

export default {
    name: 'BudgetsView',
    setup() {
        const budgetStore = useBudgetStore();
        const { budgets, loading } = storeToRefs(budgetStore);
        const dolarStore = useDolarStore();
        const { rate } = storeToRefs(dolarStore);
        const selectedBudget = ref(null);

        onMounted(() => {
            budgetStore.fetchBudgets();
            dolarStore.fetchDolarRate();
        });


        const calculateTotal = (items) => {
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        };

        const viewBudget = (budget) => {
            selectedBudget.value = budget;
        };

        const download = async (budget) => {
            try {
                budgetService.generateBudgetPdf(budget, rate.value);
            } catch (error) {
                console.error('Error al descargar el PDF:', error);
                Swal.fire('Error', 'No se pudo descargar el PDF.', 'error');
            }
        };

        return {
            budgets,
            loading,
            selectedBudget,
            rate,
            calculateTotal,
            viewBudget,
            download,
            formatCurrency,
        };
    },
};
