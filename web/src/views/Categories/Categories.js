import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'
import { categoryService } from '@/services/categoryService'
import { useToast } from 'vue-toastification'
import CategoryModal from '@/components/Categories/CategoryModal.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import FilterSection from '@/components/FilterSection/FilterSection.vue'

export default {
    name: 'Categories',
    components: {
        CategoryModal,
        Pagination,
        FilterSection,
    },
    setup() {
        const authStore = useAuthStore()
        const toast = useToast()

        const categories = ref([])
        const loading = ref(false)
        const showCreateModal = ref(false)
        const editingCategory = ref(null)

        const filters = ref({
            search: "",
            perPage: "10",
            page: 1,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        })

        const pagination = ref({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10
        })

        const canCreate = computed(() => authStore.hasPermission('categories:create'))
        const canDelete = computed(() => authStore.hasPermission('categories:delete'))

        const loadCategories = async () => {
            loading.value = true
            try {
                const params = {
                    page: filters.value.page,
                    limit: filters.value.perPage === 'all' ? 9999 : Number(filters.value.perPage),
                    sortBy: filters.value.sortBy,
                    sortOrder: filters.value.sortOrder,
                }
                if (filters.value.search) params.search = filters.value.search

                const response = await categoryService.getAll({ params })

                categories.value = Array.isArray(response.data) ? response.data : []

                if (response.pagination) {
                    pagination.value = response.pagination
                } else {
                    pagination.value = {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: categories.value.length,
                        itemsPerPage: categories.value.length
                    }
                }
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    categories.value = []
                    pagination.value = {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 0,
                        itemsPerPage: 10
                    }
                } else {
                    console.log(error)
                    toast.error('Error al cargar categorías')
                }
            } finally {
                loading.value = false
            }
        }

        const filterConfig = computed(() => [
            { type: 'search', key: 'search', col: 'col-md-4' },
            { type: 'perPage', key: 'perPage', col: 'col-md-2' },
        ]);

        const applyFilters = () => {
            filters.value.page = 1
            loadCategories()
        }

        const sort = (field) => {
            if (filters.value.sortBy === field) {
                filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
            } else {
                filters.value.sortBy = field
                filters.value.sortOrder = 'asc'
            }
            loadCategories()
        }
        const changePage = (page) => {
            if (page >= 1 && page <= pagination.value.totalPages) {
                filters.value.page = page
                loadCategories()
            }
        }
        const clearFilters = () => {
            filters.value = {
                search: "",
                perPage: "10",
                page: 1
            }
            loadCategories()
        }

        // NUEVO: Usar productCount del backend
        const getProductCount = (category) => {
            return category.productCount ?? 0
        }

        const editCategory = (category) => {
            editingCategory.value = category
        }

        const confirmDelete = async (category) => {
            Swal.fire({
                title: `¿Estás seguro de eliminar la categoría "${category.name}"?`,
                text: "No podrás revertir esta acción.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await categoryService.delete(category.id)
                        toast.success('Categoría eliminada exitosamente')
                        loadCategories()
                    } catch (error) {
                        toast.error('Error al eliminar categoría')
                    }
                }
            });
        }

        const closeModal = () => {
            showCreateModal.value = false
            editingCategory.value = null
        }

        const handleSaved = () => {
            closeModal()
            loadCategories()
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('es-ES')
        }

        onMounted(() => {
            loadCategories()
        })

        const showPagination = computed(() => filters.value.perPage !== 'all' && pagination.value.totalPages > 1)

        const getRowNumber = (index) => {
            if (filters.value.perPage === 'all') {
                return index + 1
            }
            return (pagination.value.currentPage - 1) * pagination.value.itemsPerPage + index + 1
        }

        return {
            categories,
            loading,
            showCreateModal,
            editingCategory,
            canCreate,
            canDelete,
            filters,
            pagination,
            showPagination,
            applyFilters,
            changePage,
            clearFilters,
            getProductCount,
            editCategory,
            confirmDelete,
            closeModal,
            handleSaved,
            formatDate,
            sort,
            filterConfig,
            getRowNumber,
        }
    }
}