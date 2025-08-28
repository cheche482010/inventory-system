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
            { type: 'search', key: 'search', col: 'col-md-3', placeholder: 'Buscar por usuario o total...' },
            { type: 'date', key: 'date', col: 'col-md-3' },
            { type: 'perPage', key: 'perPage', col: 'col-md-2' },
        ]);

        const filteredBudgets = computed(() => {
            let filtered = [...budgets.value];
            
            if (filters.value.search) {
                const searchTerm = filters.value.search.toLowerCase();
                filtered = filtered.filter(budget => {
                    const userName = `${budget.user.firstName} ${budget.user.lastName}`.toLowerCase();
                    const total = calculateTotal(budget.items);
                    const totalBs = rate.value ? (total * rate.value) : 0;
                    
                    return userName.includes(searchTerm) || 
                           total.toString().includes(searchTerm) ||
                           (rate.value && totalBs.toString().includes(searchTerm));
                });
            }
            
            if (filters.value.date) {
                filtered = filtered.filter(budget => {
                    const budgetDate = new Date(budget.updatedAt).toISOString().split('T')[0];
                    return budgetDate === filters.value.date;
                });
            }
            
            return filtered;
        });
        
        const paginatedBudgets = computed(() => {
            if (filters.value.perPage === 'all') {
                return filteredBudgets.value;
            }
            
            const perPage = parseInt(filters.value.perPage);
            const start = (pagination.value.currentPage - 1) * perPage;
            return filteredBudgets.value.slice(start, start + perPage);
        });
        
        const totalPages = computed(() => {
            if (filters.value.perPage === 'all') return 1;
            return Math.ceil(filteredBudgets.value.length / parseInt(filters.value.perPage));
        });
        
        const applyFilters = () => {
            pagination.value.currentPage = 1;
        };

        const clearFilters = () => {
            budgetStore.setFilters({
                search: '',
                date: '',
                perPage: '10',
                sortBy: 'updatedAt',
                sortOrder: 'DESC',
            });
            pagination.value.currentPage = 1;
        };

        const changePage = (page) => {
            pagination.value.currentPage = page;
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
            budgets: paginatedBudgets,
            loading,
            pagination: computed(() => ({
                currentPage: pagination.value.currentPage,
                totalPages: totalPages.value,
                total: filteredBudgets.value.length
            })),
            filters,
            hasNoResults: computed(() => !loading.value && filteredBudgets.value.length === 0),
            showPagination: computed(() => totalPages.value > 1),
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
