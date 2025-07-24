import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/products'
import api from '@/services/api'

export default {
    name: 'Dashboard',
    setup() {
        const authStore = useAuthStore()
        const productStore = useProductStore()

        const loading = ref(true)
        const stats = ref({
            totalProducts: 0,
            availableProducts: 0,
            lowStockProducts: 0,
            totalBrands: 0
        })
        const recentProducts = ref([])
        const recentActivities = ref([])

        const user = computed(() => authStore.user)
        const hasNoRecentProducts = computed(() => !loading.value && recentProducts.value.length === 0)
        const hasNoRecentActivities = computed(() => !loading.value && recentActivities.value.length === 0)

        const loadDashboardData = async () => {
            loading.value = true
            try {
                // Load recent products
                await productStore.fetchProducts({ limit: 5 })
                recentProducts.value = productStore.products

                // Load stats (mock data for now)
                stats.value = {
                    totalProducts: productStore.pagination.totalItems,
                    availableProducts: productStore.products.filter(p => p.status === 'disponible').length,
                    lowStockProducts: productStore.products.filter(p => p.status === 'agotado').length,
                    totalBrands: 5 // This would come from a brands endpoint
                }

                // Load recent activities if user has permission
                if (['admin', 'dev'].includes(authStore.user?.role)) {
                    const response = await api.get('/activities', { params: { limit: 5 } })
                    recentActivities.value = response.data
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                loading.value = false
            }
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        onMounted(() => {
            loadDashboardData()
        })

        return {
            user,
            loading,
            stats,
            recentProducts,
            recentActivities,
            formatDate,
            hasNoRecentProducts,
            hasNoRecentActivities
        }
    }
}