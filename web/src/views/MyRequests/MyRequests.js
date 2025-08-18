import { onMounted, ref, computed } from 'vue';
import { budgetService } from '@/services/budgetService';
import Swal from 'sweetalert2';

export default {
    name: 'MyRequests',
    setup() {
        const myBudgets = ref([]);
        const loading = ref(false);

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
                console.error('Error al descargar el PDF:', error);
                Swal.fire('Error', 'No se pudo descargar el PDF.', 'error');
            }
        };

        return {
            myBudgets,
            loading,
            statusColor,
            calculateTotal,
            download,
        };
    },
};
