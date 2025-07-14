export default {
    name: 'ActivityDetailsModal',
    props: {
        activity: {
            type: Object,
            required: true
        }
    },
    emits: ['close'],
    setup() {
        const getActionBadgeColor = (action) => {
            const colors = {
                CREATE: 'success',
                UPDATE: 'warning',
                DELETE: 'danger'
            }
            return colors[action] || 'secondary'
        }

        const getActionLabel = (action) => {
            const labels = {
                CREATE: 'Crear',
                UPDATE: 'Actualizar',
                DELETE: 'Eliminar'
            }
            return labels[action] || action
        }

        const getResourceLabel = (resource) => {
            const labels = {
                PRODUCT: 'Producto',
                BRAND: 'Marca',
                CATEGORY: 'Categoría',
                USER: 'Usuario'
            }
            return labels[resource] || resource
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }

        return {
            getActionBadgeColor,
            getActionLabel,
            getResourceLabel,
            formatDate
        }
    }
}