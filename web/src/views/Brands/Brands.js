import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'
import { brandService } from '@/services/brandService'
import { useToast } from 'vue-toastification'
import BrandModal from '@/components/Brands/BrandModal.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import FilterSection from '@/components/FilterSection/FilterSection.vue'

export default {
  name: 'Brands',
  components: {
    BrandModal,
    Pagination,
    FilterSection,
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

    const canCreate = computed(() => authStore.hasPermission('brands:create'))
    const canDelete = computed(() => authStore.hasPermission('brands:delete'))

    const loadBrands = async () => {
      loading.value = true
      try {
        const params = {
          page: filters.value.page,
          limit: filters.value.perPage === 'all' ? 9999 : Number(filters.value.perPage),
          sortBy: filters.value.sortBy,
          sortOrder: filters.value.sortOrder,
        }
        if (filters.value.search) params.search = filters.value.search

        const response = await brandService.getAll({ params })

        brands.value = Array.isArray(response.data) ? response.data : []

        if (response.pagination) {
          pagination.value = response.pagination
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

    const filterConfig = computed(() => [
      { type: 'search', key: 'search', col: 'col-md-4' },
      { type: 'perPage', key: 'perPage', col: 'col-md-2' },
    ]);

    const applyFilters = () => {
      filters.value.page = 1
      loadBrands()
    }

    const sort = (field) => {
      if (filters.value.sortBy === field) {
        filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        filters.value.sortBy = field
        filters.value.sortOrder = 'asc'
      }
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

    const showPagination = computed(() => filters.value.perPage !== 'all' && pagination.value.totalPages > 1)

    const getRowNumber = (index) => {
      if (filters.value.perPage === 'all') {
        return index + 1
      }
      return (pagination.value.currentPage - 1) * pagination.value.itemsPerPage + index + 1
    }

    return {
      brands,
      loading,
      showCreateModal,
      editingBrand,
      canCreate,
      canDelete,
      filters,
      pagination,
      showPagination,
      applyFilters,
      changePage,
      clearFilters,
      getProductCount,
      editBrand,
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