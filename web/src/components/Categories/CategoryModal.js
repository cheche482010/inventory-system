import { ref, computed, onMounted } from 'vue'
import { categoryService } from '@/services/categoryService'
import { useToast } from 'vue-toastification'

export default {
    name: 'CategoryModal',
    props: {
        category: {
            type: Object,
            default: null
        }
    },
    emits: ['close', 'saved'],
    setup(props, { emit }) {
        const toast = useToast()

        const loading = ref(false)
        const errors = ref({})
        const form = ref({
            name: '',
            description: ''
        })

        const isEdit = computed(() => !!props.category)

        const validateForm = () => {
            errors.value = {}

            if (!form.value.name.trim()) {
                errors.value.name = 'El nombre es requerido'
            }

            return Object.keys(errors.value).length === 0
        }

        const handleSubmit = async () => {
            if (!validateForm()) return

            loading.value = true
            try {
                if (isEdit.value) {
                    await categoryService.update(props.category.id, form.value)
                    toast.success('Categoría actualizada exitosamente')
                } else {
                    await categoryService.create(form.value)
                    toast.success('Categoría creada exitosamente')
                }
                emit('saved')
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al guardar categoría')
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            if (props.category) {
                form.value.name = props.category.name
                form.value.description = props.category.description || ''
            }
        })

        return {
            form,
            loading,
            errors,
            isEdit,
            handleSubmit
        }
    }
}