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

        const download = async (id) => {
            try {
                const response = await budgetService.downloadPdf(id);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `presupuesto-${id}.pdf`;
                link.click();
                window.URL.revokeObjectURL(link.href);
            } catch (error) {
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
