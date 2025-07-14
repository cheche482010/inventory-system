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