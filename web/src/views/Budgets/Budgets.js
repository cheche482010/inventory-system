import { onMounted, ref } from 'vue';
import { useBudgetStore } from '@/stores/budgets';
import { useDolarStore } from '@/stores/dolar';
import { useAuthStore } from '@/stores/auth';
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
        const authStore = useAuthStore();
        const { userRole } = storeToRefs(authStore);
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
                if (userRole.value === 'admin' || userRole.value === 'dev') {
                    await budgetService.downloadBudgetExcel(budget.id);
                } else {
                    budgetService.generateBudgetPdf(budget, rate.value);
                }
            } catch (error) {
                console.error('Error al descargar el archivo:', error);
                Swal.fire('Error', 'No se pudo descargar el archivo.', 'error');
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
