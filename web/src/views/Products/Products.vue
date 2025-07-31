<template>
  <div class="products">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Productos</h1>
      <div class="btn-group">
        <button v-if="canCreate" @click="createProduct" class="btn btn-primary">
          <font-awesome-icon icon="plus" class="me-2" />
          Nuevo Producto
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Buscar</label>
            <input type="text" class="form-control" placeholder="Código o nombre..." v-model="filters.search"
              @input="debouncedSearch" />
          </div>
          <div class="col-md-2">
            <label class="form-label">Mostrar</label>
            <select class="form-select" v-model="filters.perPage" @change="applyFilters">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="all">Todas</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Estado</label>
            <select class="form-select" v-model="filters.status" @change="applyFilters">
              <option value="">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="nuevo">Nuevo</option>
              <option value="oferta">Oferta</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Marca</label>
            <select class="form-select" v-model="filters.brandId" @change="applyFilters">
              <option value="">Todas</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Categoría</label>
            <select class="form-select" v-model="filters.categoryId" @change="applyFilters">
              <option value="">Todas</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-6 col-md-2">
            <button @click="clearFilters" class="btn btn-outline-secondary">
              <font-awesome-icon icon="eraser" class="me-2" />
              Limpiar
            </button>
          </div>
          <div class="col-6 col-md-2 ms-md-auto justify-content-end d-flex">
            <ExportDropdown v-if="canExport" :products="products" :filters="filters" />
          </div>
        </div>
      </div>
    </div>

    <!-- Products Table -->
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
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="hasNoResults">
                  <td colspan="7" class="text-center py-4">
                    <div class="alert alert-info">
                      <font-awesome-icon icon="exclamation-triangle" class="me-2" />
                      No se encontraron productos que coincidan con los filtros aplicados.
                    </div>
                  </td>
                </tr>
                <tr v-for="product in products" :key="product.id" v-else>
                  <td>{{ product.code }}</td>
                  <td>{{ product.name.substring(0, 60) }}...</td>
                  <td>{{ product.brand?.name }}</td>
                  <td>{{ product.category?.name }}</td>
                  <td>
                    <span :class="`status-badge ${product.status}`">
                      {{ product.status }}
                    </span>
                  </td>
                  <td>${{ product.price }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-info" @click="viewProduct(product)" title="Ver">
                        <font-awesome-icon icon="eye" />
                      </button>
                      <button v-if="canCreate" @click="editProduct(product)" class="btn btn-outline-warning"
                        title="Editar">
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button v-if="canDelete" class="btn btn-outline-danger" @click="confirmDelete(product)"
                        title="Eliminar">
                        <font-awesome-icon icon="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <Pagination v-if="showPagination && pagination.totalPages > 1" :current-page="pagination.currentPage"
            :total-pages="pagination.totalPages" @page-changed="changePage" />
        </div>
      </div>
    </div>

    <!-- Product View Modal -->
    <ProductModal v-if="selectedProduct" :product="selectedProduct" @close="selectedProduct = null" />

    <!-- Product Form Modal -->
    <div v-if="showProductForm" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
            <button type="button" class="btn-close" @click="closeProductForm"></button>
          </div>
          <div class="modal-body">
            <ProductForm :product="editingProduct" @success="handleFormSuccess" @cancel="closeProductForm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Products.js"></script>
