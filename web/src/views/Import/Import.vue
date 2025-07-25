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
          <input v-model="searchText" type="text" class="form-control form-control-sm" 
                 placeholder="Código o nombre...">
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
        <div class="col-md-1 d-flex align-items-end">
          <button @click="clearFilters" class="btn btn-outline-secondary btn-sm w-100" title="Limpiar filtros">
            <font-awesome-icon icon="times" />
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
              <th>Precio</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="7" class="text-center py-4">
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
      <nav v-if="totalPages > 1">
        <ul class="pagination justify-content-center flex-wrap">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="currentPage = 1">&laquo;</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="currentPage--">&lt;</button>
          </li>

          <!-- Primera página -->
          <li class="page-item" :class="{ active: currentPage === 1 }" v-if="currentPage > 3">
            <button class="page-link" @click="currentPage = 1">1</button>
          </li>
          <li class="page-item disabled" v-if="currentPage > 3">
            <button class="page-link">...</button>
          </li>

          <!-- Rango de páginas alrededor de la actual -->
          <li class="page-item" v-for="page in displayedPages" :key="page" :class="{ active: currentPage === page }">
            <button class="page-link" @click="currentPage = page">{{ page }}</button>
          </li>

          <!-- Última página -->
          <li class="page-item disabled" v-if="currentPage < totalPages - 2">
            <button class="page-link">...</button>
          </li>
          <li class="page-item" :class="{ active: currentPage === totalPages }" v-if="currentPage < totalPages - 2">
            <button class="page-link" @click="currentPage = totalPages">{{ totalPages }}</button>
          </li>

          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="currentPage++">&gt;</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="currentPage = totalPages">&raquo;</button>
          </li>

          <!-- Input para ir a página específica -->
          <li class="page-item">
            <div class="input-group ms-2" style="width: 100px;">
              <input type="number" class="form-control" v-model.number="inputPage" min="1" :max="totalPages"
                @keyup.enter="goToPage">
              <button class="btn btn-outline-secondary" @click="goToPage">Ir</button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
    <div v-else class="alert alert-info">
      Aún no se ha cargado ningún archivo.
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'ImportarExcel',
  data() {
    return {
      excelData: [],
      currentPage: 1,
      pageSize: 10,
      inputPage: 1,
      searchText: '',
      priceFilter: '',
      brandFilter: '',
      categoryFilter: ''
    };
  },
  computed: {
    filteredData() {
      let filtered = this.excelData;

      if (this.searchText) {
        const search = this.searchText.toLowerCase();
        filtered = filtered.filter(item => 
          item.producto.code.toLowerCase().includes(search) ||
          item.producto.name.toLowerCase().includes(search)
        );
      }

      if (this.priceFilter) {
        filtered = filtered.filter(item => {
          const price = item.producto.price;
          switch (this.priceFilter) {
            case '0-50': return price >= 0 && price <= 50;
            case '50-100': return price > 50 && price <= 100;
            case '100-500': return price > 100 && price <= 500;
            case '500+': return price > 500;
            default: return true;
          }
        });
      }

      if (this.brandFilter) {
        filtered = filtered.filter(item => 
          item.producto.marca.name === this.brandFilter
        );
      }

      if (this.categoryFilter) {
        filtered = filtered.filter(item => 
          item.producto.categories.name === this.categoryFilter
        );
      }

      return filtered;
    },
    uniqueBrands() {
      const brands = [...new Set(this.excelData.map(item => item.producto.marca.name))];
      return brands.filter(brand => brand).sort();
    },
    uniqueCategories() {
      const categories = [...new Set(this.excelData.map(item => item.producto.categories.name))];
      return categories.filter(category => category).sort();
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize);
    },
    startIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    paginatedData() {
      return this.filteredData.slice(this.startIndex, this.startIndex + this.pageSize);
    },
    displayedPages() {
      const range = 2; // Cuántas páginas mostrar alrededor de la actual
      const start = Math.max(2, this.currentPage - range);
      const end = Math.min(this.totalPages - 1, this.currentPage + range);

      let pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Si estamos cerca del inicio, mostramos más páginas al final
      if (this.currentPage <= range + 1) {
        const extraPages = (range + 1) - this.currentPage;
        const endExtra = Math.min(this.totalPages - 1, end + extraPages);
        for (let i = end + 1; i <= endExtra; i++) {
          pages.push(i);
        }
      }

      // Si estamos cerca del final, mostramos más páginas al inicio
      if (this.currentPage >= this.totalPages - range) {
        const extraPages = (range + 1) - (this.totalPages - this.currentPage);
        const startExtra = Math.max(2, start - extraPages);
        for (let i = startExtra; i < start; i++) {
          pages.unshift(i);
        }
      }

      // Si solo hay una página, no mostramos nada
      if (this.totalPages <= 1) {
        return [];
      }

      return pages;
    }
  },
  watch: {
    searchText() {
      this.currentPage = 1;
    },
    priceFilter() {
      this.currentPage = 1;
    },
    brandFilter() {
      this.currentPage = 1;
    },
    categoryFilter() {
      this.currentPage = 1;
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        this.excelData = this.transformExcelData(raw);
        this.currentPage = 1;
      };

      reader.readAsArrayBuffer(file);
    },

    transformExcelData(rawRows) {
      const products = [];
      let currentCategory = "";

      for (let row of rawRows) {
        const code = row["__EMPTY"];
        const name = row["__EMPTY_1"];
        const model = row["__EMPTY_2"];
        const price = row["__EMPTY_3"];

        if (!code && name && name.trim() !== "") {
          currentCategory = name.trim();
          continue;
        }

        if (name?.toUpperCase().includes("DESCRIPCION") || code?.toUpperCase()?.includes("CODIGO")) continue;

        if (!code || !name || !price || isNaN(price)) continue;

        products.push({
          producto: {
            code: code.trim(),
            name: name.trim(),
            descripcion: "",
            price: parseFloat(price),
            status: "",
            marca: {
              name: model.trim()
            },
            categories: {
              name: currentCategory
            }
          },
          editingDesc: false,
          tempDesc: ""
        });
      }

      return products;
    },

    editDesc(index) {
      this.excelData[index].editingDesc = true;
      this.excelData[index].tempDesc = this.excelData[index].producto.descripcion || "";
    },

    saveDesc(index) {
      this.excelData[index].producto.descripcion = this.excelData[index].tempDesc;
      this.excelData[index].editingDesc = false;
    },

    cancelDesc(index) {
      this.excelData[index].editingDesc = false;
      this.excelData[index].tempDesc = "";
    },
    goToPage() {
      if (this.inputPage >= 1 && this.inputPage <= this.totalPages) {
        this.currentPage = this.inputPage;
      } else {
        this.inputPage = this.currentPage;
      }
    },
    clearFilters() {
      this.searchText = '';
      this.priceFilter = '';
      this.brandFilter = '';
      this.categoryFilter = '';
      this.currentPage = 1;
    }
  }
};
</script>

<style scoped>
.import-container {
  padding: 20px;
}

.table-container {
  max-height: 500px;
  overflow-y: auto;
  margin-top: 20px;
  border: 1px solid #ccc;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.preview-table th,
.preview-table td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
  word-wrap: break-word;
}

.pagination {
  display: flex;
  gap: 5px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.page-link {
  min-width: 40px;
  text-align: center;
}

.page-item.disabled .page-link {
  pointer-events: none;
  opacity: 0.6;
}

.page-item.active .page-link {
  font-weight: bold;
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.input-group {
  height: 38px;
}

.input-group input {
  text-align: center;
}
</style>