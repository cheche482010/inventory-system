<template>
  <div class="dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Dashboard</h1>
      <div class="text-muted">
        Bienvenido, {{ user?.firstName }}
      </div>
    </div>

    <div class="row">
      <div class="col-md-3 mb-4">
        <div class="card text-center">
          <div class="card-body">
            <font-awesome-icon icon="box" class="fa-2x text-primary mb-3" />
            <h5 class="card-title">{{ stats.totalProducts }}</h5>
            <p class="card-text text-muted">Total Productos</p>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card text-center">
          <div class="card-body">
            <font-awesome-icon icon="check" class="fa-2x text-success mb-3" />
            <h5 class="card-title">{{ stats.availableProducts }}</h5>
            <p class="card-text text-muted">Disponibles</p>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card text-center">
          <div class="card-body">
            <font-awesome-icon icon="exclamation-triangle" class="fa-2x text-warning mb-3" />
            <h5 class="card-title">{{ stats.lowStockProducts }}</h5>
            <p class="card-text text-muted">Stock Bajo</p>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card text-center">
          <div class="card-body">
            <font-awesome-icon icon="tags" class="fa-2x text-info mb-3" />
            <h5 class="card-title">{{ stats.totalBrands }}</h5>
            <p class="card-text text-muted">Marcas</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Productos Recientes</h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="loading-spinner">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in recentProducts" :key="product.id">
                      <td>{{ product.code }}</td>
                      <td>{{ product.name.substring(0, 50) }}...</td>
                      <td>
                        <span :class="`status-badge ${product.status}`">
                          {{ product.status }}
                        </span>
                      </td>
                      <td>${{ product.price }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Actividad Reciente</h5>
          </div>
          <div class="card-body">
            <div class="list-group list-group-flush">
              <div v-for="activity in recentActivities" :key="activity.id" class="list-group-item px-0">
                <div class="d-flex justify-content-between">
                  <small class="text-muted">{{ activity.action }}</small>
                  <small class="text-muted">{{ formatDate(activity.createdAt) }}</small>
                </div>
                <div>{{ activity.user?.firstName }} {{ activity.user?.lastName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      formatDate
    }
  }
}
</script>
