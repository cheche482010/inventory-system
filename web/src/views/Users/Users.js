import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import { useToast } from 'vue-toastification'
import UserModal from '@/components/Users/UserModal/UserModal.vue'
import UserViewModal from '@/components/Users/UserViewModal/UserViewModal.vue'
import Swal from 'sweetalert2'
import { debounce } from 'lodash'

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
        const pagination = ref({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10
        })

        const filters = ref({
            search: '',
            role: '',
            isActive: '',
            page: 1,
            limit: 10
        })

        const canCreate = computed(() => authStore.hasPermission('users:create'))
        const canUpdate = computed(() => authStore.hasPermission('users:update'))
        const currentUser = computed(() => authStore.user)
        const hasNoResults = computed(() => !loading.value && users.value.length === 0)
        const showPagination = computed(() => pagination.value.totalPages > 1)

        const loadUsers = async () => {
            loading.value = true
            try {
                const params = {
                    page: filters.value.page,
                    limit: filters.value.limit,
                    ...(filters.value.search && { search: filters.value.search }),
                    ...(filters.value.role && { role: filters.value.role }),
                    ...(filters.value.isActive !== '' && { isActive: filters.value.isActive })
                }
                
                const response = await userService.searchUsers(params)
                users.value = response.data
                pagination.value = response.pagination
            } catch (error) {
                toast.error('Error al cargar usuarios')
            } finally {
                loading.value = false
            }
        }

        const debouncedSearch = debounce(() => {
            filters.value.page = 1
            loadUsers()
        }, 300)

        const applyFilters = () => {
            filters.value.page = 1
            loadUsers()
        }

        const clearFilters = () => {
            filters.value = {
                search: '',
                role: '',
                isActive: '',
                page: 1,
                limit: 10
            }
            loadUsers()
        }

        const changePage = (page) => {
            if (page >= 1 && page <= pagination.value.totalPages) {
                filters.value.page = page
                loadUsers()
            }
        }

        const visiblePages = computed(() => {
            const current = pagination.value.currentPage
            const total = pagination.value.totalPages
            const pages = []
            
            let start = Math.max(1, current - 2)
            let end = Math.min(total, current + 2)
            
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            
            return pages
        })

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
            filters,
            pagination,
            canCreate,
            canUpdate,
            currentUser,
            hasNoResults,
            showPagination,
            visiblePages,
            getRoleBadgeColor,
            getRoleLabel,
            viewUser,
            editUser,
            toggleUserStatus,
            closeModal,
            handleSaved,
            formatDate,
            debouncedSearch,
            applyFilters,
            clearFilters,
            changePage
        }
    }
}