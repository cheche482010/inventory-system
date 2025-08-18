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

        const statusColor = (status) => {
            const colors = {
                submitted: 'warning',
                approved: 'success',
                rejected: 'danger',
            };
            return colors[status] || 'secondary';
        };

        const calculateTotal = (items) => {
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        };

        const viewBudget = (budget) => {
            selectedBudget.value = budget;
        };

        const approve = (id) => {
            Swal.fire({
                title: '¿Aprobar este presupuesto?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, aprobar',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    budgetStore.approveBudget(id);
                }
            });
        };

        const download = async (budget) => {
            try {
                budgetService.generateBudgetPdf(budget);
            } catch (error) {
                console.error('Error al descargar el PDF:', error);
                Swal.fire('Error', 'No se pudo descargar el PDF.', 'error');
            }
        };

        const reject = (id) => {
            Swal.fire({
                title: '¿Rechazar este presupuesto?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, rechazar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#d33',
            }).then((result) => {
                if (result.isConfirmed) {
                    budgetStore.rejectBudget(id);
                }
            });
        };

        return {
            budgets,
            loading,
            selectedBudget,
            statusColor,
            calculateTotal,
            viewBudget,
            approve,
            reject,
            download,
        };
    },
};
