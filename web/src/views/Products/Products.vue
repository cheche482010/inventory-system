<template>
  <div class="products">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Productos</h1>
      <button 
        v-if="canCreate" 
        @click="createProduct"
        class="btn btn-primary"
      >
        <font-awesome-icon icon="plus" class="me-2" />
        Nuevo Producto
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Buscar</label>
            <input
              type="text"
              class="form-control"
              placeholder="Código o nombre..."
              v-model="filters.search"
              @input="debouncedSearch"
            />
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
          <div class="col-md-3">
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
      </div>
    </div>

    <!-- Products Table -->
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
                <tr v-for="product in products" :key="product.id">
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
                      <button 
                        class="btn btn-outline-info"
                        @click="viewProduct(product)"
                        title="Ver"
                      >
                        <font-awesome-icon icon="eye" />
                      </button>
                      <button 
                        v-if="canCreate"
                        @click="editProduct(product)"
                        class="btn btn-outline-warning"
                        title="Editar"
                      >
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button 
                        v-if="canDelete"
                        class="btn btn-outline-danger"
                        @click="confirmDelete(product)"
                        title="Eliminar"
                      >
                        <font-awesome-icon icon="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <nav v-if="pagination.totalPages > 1">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="changePage(pagination.currentPage - 1)">
                  Anterior
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item" 
                :class="{ active: page === pagination.currentPage }"
              >
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

    <!-- Product View Modal -->
    <ProductModal 
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
    />

    <!-- Product Form Modal -->
    <div v-if="showProductForm" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
            <button type="button" class="btn-close" @click="closeProductForm"></button>
          </div>
          <div class="modal-body">
            <ProductForm 
              :product="editingProduct"
              @success="handleFormSuccess"
              @cancel="closeProductForm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Products.js"></script>
