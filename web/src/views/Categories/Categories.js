import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/products'
import { categoryService } from '@/services/categoryService'
import { useToast } from 'vue-toastification'
import CategoryModal from '@/components/Categories/CategoryModal.vue'

export default {
    name: 'Categories',
    components: {
        CategoryModal
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
            page: 1
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
                }
                if (filters.value.search) params.search = filters.value.search

                const response = await categoryService.getAll({ params })
                
                categories.value = Array.isArray(response.data) ? response.data : []

                if (response.pagination) {
                    const actualItemsPerPage = filters.value.perPage === 'all' ? categories.value.length : Number(filters.value.perPage)
                    const isLastPage = categories.value.length < actualItemsPerPage
                    const currentPage = filters.value.page
                    const actualTotalPages = isLastPage ? currentPage : Math.max(currentPage, Math.ceil(response.pagination.totalItems / actualItemsPerPage))
                    
                    pagination.value = {
                        currentPage: currentPage,
                        totalPages: actualTotalPages,
                        totalItems: response.pagination.totalItems,
                        itemsPerPage: actualItemsPerPage
                    }
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

        // NUEVO: Métodos de filtrado y paginación
        let searchTimeout
        const debouncedSearch = () => {
            clearTimeout(searchTimeout)
            searchTimeout = setTimeout(() => {
                filters.value.page = 1
                loadCategories()
            }, 500)
        }
        const applyFilters = () => {
            filters.value.page = 1
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

        const visiblePages = computed(() => {
            const current = pagination.value.currentPage
            const total = pagination.value.totalPages
            const pages = []
            for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
                pages.push(i)
            }
            return pages
        })

        const showPagination = computed(() => filters.value.perPage !== 'all' && pagination.value.totalPages > 1)

        return {
            categories,
            loading,
            showCreateModal,
            editingCategory,
            canCreate,
            canDelete,
            filters,
            pagination,
            visiblePages,
            showPagination,
            debouncedSearch,
            applyFilters,
            changePage,
            clearFilters,
            getProductCount,
            editCategory,
            confirmDelete,
            closeModal,
            handleSaved,
            formatDate
        }
    }
}