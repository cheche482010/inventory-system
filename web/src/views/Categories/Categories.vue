<template>
  <div class="categories">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Categorías</h1>
      <button 
        v-if="canCreate" 
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <font-awesome-icon icon="plus" class="me-2" />
        Nueva Categoría
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
                  <th>Descripción</th>
                  <th>Productos</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in categories" :key="category.id">
                  <td>{{ category.id }}</td>
                  <td>{{ category.name }}</td>
                  <td>{{ category.description || '-' }}</td>
                  <td>
                    <span class="badge bg-info">{{ getProductCount(category.id) }}</span>
                  </td>
                  <td>{{ formatDate(category.createdAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button 
                        v-if="canCreate"
                        class="btn btn-outline-warning"
                        @click="editCategory(category)"
                        title="Editar"
                      >
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button 
                        v-if="canDelete"
                        class="btn btn-outline-danger"
                        @click="confirmDelete(category)"
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
    <CategoryModal
      v-if="showCreateModal || editingCategory"
      :category="editingCategory"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
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
    const productStore = useProductStore()
    const toast = useToast()
    
    const categories = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const editingCategory = ref(null)
    
    const canCreate = computed(() => authStore.canCreate)
    const canDelete = computed(() => authStore.canDelete)

    const loadCategories = async () => {
      loading.value = true
      try {
        const response = await categoryService.getAll()
        categories.value = response.data
      } catch (error) {
        toast.error('Error al cargar categorías')
      } finally {
        loading.value = false
      }
    }

    const getProductCount = (categoryId) => {
      return productStore.products.filter(p => p.categoryId === categoryId).length
    }

    const editCategory = (category) => {
      editingCategory.value = category
    }

    const confirmDelete = async (category) => {
      if (confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
        try {
          await categoryService.delete(category.id)
          toast.success('Categoría eliminada exitosamente')
          loadCategories()
        } catch (error) {
          toast.error('Error al eliminar categoría')
        }
      }
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
      productStore.fetchProducts()
    })

    return {
      categories,
      loading,
      showCreateModal,
      editingCategory,
      canCreate,
      canDelete,
      getProductCount,
      editCategory,
      confirmDelete,
      closeModal,
      handleSaved,
      formatDate
    }
  }
}
</script>
