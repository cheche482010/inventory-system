import { ref } from 'vue'
import UserPermissionsModal from '../UserPermissionsModal/UserPermissionsModal.vue'

export default {
    name: 'UserViewModal',
    components: {
        UserPermissionsModal
    },
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    emits: ['close'],
    setup(props) {
        const showPermissionsModal = ref(false)
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

        const openPermissionsModal = () => {
            showPermissionsModal.value = true
        }

        const closePermissionsModal = () => {
            showPermissionsModal.value = false
        }

        return {
            getRoleBadgeColor,
            getRoleLabel,
            formatDate,
            showPermissionsModal,
            openPermissionsModal,
            closePermissionsModal
        }
    }
}