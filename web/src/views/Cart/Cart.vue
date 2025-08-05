<template>
    <div class="cart-view">
        <h1>Mi Presupuesto</h1>

        <div v-if="loading" class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div v-else-if="isSubmitted" class="alert alert-success">
            <h4 class="alert-heading">¡Solicitud Enviada!</h4>
            <p>Tu solicitud de presupuesto ha sido enviada. Un administrador la revisará pronto.</p>
            <hr>
            <p class="mb-0">Recibirás una notificación cuando sea aprobada.</p>
        </div>

        <div v-else-if="cartItems.length > 0" class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio Unitario</th>
                                <th style="width: 120px;">Cantidad</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in cartItems" :key="item.id">
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img :src="`${baseUrl}/uploads/${item.product.imagen}`" :alt="item.product.name"
                                            class="me-3" style="width: 60px; height: 60px; object-fit: cover;">
                                        <div>
                                            <strong>{{ item.product.name }}</strong>
                                            <br>
                                            <small class="text-muted">{{ item.product.code }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${{ item.price }}</td>
                                <td>
                                    <input type="number" class="form-control form-control-sm" :value="item.quantity"
                                        @change="updateQuantity(item, $event.target.value)" min="1">
                                </td>
                                <td>${{ (item.price * item.quantity).toFixed(2) }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-danger" @click="removeItem(item.productId)">
                                        <font-awesome-icon icon="trash" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center">
                <h4>Total: <span class="text-success">${{ cartTotal.toFixed(2) }}</span></h4>
                <button class="btn btn-primary btn-lg" @click="submit" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>
                    Enviar Presupuesto
                </button>
            </div>
        </div>

        <div v-else class="alert alert-info">
            Tu carrito de presupuesto está vacío.
        </div>
    </div>
</template>

<script src="./Cart.js"></script>
<style scoped>
.cart-view {
    max-width: 1000px;
    margin: auto;
}
</style>
