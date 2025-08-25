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
            <div class="col-md-4">
              <img v-if="product.imagen" :src="`${baseUrl}/uploads/${product.imagen}`" :alt="product.name"
                class="img-fluid rounded mb-3" style="cursor: pointer;"
                @click="openImageModal(`${baseUrl}/uploads/${product.imagen}`)">
              <div v-else class="text-center text-muted border rounded p-4 mb-3">
                <font-awesome-icon icon="image" size="3x" />
                <p class="mt-2">Sin imagen</p>
              </div>
            </div>
            <div class="col-md-8">
              <div class="row">
                <div class="col-md-12">
                  <h6>Información General</h6>
                  <table class="table table-sm">
                    <tbody>
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
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6>Clasificación</h6>
                  <table class="table table-sm">
                    <tbody>
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
                    </tbody>
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
    </div>
    <ImageModal :image-url="selectedImageUrl" :visible="showImageModal" @close="closeImageModal" />
  </div>
</template>

<script src="./ProductModal.js"></script>