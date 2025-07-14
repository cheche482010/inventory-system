import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import { useToast } from 'vue-toastification'
import UserModal from '@/components/Users/UserModal/UserModal.vue'
import UserViewModal from '@/components/Users/UserViewModal/UserViewModal.vue'
import Swal from 'sweetalert2'

export default {
    name: 'Users',
    components: {
        UserModal,
        UserViewModal
    },
    setup() {
        const authStore = useAuthStore()
        const toast = useToast()

        const users = ref([])
        const loading = ref(false)
        const showCreateModal = ref(false)
        const editingUser = ref(null)
        const viewingUser = ref(null)

        const canCreate = computed(() => authStore.canCreate)
        const currentUser = computed(() => authStore.user)

        const loadUsers = async () => {
            loading.value = true
            try {
                const response = await userService.getAll()
                users.value = response.data
            } catch (error) {
                toast.error('Error al cargar usuarios')
            } finally {
                loading.value = false
            }
        }

        const getRoleBadgeColor = (role) => {
            const colors = {
                dev: 'danger',
                admin: 'warning',
                user: 'info'
            }
            return colors[role] || 'secondary'
        }

        const getRoleLabel = (role) => {
            const labels = {
                dev: 'Desarrollador',
                admin: 'Administrador',
                user: 'Usuario'
            }
            return labels[role] || role
        }

        const viewUser = (user) => {
            viewingUser.value = user
        }

        const editUser = (user) => {
            editingUser.value = user
        }

        const toggleUserStatus = async (user) => {
            const action = user.isActive ? 'desactivar' : 'activar'
            const result = await Swal.fire({
                title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
                text: `¿Estás seguro de ${action} al usuario "${user.firstName} ${user.lastName}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: `Sí, ${action}`,
                cancelButtonText: 'Cancelar'
            })

            if (result.isConfirmed) {
                try {
                    await userService.update(user.id, { isActive: !user.isActive })
                    toast.success(`Usuario ${action}do exitosamente`)
                    loadUsers()
                } catch (error) {
                    toast.error(`Error al ${action} usuario`)
                }
            }
        }

        const closeModal = () => {
            showCreateModal.value = false
            editingUser.value = null
        }

        const handleSaved = () => {
            closeModal()
            loadUsers()
        }

        const formatDate = (date) => {
            if (!date) return '-'
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        onMounted(() => {
            loadUsers()
        })

        return {
            users,
            loading,
            showCreateModal,
            editingUser,
            viewingUser,
            canCreate,
            currentUser,
            getRoleBadgeColor,
            getRoleLabel,
            viewUser,
            editUser,
            toggleUserStatus,
            closeModal,
            handleSaved,
            formatDate
        }
    }
}