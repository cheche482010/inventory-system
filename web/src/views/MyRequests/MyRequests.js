import { onMounted, ref } from 'vue';
import { budgetService } from '@/services/budgetService';
import Swal from 'sweetalert2';

export default {
    name: 'MyRequests',
    setup() {
        const myBudgets = ref([]);
        const loading = ref(false);
        const selectedBudget = ref(null);

        const fetchMyBudgets = async () => {
            loading.value = true;
            try {
                const response = await budgetService.getMyBudgets();
                myBudgets.value = response.data;
            } catch (error) {
                Swal.fire('Error', 'No se pudieron cargar tus solicitudes.', 'error');
            } finally {
                loading.value = false;
            }
        };

        onMounted(fetchMyBudgets);

        const calculateTotal = (items) => {
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        };

        const viewBudget = (budget) => {
            selectedBudget.value = budget;
        };

        const download = async (id) => {
            try {
                await budgetService.downloadPdf(id);
            } catch (error) {
                console.error('Error al descargar el PDF:', error);
                Swal.fire('Error', 'No se pudo descargar el PDF.', 'error');
            }
        };

        return {
            myBudgets,
            loading,
            selectedBudget,
            calculateTotal,
            viewBudget,
            download,
        };
    },
};
