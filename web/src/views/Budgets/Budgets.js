import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
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
    name: 'BudgetsView',
    components: {
        FilterSection,
        Pagination,
    },
    setup() {
        const budgetStore = useBudgetStore();
        const { budgets, loading, pagination, filters, hasNoResults, showPagination } = storeToRefs(budgetStore);
        const dolarStore = useDolarStore();
        const { rate } = storeToRefs(dolarStore);
        const authStore = useAuthStore();
        const { userRole } = storeToRefs(authStore);
        const selectedBudget = ref(null);
        const route = useRoute();
        const highlightedBudgetId = ref(null);

        const filterConfig = computed(() => [
            { type: 'search', key: 'search', col: 'col-md-4', placeholder: 'Buscar por usuario...' },
            { type: 'perPage', key: 'perPage', col: 'col-md-2' },
        ]);

        const applyFilters = () => {
            budgetStore.fetchBudgets();
        };

        const clearFilters = () => {
            budgetStore.setFilters({
                search: '',
                perPage: 10,
                sortBy: 'updatedAt',
                sortOrder: 'DESC',
            });
            budgetStore.fetchBudgets();
        };

        const changePage = (page) => {
            budgetStore.setPage(page);
            budgetStore.fetchBudgets();
        };

        const sort = (field) => {
            const newSortOrder = filters.value.sortBy === field && filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
            budgetStore.setFilters({ ...filters.value, sortBy: field, sortOrder: newSortOrder });
            budgetStore.fetchBudgets();
        };

        const setHighlightedBudget = () => {
            const budgetId = route.query.highlight;
            if (budgetId) {
                highlightedBudgetId.value = parseInt(budgetId, 10);
            }
        };

        onMounted(() => {
            budgetStore.fetchBudgets();
            dolarStore.fetchDolarRate();
            setHighlightedBudget();
        });

        watch(() => route.query.highlight, () => {
            setHighlightedBudget();
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
            pagination,
            filters,
            hasNoResults,
            showPagination,
            selectedBudget,
            rate,
            filterConfig,
            highlightedBudgetId,
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
