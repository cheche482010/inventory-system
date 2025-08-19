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
        const imagePreview = ref(null)
        const selectedFile = ref(null)

        const form = ref({
            code: '',
            name: '',
            description: '',
            price: '',
            status: '',
            brandId: '',
            categoryId: '',
            imagen: null
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
                const baseUrl = import.meta.env.NODE_ENV === "production"
                    ? `${import.meta.env.PROD_BACKEND_URL}`
                    : `${import.meta.env.LOCAL_BACKEND_URL}`;

                if (isEdit.value && props.product) {
                    form.value = {
                        code: props.product.code,
                        name: props.product.name,
                        description: props.product.description || '',
                        price: props.product.price,
                        status: props.product.status,
                        brandId: props.product.brandId,
                        categoryId: props.product.categoryId,
                        imagen: props.product.imagen ? `${baseUrl}/uploads/${props.product.imagen}` : null
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

        const handleFileChange = (event) => {
            const file = event.target.files[0]
            if (file) {
                selectedFile.value = file
                const reader = new FileReader()
                reader.onload = (e) => {
                    imagePreview.value = e.target.result
                }
                reader.readAsDataURL(file)
            }
        }

        const handleSubmit = async () => {
            if (!validateForm()) return

            loading.value = true

            const formData = new FormData()
            Object.keys(form.value).forEach(key => {
                if (key !== 'imagen' && form.value[key] !== null && form.value[key] !== '') {
                    formData.append(key, form.value[key])
                }
            })

            if (selectedFile.value) {
                formData.append('imagen', selectedFile.value)
            }

            try {
                if (isEdit.value) {
                    await productStore.updateProduct(props.product.id, formData)
                } else {
                    await productStore.createProduct(formData)
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
            imagePreview,
            handleFileChange,
            handleSubmit
        }
    }
}