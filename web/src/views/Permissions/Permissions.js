import { ref, computed, onMounted } from 'vue'
import { permissionService } from '@/services/permissionService'
import { useToast } from 'vue-toastification'
import PermissionModal from '@/components/Permissions/Permissions.vue'
import Pagination from '@/components/Pagination/Pagination.vue'

let searchTimeout

export default {
    name: 'Permissions',
    components: {
        PermissionModal,
        Pagination
    },
    setup() {
        const toast = useToast()

        const permissions = ref([])
        const loading = ref(false)
        const showCreateModal = ref(false)
        const editingPermission = ref(null)

        const pagination = ref({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 20
        })

        const filters = ref({
            search: '',
            resource: '',
            limit: '20'
        })

        const loadPermissions = async () => {
            loading.value = true
            try {
                const response = await permissionService.getAll({
                    ...filters.value,
                    page: pagination.value.currentPage
                })
                permissions.value = response.data
                pagination.value = response.pagination
            } catch (error) {
                toast.error('Error al cargar permisos')
            } finally {
                loading.value = false
            }
        }

        const getActionBadgeColor = (action) => {
            const colors = {
                read: 'primary',
                create: 'success',
                update: 'warning',
                delete: 'danger',
                export: 'info'
            }
            return colors[action] || 'secondary'
        }

        const applyFilters = () => {
            pagination.value.currentPage = 1
            loadPermissions()
        }

        const debouncedSearch = () => {
            clearTimeout(searchTimeout)
            searchTimeout = setTimeout(() => {
                applyFilters()
            }, 500)
        }

        const changePage = (page) => {
            if (page >= 1 && page <= pagination.value.totalPages) {
                pagination.value.currentPage = page
                loadPermissions()
            }
        }

        const editPermission = (permission) => {
            editingPermission.value = permission
        }

        const confirmDelete = async (permission) => {
            if (confirm(`¿Estás seguro de eliminar el permiso "${permission.name}"?`)) {
                try {
                    await permissionService.delete(permission.id)
                    toast.success('Permiso eliminado exitosamente')
                    loadPermissions()
                } catch (error) {
                    toast.error('Error al eliminar permiso')
                }
            }
        }

        const closeModal = () => {
            showCreateModal.value = false
            editingPermission.value = null
        }

        const handleSaved = () => {
            closeModal()
            loadPermissions()
        }

        const clearFilters = () => {
            filters.value = {
                search: '',
                resource: '',
                limit: '20'
            }
            pagination.value.currentPage = 1
            loadPermissions()
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('es-ES')
        }

        onMounted(() => {
            loadPermissions()
        })

        return {
            permissions,
            loading,
            showCreateModal,
            editingPermission,
            pagination,
            filters,
            getActionBadgeColor,
            applyFilters,
            debouncedSearch,
            changePage,
            editPermission,
            confirmDelete,
            closeModal,
            handleSaved,
            clearFilters,
            formatDate
        }
    }
}