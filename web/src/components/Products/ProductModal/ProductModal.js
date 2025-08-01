export default {
    name: 'ProductModal',
    props: {
        product: {
            type: Object,
            required: true
        }
    },
    emits: ['close'],
    setup() {
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const baseUrl = import.meta.env.NODE_ENV === "production"
            ? `${import.meta.env.PROD_BACKEND_URL}`
            : `${import.meta.env.LOCAL_BACKEND_URL}`;

        return {
            formatDate,
            baseUrl
        }
    }
}