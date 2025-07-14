<template>
  <div class="categories">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Categorías</h1>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn btn-primary">
        <font-awesome-icon icon="plus" class="me-2" />
        Nueva Categoría
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
                  <th>Descripción</th>
                  <th>Productos</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in categories" :key="category.id">
                  <td>{{ category.id }}</td>
                  <td>{{ category.name }}</td>
                  <td>{{ category.description || '-' }}</td>
                  <td>
                    <span class="badge bg-info">{{ getProductCount(category.id) }}</span>
                  </td>
                  <td>{{ formatDate(category.createdAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button v-if="canCreate" class="btn btn-outline-warning" @click="editCategory(category)"
                        title="Editar">
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button v-if="canDelete" class="btn btn-outline-danger" @click="confirmDelete(category)"
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
    <CategoryModal v-if="showCreateModal || editingCategory" :category="editingCategory" @close="closeModal"
      @saved="handleSaved" />
  </div>
</template>

<script src="./Categories.js"></script>
