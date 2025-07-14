import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import ActivityDetailsModal from '@/components/Activities/ActivityDetailsModal.vue'

export default {
    name: 'Activities',
    components: {
        ActivityDetailsModal
    },
    setup() {
        const toast = useToast()

        const activities = ref([])
        const loading = ref(false)
        const selectedActivity = ref(null)
        const pagination = ref({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 20
        })
        const filters = ref({
            action: '',
            resource: ''
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

        const loadActivities = async () => {
            loading.value = true
            try {
                const params = {
                    page: pagination.value.currentPage,
                    limit: pagination.value.itemsPerPage,
                    ...filters.value
                }

                const response = await api.get('/activities', { params })
                activities.value = response.data
                pagination.value = response.pagination
            } catch (error) {
                toast.error('Error al cargar actividades')
            } finally {
                loading.value = false
            }
        }

        const getActionBadgeColor = (action) => {
            const colors = {
                CREATE: 'success',
                UPDATE: 'warning',
                DELETE: 'danger'
            }
            return colors[action] || 'secondary'
        }

        const getActionLabel = (action) => {
            const labels = {
                CREATE: 'Crear',
                UPDATE: 'Actualizar',
                DELETE: 'Eliminar'
            }
            return labels[action] || action
        }

        const getResourceLabel = (resource) => {
            const labels = {
                PRODUCT: 'Producto',
                BRAND: 'Marca',
                CATEGORY: 'Categoría',
                USER: 'Usuario'
            }
            return labels[resource] || resource
        }

        const viewDetails = (activity) => {
            selectedActivity.value = activity
        }

        const applyFilters = () => {
            pagination.value.currentPage = 1
            loadActivities()
        }

        const changePage = (page) => {
            if (page >= 1 && page <= pagination.value.totalPages) {
                pagination.value.currentPage = page
                loadActivities()
            }
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }

        onMounted(() => {
            loadActivities()
        })

        return {
            activities,
            loading,
            selectedActivity,
            pagination,
            filters,
            visiblePages,
            getActionBadgeColor,
            getActionLabel,
            getResourceLabel,
            viewDetails,
            applyFilters,
            changePage,
            formatDate
        }
    }
}