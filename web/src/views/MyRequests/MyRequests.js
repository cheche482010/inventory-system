import { onMounted, ref } from 'vue';
import { budgetService } from '@/services/budgetService';
import { useDolarStore } from '@/stores/dolar';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';
import { formatCurrency } from '@/helpers/formatHelper';

export default {
    name: 'MyRequests',
    setup() {
        const myBudgets = ref([]);
        const loading = ref(false);
        const selectedBudget = ref(null);
        const dolarStore = useDolarStore();
        const { rate } = storeToRefs(dolarStore);

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

        onMounted(() => {
            fetchMyBudgets();
            dolarStore.fetchDolarRate();
        });

        const calculateTotal = (items) => {
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        };

        const viewBudget = (budget) => {
            selectedBudget.value = budget;
        };

        const download = async (id) => {
            try {
                await budgetService.downloadPdf(id, rate.value);
            } catch (error) {
                console.error('Error al descargar el PDF:', error);
                Swal.fire('Error', 'No se pudo descargar el PDF.', 'error');
            }
        };

        return {
            myBudgets,
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
