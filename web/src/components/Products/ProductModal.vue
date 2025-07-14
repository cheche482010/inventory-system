<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalles del Producto</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Información General</h6>
              <table class="table table-sm">
                <tr>
                  <td><strong>Código:</strong></td>
                  <td>{{ product.code }}</td>
                </tr>
                <tr>
                  <td><strong>Nombre:</strong></td>
                  <td>{{ product.name }}</td>
                </tr>
                <tr>
                  <td><strong>Precio:</strong></td>
                  <td>${{ product.price }}</td>
                </tr>
                <tr>
                  <td><strong>Estado:</strong></td>
                  <td>
                    <span :class="`status-badge ${product.status}`">
                      {{ product.status }}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Clasificación</h6>
              <table class="table table-sm">
                <tr>
                  <td><strong>Marca:</strong></td>
                  <td>{{ product.brand?.name }}</td>
                </tr>
                <tr>
                  <td><strong>Categoría:</strong></td>
                  <td>{{ product.category?.name }}</td>
                </tr>
                <tr>
                  <td><strong>Creado:</strong></td>
                  <td>{{ formatDate(product.createdAt) }}</td>
                </tr>
                <tr>
                  <td><strong>Actualizado:</strong></td>
                  <td>{{ formatDate(product.updatedAt) }}</td>
                </tr>
              </table>
            </div>
          </div>
          <div v-if="product.description" class="mt-3">
            <h6>Descripción</h6>
            <p>{{ product.description }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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

    return {
      formatDate
    }
  }
}
</script>
