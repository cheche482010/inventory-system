import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/products'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'
import { useToast } from 'vue-toastification'
import ProductModal from '@/components/Products/ProductModal/ProductModal.vue'
import ProductForm from '@/components/Products/ProductForm/ProductForm.vue'
import ExportDropdown from '@/components/Products/ExportDropdown/ExportDropdown.vue'

let searchTimeout

export default {
    name: 'Products',
    components: {
        ProductModal,
        ProductForm,
        ExportDropdown
    },
    setup() {
        const authStore = useAuthStore()
        const productStore = useProductStore()
        const toast = useToast()

        const brands = ref([])
        const categories = ref([])
        const selectedProduct = ref(null)
        const showProductForm = ref(false)
        const editingProduct = ref(null)

        const products = computed(() => productStore.products)
        const loading = computed(() => productStore.loading)
        const pagination = computed(() => productStore.pagination)
        const filters = computed(() => productStore.filters)

        const canCreate = computed(() => authStore.canCreate)
        const canDelete = computed(() => authStore.canDelete)

        const visiblePages = computed(() => {
            const current = pagination.value.currentPage
            const total = pagination.value.totalPages
            const pages = []

            for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
                pages.push(i)
            }

            return pages
        })

        const hasNoResults = computed(() => {
            return products.value.length === 0 && !loading.value
        })

        const loadData = async () => {
            await Promise.all([
                productStore.fetchProducts(),
                loadBrands(),
                loadCategories()
            ])
        }

        const loadBrands = async () => {
            try {
                const response = await brandService.getAll()
                brands.value = response.data
            } catch (error) {
                console.error('Error loading brands:', error)
            }
        }

        const loadCategories = async () => {
            try {
                const response = await categoryService.getAll()
                categories.value = response.data
            } catch (error) {
                console.error('Error loading categories:', error)
            }
        }

        const showPagination = computed(() => filters.value.perPage !== 'all')

        const applyFilters = () => {
            productStore.setFilters(filters.value)
            productStore.fetchProducts()
        }

        const debouncedSearch = () => {
            clearTimeout(searchTimeout)
            searchTimeout = setTimeout(() => {
                applyFilters()
            }, 500)
        }

        const changePage = (page) => {
            if (page >= 1 && page <= pagination.value.totalPages) {
                productStore.setPage(page)
                productStore.fetchProducts()
            }
        }

        const viewProduct = (product) => {
            selectedProduct.value = product
        }

        const confirmDelete = (product) => {
            if (confirm(`¿Estás seguro de eliminar el producto ${product.code}?`)) {
                productStore.deleteProduct(product.id)
            }
        }

        const createProduct = () => {
            editingProduct.value = null
            showProductForm.value = true
        }

        const editProduct = (product) => {
            editingProduct.value = product
            showProductForm.value = true
        }

        const closeProductForm = () => {
            showProductForm.value = false
            editingProduct.value = null
        }

        const clearFilters = () => {
            productStore.setFilters({
                search: "",
                status: "",
                brandId: "",
                categoryId: "",
                perPage: "10"
            })
            productStore.fetchProducts()
        }

        const handleFormSuccess = () => {
            closeProductForm()
            loadData()
        }

        onMounted(() => {
            loadData()
        })

        return {
            products,
            loading,
            pagination,
            filters,
            brands,
            categories,
            selectedProduct,
            showProductForm,
            editingProduct,
            canCreate,
            canDelete,
            visiblePages,
            showPagination,
            applyFilters,
            debouncedSearch,
            changePage,
            viewProduct,
            confirmDelete,
            createProduct,
            editProduct,
            closeProductForm,
            clearFilters,
            hasNoResults,
            handleFormSuccess
        }
    }
}