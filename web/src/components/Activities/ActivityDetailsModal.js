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

        const generateActivityMessage = (activity) => {
            const userName = `${activity.user?.firstName} ${activity.user?.lastName}`
            const actionText = getActionLabel(activity.action).toLowerCase()
            const resourceText = getResourceLabel(activity.resource).toLowerCase()
            const date = formatDate(activity.createdAt)
            
            let resourceName = ''
            if (activity.details?.body?.name) {
                resourceName = ` "${activity.details.body.name}"`
            } else if (activity.resourceId) {
                resourceName = ` con ID ${activity.resourceId}`
            }
            
            return `El usuario ${userName} ${actionText === 'crear' ? 'creó' : actionText === 'actualizar' ? 'actualizó' : 'eliminó'} ${resourceText === 'producto' ? 'el producto' : resourceText === 'marca' ? 'la marca' : resourceText === 'categoría' ? 'la categoría' : 'el usuario'}${resourceName} el ${date}`
        }

        return {
            getActionBadgeColor,
            getActionLabel,
            getResourceLabel,
            formatDate,
            generateActivityMessage
        }
    }
}