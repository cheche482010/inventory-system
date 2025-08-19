import { defineStore } from 'pinia';
import { cartService } from '@/services/cartService';
import { useToast } from 'vue-toastification';

export const useCartStore = defineStore('cart', {
    state: () => ({
        cart: null,
        loading: false,
        toast: useToast(),
    }),
    getters: {
        cartItems: (state) => state.cart?.items || [],
        cartItemCount: (state) => {
            if (!state.cart || !state.cart.items) return 0;
            return state.cart.items.reduce((count, item) => count + item.quantity, 0);
        },
        cartTotal: (state) => {
            if (!state.cart || !state.cart.items) return 0;
            return state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        isActive: (state) => state.cart?.status === 'active',
        isSubmitted: (state) => state.cart?.status === 'submitted',
    },
    actions: {
        async fetchCart() {
            if (this.cart) return; // Avoid refetching if cart is already loaded
            this.loading = true;
            try {
                const response = await cartService.getCart();
                this.cart = response.data;
            } catch (error) {
                this.toast.error('Error al obtener el carrito');
            } finally {
                this.loading = false;
            }
        },
        async addItem(item) {
            this.loading = true;
            try {
                const response = await cartService.addItem(item);
                this.cart = response.data;
                this.toast.success('Producto añadido al carrito');
            } catch (error) {
                this.toast.error('Error al añadir el producto');
            } finally {
                this.loading = false;
            }
        },
        async removeItem(productId) {
            this.loading = true;
            try {
                const response = await cartService.removeItem(productId);
                this.cart = response.data;
                this.toast.success('Producto eliminado del carrito');
            } catch (error) {
                this.toast.error('Error al eliminar el producto');
            } finally {
                this.loading = false;
            }
        },
        async submitCart() {
            this.loading = true;
            try {
                const response = await cartService.submitCart();
                this.cart = response.data;
                this.toast.success('Solicitud de presupuesto enviada');
            } catch (error) {
                this.toast.error('Error al enviar la solicitud');
            } finally {
                this.loading = false;
            }
        },
        clearCart() {
            this.cart = null;
        }
    },
});
