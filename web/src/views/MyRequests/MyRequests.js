import { onMounted, ref, computed } from 'vue';
import { useBudgetStore } from '@/stores/budgets';
import { useDolarStore } from '@/stores/dolar';
import { useAuthStore } from '@/stores/auth';
import { budgetService } from '@/services/budgetService';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';
import { formatCurrency } from '@/helpers/formatHelper';
import FilterSection from '@/components/FilterSection/FilterSection.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

export default {
    name: 'MyRequests',
    components: {
        FilterSection,
        Pagination,
    },
    setup() {
        const budgetStore = useBudgetStore();
        const { budgets: myBudgets, loading, pagination, filters, hasNoResults, showPagination } = storeToRefs(budgetStore);
        const dolarStore = useDolarStore();
        const { rate } = storeToRefs(dolarStore);
        const authStore = useAuthStore();
        const { userRole } = storeToRefs(authStore);
        const selectedBudget = ref(null);

        const filterConfig = computed(() => [
            { type: 'search', key: 'search', col: 'col-md-4', placeholder: 'Buscar por ID...' },
            { type: 'perPage', key: 'perPage', col: 'col-md-2' },
        ]);

        const applyFilters = () => {
            budgetStore.fetchBudgets(true);
        };

        const clearFilters = () => {
            budgetStore.setFilters({
                search: '',
                perPage: 10,
                sortBy: 'updatedAt',
                sortOrder: 'DESC',
            });
            budgetStore.fetchBudgets(true);
        };

        const changePage = (page) => {
            budgetStore.setPage(page);
            budgetStore.fetchBudgets(true);
        };

        const sort = (field) => {
            const newSortOrder = filters.value.sortBy === field && filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
            budgetStore.setFilters({ ...filters.value, sortBy: field, sortOrder: newSortOrder });
            budgetStore.fetchBudgets(true);
        };

        onMounted(() => {
            budgetStore.fetchBudgets(true);
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
                // In MyRequests, users are never admin/dev, so they always get PDF
                // However, we need the full budget object for PDF generation
                const fullBudget = await budgetService.getBudget(budget.id);
                await budgetService.generateBudgetPdf(fullBudget.data, rate.value);
            } catch (error) {
                console.error('Error al descargar el PDF:', error);
                Swal.fire('Error', 'No se pudo descargar el PDF.', 'error');
            }
        };

        return {
            myBudgets,
            loading,
            pagination,
            filters,
            hasNoResults,
            showPagination,
            selectedBudget,
            rate,
            filterConfig,
            calculateTotal,
            viewBudget,
            download,
            formatCurrency,
            applyFilters,
            clearFilters,
            changePage,
            sort,
        };
    },
};
