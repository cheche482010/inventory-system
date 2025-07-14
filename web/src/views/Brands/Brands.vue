<template>
  <div class="brands">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Marcas</h1>
      <button 
        v-if="canCreate" 
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <font-awesome-icon icon="plus" class="me-2" />
        Nueva Marca
      </button>
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
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Productos</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="brand in brands" :key="brand.id">
                  <td>{{ brand.id }}</td>
                  <td>{{ brand.name }}</td>
                  <td>
                    <span class="badge bg-info">{{ getProductCount(brand.id) }}</span>
                  </td>
                  <td>{{ formatDate(brand.createdAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button 
                        v-if="canCreate"
                        class="btn btn-outline-warning"
                        @click="editBrand(brand)"
                        title="Editar"
                      >
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button 
                        v-if="canDelete"
                        class="btn btn-outline-danger"
                        @click="confirmDelete(brand)"
                        title="Eliminar"
                      >
                        <font-awesome-icon icon="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BrandModal
      v-if="showCreateModal || editingBrand"
      :brand="editingBrand"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/products'
import { brandService } from '@/services/brandService'
import { useToast } from 'vue-toastification'
import BrandModal from '@/components/Brands/BrandModal.vue'

export default {
  name: 'Brands',
  components: {
    BrandModal
  },
  setup() {
    const authStore = useAuthStore()
    const productStore = useProductStore()
    const toast = useToast()
    
    const brands = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const editingBrand = ref(null)
    
    const canCreate = computed(() => authStore.canCreate)
    const canDelete = computed(() => authStore.canDelete)

    const loadBrands = async () => {
      loading.value = true
      try {
        const response = await brandService.getAll()
        brands.value = response.data
      } catch (error) {
        toast.error('Error al cargar marcas')
      } finally {
        loading.value = false
      }
    }

    const getProductCount = (brandId) => {
      return productStore.products.filter(p => p.brandId === brandId).length
    }

    const editBrand = (brand) => {
      editingBrand.value = brand
    }

    const confirmDelete = async (brand) => {
      if (confirm(`¿Estás seguro de eliminar la marca "${brand.name}"?`)) {
        try {
          await brandService.delete(brand.id)
          toast.success('Marca eliminada exitosamente')
          loadBrands()
        } catch (error) {
          toast.error('Error al eliminar marca')
        }
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingBrand.value = null
    }

    const handleSaved = () => {
      closeModal()
      loadBrands()
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('es-ES')
    }

    onMounted(() => {
      loadBrands()
      productStore.fetchProducts()
    })

    return {
      brands,
      loading,
      showCreateModal,
      editingBrand,
      canCreate,
      canDelete,
      getProductCount,
      editBrand,
      confirmDelete,
      closeModal,
      handleSaved,
      formatDate
    }
  }
}
</script>
