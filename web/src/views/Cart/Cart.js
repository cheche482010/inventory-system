import { computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

export default {
    name: 'Cart',
    setup() {
        const cartStore = useCartStore();
        const { cartItems, cartTotal, loading, isSubmitted } = storeToRefs(cartStore);

        const baseUrl = computed(() => {
            return import.meta.env.NODE_ENV === "production"
                ? import.meta.env.PROD_BACKEND_URL
                : import.meta.env.LOCAL_BACKEND_URL;
        });

        const updateQuantity = (item, newQuantity) => {
            const quantity = parseInt(newQuantity, 10);
            if (isNaN(quantity) || quantity < 1) {
                event.target.value = item.quantity;
                return;
            }
            cartStore.addItem({ productId: item.productId, quantity });
        };

        const removeItem = (productId) => {
            cartStore.removeItem(productId);
        };

        const submit = () => {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Una vez enviado, no podrás modificar este presupuesto.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, enviar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    cartStore.submitCart();
                }
            });
        };

        return {
            cartItems,
            cartTotal,
            loading,
            isSubmitted,
            baseUrl,
            updateQuantity,
            removeItem,
            submit,
        };
    },
};
