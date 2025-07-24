import { ref, computed, onMounted, watch } from 'vue'
import { permissionService } from '@/services/permissionService'
import { useToast } from 'vue-toastification'

export default {
    name: 'PermissionModal',
    props: {
        permission: {
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
            description: '',
            resource: '',
            action: ''
        })

        const isEdit = computed(() => !!props.permission)

        // Auto-generate name when resource and action change
        watch([() => form.value.resource, () => form.value.action], ([resource, action]) => {
            if (resource && action && !isEdit.value) {
                form.value.name = `${resource}:${action}`
            }
        })

        const validateForm = () => {
            errors.value = {}

            if (!form.value.name.trim()) {
                errors.value.name = 'El nombre es requerido'
            }

            if (!form.value.resource) {
                errors.value.resource = 'El recurso es requerido'
            }

            if (!form.value.action) {
                errors.value.action = 'La acción es requerida'
            }

            return Object.keys(errors.value).length === 0
        }

        const handleSubmit = async () => {
            if (!validateForm()) return

            loading.value = true
            try {
                if (isEdit.value) {
                    await permissionService.update(props.permission.id, form.value)
                    toast.success('Permiso actualizado exitosamente')
                } else {
                    await permissionService.create(form.value)
                    toast.success('Permiso creado exitosamente')
                }
                emit('saved')
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al guardar permiso')
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            if (props.permission) {
                form.value = {
                    name: props.permission.name,
                    description: props.permission.description || '',
                    resource: props.permission.resource,
                    action: props.permission.action
                }
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