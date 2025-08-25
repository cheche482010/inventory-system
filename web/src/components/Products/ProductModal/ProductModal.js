import { ref } from 'vue';
import ImageModal from '@/components/ImageModal/ImageModal.vue';

export default {
    name: 'ProductModal',
    components: {
        ImageModal,
    },
    props: {
        product: {
            type: Object,
            required: true
        }
    },
    emits: ['close'],
    setup() {
        const showImageModal = ref(false);
        const selectedImageUrl = ref('');

        const openImageModal = (imageUrl) => {
            selectedImageUrl.value = imageUrl;
            showImageModal.value = true;
        };

        const closeImageModal = () => {
            showImageModal.value = false;
            selectedImageUrl.value = '';
        };
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
            baseUrl,
            showImageModal,
            selectedImageUrl,
            openImageModal,
            closeImageModal,
        }
    }
}