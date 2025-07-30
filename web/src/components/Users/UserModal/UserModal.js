import { ref, computed, onMounted } from 'vue'
import { userService } from '@/services/userService'
import { useToast } from 'vue-toastification'
import UserPermissions from '../UserPermissions/UserPermissions.vue'

export default {
    name: 'UserModal',
    components: {
        UserPermissions
    },
    props: {
        user: {
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
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: ''
        })

        const createdUser = ref(null)
        const isEdit = computed(() => !!props.user || !!createdUser.value)
        const userForPermissions = computed(() => createdUser.value || props.user)

        const validateForm = () => {
            errors.value = {}

            if (!form.value.firstName.trim()) {
                errors.value.firstName = 'El nombre es requerido'
            }

            if (!form.value.lastName.trim()) {
                errors.value.lastName = 'El apellido es requerido'
            }

            if (!form.value.email.trim()) {
                errors.value.email = 'El email es requerido'
            }

            if (!isEdit.value && !form.value.password) {
                errors.value.password = 'La contraseña es requerida'
            }

            if (form.value.password && form.value.password.length < 6) {
                errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
            }

            if (!form.value.role) {
                errors.value.role = 'El rol es requerido'
            }

            return Object.keys(errors.value).length === 0
        }

        const handleSubmit = async () => {
            if (!validateForm()) return

            loading.value = true
            try {
                const data = { ...form.value }
                if (isEdit.value && !data.password) {
                    delete data.password
                }

                if (isEdit.value && !createdUser.value) {
                    await userService.update(props.user.id, data)
                    toast.success('Usuario actualizado exitosamente')
                    emit('saved')
                } else {
                    const response = await userService.create(data)
                    createdUser.value = response.data
                    toast.success('Usuario creado exitosamente. Ahora puedes asignar permisos.')
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al guardar usuario')
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            if (props.user) {
                form.value = {
                    firstName: props.user.firstName,
                    lastName: props.user.lastName,
                    email: props.user.email,
                    password: '',
                    role: props.user.role
                }
            }
        })

        return {
            form,
            loading,
            errors,
            isEdit,
            handleSubmit,
            userForPermissions
        }
    }
}