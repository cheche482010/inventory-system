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
    <FilterSection v-model="filters" :config="filterConfig" search-placeholder="Código o nombre..."
      @filter="applyFilters" @clear="clearFilters">
      <template #extra-buttons>
        <ExportDropdown v-if="canExport" :products="products" :filters="filters" />
      </template>
    </FilterSection>

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
                  <th>#</th>
                  <th>Imagen</th>
                  <th @click="sort('code')" class="sortable">
                    Código
                    <font-awesome-icon v-if="filters.sortBy === 'code'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('name')" class="sortable">
                    Nombre
                    <font-awesome-icon v-if="filters.sortBy === 'name'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('brand.name')" class="sortable">
                    Marca
                    <font-awesome-icon v-if="filters.sortBy === 'brand.name'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('category.name')" class="sortable">
                    Categoría
                    <font-awesome-icon v-if="filters.sortBy === 'category.name'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('status')" class="sortable">
                    Estado
                    <font-awesome-icon v-if="filters.sortBy === 'status'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('price')" class="sortable">
                    Precio
                    <font-awesome-icon v-if="filters.sortBy === 'price'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th>Acciones</th>
                  <th v-if="userRole === 'user'">Comprar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="hasNoResults">
                  <td colspan="8" class="text-center py-4">
                    <div class="alert alert-info">
                      <font-awesome-icon icon="exclamation-triangle" class="me-2" />
                      No se encontraron productos que coincidan con los filtros aplicados.
                    </div>
                  </td>
                </tr>
                <tr v-for="(product, index) in products" :key="product.id" v-else>
                  <td>{{ (pagination.currentPage - 1) * (filters.perPage === 'all' ? products.length :
                    parseInt(filters.perPage)) + index + 1 }}</td>
                  <td>
                    <img v-if="product.imagen" :src="`${baseUrl}/uploads/${product.imagen}`" :alt="product.name"
                      class="product-image img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">
                    <span v-else class="text-muted small">Sin imagen</span>
                  </td>
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
                  <td v-if="userRole === 'user'">
                    <div v-if="product.status !== 'agotado'" class="d-flex" style="width: 150px;">
                      <input type="number" class="form-control form-control-sm me-2"
                        v-model.number="quantities[product.id]" min="1" />
                      <button class="btn btn-sm btn-success" @click="addToCart(product)" title="Añadir al carrito">
                        <font-awesome-icon icon="cart-plus" />
                      </button>
                    </div>
                    <span v-else class="text-muted small">Agotado</span>
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