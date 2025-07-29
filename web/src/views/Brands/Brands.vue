<template>
  <div class="brands">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Marcas</h1>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn btn-primary">
        <font-awesome-icon icon="plus" class="me-2" />
        Nueva Marca
      </button>
    </div>

    <!-- FILTROS -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Buscar</label>
            <input type="text" class="form-control" placeholder="Nombre..." v-model="filters.search"
              @input="debouncedSearch" />
          </div>
          <div class="col-md-2">
            <label class="form-label">Mostrar</label>
            <select class="form-select" v-model="filters.perPage" @change="applyFilters">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="all">Todas</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button @click="clearFilters" class="btn btn-outline-secondary">
              <font-awesome-icon icon="eraser" class="me-2" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else>
          <div class="table-responsive"
            :style="{ maxHeight: filters.perPage === 'all' ? '500px' : 'none', overflowY: filters.perPage === 'all' ? 'auto' : 'visible' }">
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
                <tr v-if="!loading && brands.length === 0">
                  <td colspan="5" class="text-center py-4">
                    <div class="alert alert-info">
                      <font-awesome-icon icon="exclamation-triangle" class="me-2" />
                      No se encontraron marcas que coincidan con los filtros aplicados.
                    </div>
                  </td>
                </tr>
                <tr v-for="brand in brands" :key="brand.id" v-else>
                  <td>{{ brand.id }}</td>
                  <td>{{ brand.name }}</td>
                  <td>
                    <span class="badge bg-info">{{ getProductCount(brand) }}</span>
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

          <!-- PAGINACIÓN -->
          <nav v-if="showPagination">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="changePage(pagination.currentPage - 1)">
                  Anterior
                </button>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item"
                :class="{ active: page === pagination.currentPage }">
                <button class="page-link" @click="changePage(page)">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                <button class="page-link" @click="changePage(pagination.currentPage + 1)">
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BrandModal v-if="showCreateModal || editingBrand" :brand="editingBrand" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script src="./Brands.js"></script>