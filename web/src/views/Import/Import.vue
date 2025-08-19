<template>
  <div class="container mt-4">
    <h3>Importar Datos desde Excel</h3>

    <!-- Carga de archivo -->
    <input type="file" @change="handleFileUpload" accept=".xlsx, .xls" class="form-control mb-4" />

    <!-- Vista previa -->
    <div v-if="excelData.length">
      <h5>Vista previa:</h5>

      <!-- Controles de filtrado -->
      <div class="row mb-3">
        <div class="col-md-2">
          <label class="form-label">Mostrar:</label>
          <select v-model="pageSize" @change="currentPage = 1" class="form-select form-select-sm">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="50">50</option>
            <option :value="excelData.length">Todos</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Buscar:</label>
          <input v-model="searchText" type="text" class="form-control form-control-sm" placeholder="Código o nombre...">
        </div>
        <div class="col-md-2">
          <label class="form-label">Precio:</label>
          <select v-model="priceFilter" class="form-select form-select-sm">
            <option value="">Todos</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500+">$500+</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Marca:</label>
          <select v-model="brandFilter" class="form-select form-select-sm">
            <option value="">Todas</option>
            <option v-for="brand in uniqueBrands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Categoría:</label>
          <select v-model="categoryFilter" class="form-select form-select-sm">
            <option value="">Todas</option>
            <option v-for="category in uniqueCategories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        <div class="col-md-1 d-flex align-items-end gap-1">
          <button @click="clearFilters" class="btn btn-outline-secondary btn-sm" title="Limpiar filtros">
            <font-awesome-icon icon="times" />
          </button>
          <button @click="saveData" class="btn btn-success btn-sm" title="Guardar datos">
            <font-awesome-icon icon="save" />
          </button>
        </div>
      </div>

      <!-- Información de resultados -->
      <div class="mb-2">
        <small class="text-muted">
          Mostrando {{ startIndex + 1 }} - {{ Math.min(startIndex + pageSize, filteredData.length) }}
          de {{ filteredData.length }} productos
        </small>
      </div>

      <div class="table-container mb-3">
        <table class="table table-bordered table-sm table-hover">
          <thead class="table-dark sticky-top">
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Imagen</th>
              <th>Precio</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="8" class="text-center py-4">
                <div class="text-muted">
                  <font-awesome-icon icon="search" size="2x" class="mb-2" />
                  <p class="mb-0">No se encontraron resultados con los filtros aplicados</p>
                  <small>Intenta ajustar los criterios de búsqueda</small>
                </div>
              </td>
            </tr>
            <tr v-for="(item, index) in paginatedData" :key="index" v-else>
              <td><strong>{{ item.producto.code }}</strong></td>
              <td>{{ item.producto.name }}</td>
              <td>
                <div v-if="item.imagePreview || item.producto.img" class="position-relative">
                  <img :src="item.imagePreview || item.producto.img" class="img-thumbnail cursor-pointer"
                    style="width: 50px; height: 50px; object-fit: cover;"
                    @click="viewImageModal(item.imagePreview || item.producto.img)">
                  <button class="btn btn-sm btn-danger position-absolute top-0 end-0"
                    style="transform: translate(50%, -50%); width: 20px; height: 20px; padding: 0; border-radius: 50%;"
                    @click="removeImage(index + startIndex)" title="Eliminar imagen">
                    <font-awesome-icon icon="times" style="font-size: 10px;" />
                  </button>
                </div>
                <div v-else>
                  <input type="file" :ref="`imageInput${index + startIndex}`" accept="image/*" style="display: none;"
                    @change="handleImageUpload($event, index + startIndex)">
                  <button class="btn btn-sm btn-outline-primary"
                    @click="$refs[`imageInput${index + startIndex}`][0].click()" title="Agregar imagen">
                    <font-awesome-icon icon="plus" />
                  </button>
                </div>
              </td>
              <td class="text-success fw-bold">$ {{ item.producto.price }}</td>
              <td><span class="badge bg-secondary">{{ item.producto.marca.name }}</span></td>
              <td><span class="badge bg-info">{{ item.producto.categories.name }}</span></td>

              <!-- Descripción -->
              <td>
                <div v-if="!item.editingDesc">
                  <span>{{ item.producto.descripcion }}</span>
                  <button class="btn btn-sm btn-outline-primary ms-2" @click="editDesc(index + startIndex)">
                    <font-awesome-icon :icon="item.producto.descripcion ? 'edit' : 'plus'" />
                  </button>
                </div>
                <div v-else>
                  <input v-model="item.tempDesc" class="form-control form-control-sm"
                    placeholder="Escribe una descripción..." />
                  <button class="btn btn-sm btn-success mt-1" @click="saveDesc(index + startIndex)">Guardar</button>
                  <button class="btn btn-sm btn-secondary mt-1 ms-1"
                    @click="cancelDesc(index + startIndex)">Cancelar</button>
                </div>
              </td>

              <!-- Estatus -->
              <td>
                <select v-model="item.producto.status" class="form-select form-select-sm">
                  <option disabled value="">Selecciona</option>
                  <option value="disponible">Disponible</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="oferta">Oferta</option>
                  <option value="agotado">Agotado</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <Pagination :current-page="currentPage" :total-pages="totalPages" @page-changed="onPageChanged" />
    </div>
    <div v-else class="alert alert-info">
      Aún no se ha cargado ningún archivo.
    </div>

    <!-- Modal para vista previa de imagen -->
    <div v-if="showImageModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Vista previa de imagen</h5>
            <button type="button" class="btn-close" @click="closeImageModal"></button>
          </div>
          <div class="modal-body text-center">
            <img :src="selectedImage" class="img-fluid" style="max-height: 500px;">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Import.js"></script>
<style scoped src="./Import.scss"></style>