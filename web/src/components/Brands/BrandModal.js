import { ref, computed, onMounted } from 'vue'
import { brandService } from '@/services/brandService'
import { useToast } from 'vue-toastification'

export default {
    name: 'BrandModal',
    props: {
        brand: {
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
            name: ''
        })

        const isEdit = computed(() => !!props.brand)

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
                    await brandService.update(props.brand.id, form.value)
                    toast.success('Marca actualizada exitosamente')
                } else {
                    await brandService.create(form.value)
                    toast.success('Marca creada exitosamente')
                }
                emit('saved')
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al guardar marca')
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            if (props.brand) {
                form.value.name = props.brand.name
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