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