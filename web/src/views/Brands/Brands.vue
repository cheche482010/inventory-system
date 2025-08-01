<template>
  <div class="brands">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Marcas</h1>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn btn-primary">
        <font-awesome-icon icon="plus" class="me-2" />
        Nueva Marca
      </button>
    </div>

    <FilterSection v-model="filters" :config="filterConfig" search-placeholder="Nombre..." @filter="applyFilters"
      @clear="clearFilters" />

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
                  <th>#</th>
                  <th @click="sort('name')" class="sortable">
                    Nombre
                    <font-awesome-icon v-if="filters.sortBy === 'name'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th>Productos</th>
                  <th @click="sort('createdAt')" class="sortable">
                    Fecha Creación
                    <font-awesome-icon v-if="filters.sortBy === 'createdAt'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
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
                <tr v-for="(brand, index) in brands" :key="brand.id" v-else>
                  <td>{{ getRowNumber(index) }}</td>
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
          <Pagination v-if="showPagination" :current-page="pagination.currentPage" :total-pages="pagination.totalPages"
            @page-changed="changePage" />
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BrandModal v-if="showCreateModal || editingBrand" :brand="editingBrand" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script src="./Brands.js"></script>