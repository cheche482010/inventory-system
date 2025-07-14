<template>
  <div class="activities">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Bitácora de Actividades</h1>
      <div class="d-flex gap-2">
        <select class="form-select" v-model="filters.action" @change="applyFilters">
          <option value="">Todas las acciones</option>
          <option value="CREATE">Crear</option>
          <option value="UPDATE">Actualizar</option>
          <option value="DELETE">Eliminar</option>
        </select>
        <select class="form-select" v-model="filters.resource" @change="applyFilters">
          <option value="">Todos los recursos</option>
          <option value="PRODUCT">Productos</option>
          <option value="BRAND">Marcas</option>
          <option value="CATEGORY">Categorías</option>
          <option value="USER">Usuarios</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Recurso</th>
                  <th>IP</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in activities" :key="activity.id">
                  <td>{{ formatDate(activity.createdAt) }}</td>
                  <td>
                    <div>
                      <strong>{{ activity.user?.firstName }} {{ activity.user?.lastName }}</strong>
                      <br>
                      <small class="text-muted">{{ activity.user?.email }}</small>
                    </div>
                  </td>
                  <td>
                    <span :class="`badge bg-${getActionBadgeColor(activity.action)}`">
                      {{ getActionLabel(activity.action) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-info">
                      {{ getResourceLabel(activity.resource) }}
                    </span>
                  </td>
                  <td>{{ activity.ipAddress }}</td>
                  <td>
                    <button 
                      class="btn btn-outline-info btn-sm"
                      @click="viewDetails(activity)"
                      title="Ver detalles"
                    >
                      <font-awesome-icon icon="eye" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <nav v-if="pagination.totalPages > 1">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="changePage(pagination.currentPage - 1)">
                  Anterior
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item" 
                :class="{ active: page === pagination.currentPage }"
              >
                <button class="page-link" @click="changePage(page)">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                <button class="page-link" @click="changePage(pagination.currentPage + 1)">
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <ActivityDetailsModal
      v-if="selectedActivity"
      :activity="selectedActivity"
      @close="selectedActivity = null"
    />
  </div>
</template>

<script>
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
</script>
