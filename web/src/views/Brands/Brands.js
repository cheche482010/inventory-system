import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'
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
    const toast = useToast()

    const brands = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const editingBrand = ref(null)

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

    const canCreate = computed(() => authStore.hasPermission('brands:create'))
    const canDelete = computed(() => authStore.hasPermission('brands:delete'))

    const loadBrands = async () => {
      loading.value = true
      try {
        const params = {
          page: filters.value.page,
          limit: filters.value.perPage === 'all' ? 9999 : Number(filters.value.perPage),
        }
        if (filters.value.search) params.search = filters.value.search

        const response = await brandService.getAll({ params })

        brands.value = Array.isArray(response.data) ? response.data : []

        if (response.pagination) {
          const actualItemsPerPage = filters.value.perPage === 'all' ? brands.value.length : Number(filters.value.perPage)
          const isLastPage = brands.value.length < actualItemsPerPage
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
            totalItems: brands.value.length,
            itemsPerPage: brands.value.length
          }
        }
      } catch (error) {
        toast.error('Error al cargar marcas')
      } finally {
        loading.value = false
      }
    }

    // Filtros y paginación
    let searchTimeout
    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        filters.value.page = 1
        loadBrands()
      }, 500)
    }
    const applyFilters = () => {
      filters.value.page = 1
      loadBrands()
    }
    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        filters.value.page = page
        loadBrands()
      }
    }
    const clearFilters = () => {
      filters.value = {
        search: "",
        perPage: "10",
        page: 1
      }
      loadBrands()
    }

    // Usar productCount del backend
    const getProductCount = (brand) => {
      return brand.productCount ?? 0
    }

    const editBrand = (brand) => {
      editingBrand.value = brand
    }

    const confirmDelete = async (brand) => {
      Swal.fire({
        title: `¿Estás seguro de eliminar la marca "${brand.name}"?`,
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
            await brandService.delete(brand.id)
            toast.success('Marca eliminada exitosamente')
            loadBrands()
          } catch (error) {
            toast.error('Error al eliminar marca')
          }
        }
      });
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
      brands,
      loading,
      showCreateModal,
      editingBrand,
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
      editBrand,
      confirmDelete,
      closeModal,
      handleSaved,
      formatDate
    }
  }
}