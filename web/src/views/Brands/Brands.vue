<template>
  <div class="brands">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Marcas</h1>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn btn-primary">
        <font-awesome-icon icon="plus" class="me-2" />
        Nueva Marca
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Productos</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="brand in brands" :key="brand.id">
                  <td>{{ brand.id }}</td>
                  <td>{{ brand.name }}</td>
                  <td>
                    <span class="badge bg-info">{{ getProductCount(brand.id) }}</span>
                  </td>
                  <td>{{ formatDate(brand.createdAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button v-if="canCreate" class="btn btn-outline-warning" @click="editBrand(brand)" title="Editar">
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button v-if="canDelete" class="btn btn-outline-danger" @click="confirmDelete(brand)"
                        title="Eliminar">
                        <font-awesome-icon icon="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BrandModal v-if="showCreateModal || editingBrand" :brand="editingBrand" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script src="./Brands.js"></script>