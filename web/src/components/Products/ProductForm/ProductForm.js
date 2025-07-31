import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'

export default {
    name: 'ProductForm',
    props: {
        product: {
            type: Object,
            default: null
        }
    },
    emits: ['success', 'cancel'],
    setup(props, { emit }) {
        const route = useRoute()
        const router = useRouter()
        const productStore = useProductStore()

        const loading = ref(false)
        const brands = ref([])
        const categories = ref([])
        const errors = ref({})

        const form = ref({
            code: '',
            name: '',
            description: '',
            price: '',
            status: '',
            brandId: '',
            categoryId: ''
        })

        const isEdit = computed(() => !!props.product)

        const loadData = async () => {
            try {
                const [brandsResponse, categoriesResponse] = await Promise.all([
                    brandService.getAllBrands(),
                    categoryService.getAllCategories()
                ])

                brands.value = brandsResponse.data
                categories.value = categoriesResponse.data

                if (isEdit.value && props.product) {
                    form.value = {
                        code: props.product.code,
                        name: props.product.name,
                        description: props.product.description || '',
                        price: props.product.price,
                        status: props.product.status,
                        brandId: props.product.brandId,
                        categoryId: props.product.categoryId
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error)
            }
        }

        const validateForm = () => {
            errors.value = {}

            if (!form.value.code.trim()) {
                errors.value.code = 'El código es requerido'
            }

            if (!form.value.name.trim()) {
                errors.value.name = 'El nombre es requerido'
            }

            if (!form.value.price || form.value.price <= 0) {
                errors.value.price = 'El precio debe ser mayor a 0'
            }

            if (!form.value.status) {
                errors.value.status = 'El estado es requerido'
            }

            if (!form.value.brandId) {
                errors.value.brandId = 'La marca es requerida'
            }

            if (!form.value.categoryId) {
                errors.value.categoryId = 'La categoría es requerida'
            }

            return Object.keys(errors.value).length === 0
        }

        const handleSubmit = async () => {
            if (!validateForm()) return

            loading.value = true
            try {
                if (isEdit.value) {
                    await productStore.updateProduct(props.product.id, form.value)
                } else {
                    await productStore.createProduct(form.value)
                }
                emit('success')
            } catch (error) {
                console.log(error);
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            loadData()
        })

        return {
            form,
            loading,
            brands,
            categories,
            errors,
            isEdit,
            handleSubmit
        }
    }
}