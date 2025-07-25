<template>
  <div class="container mt-4">
    <h3>Importar Datos desde Excel</h3>

    <!-- Carga de archivo -->
    <input type="file" @change="handleFileUpload" accept=".xlsx, .xls" class="form-control mb-4" />

    <!-- Vista previa -->
    <div v-if="excelData.length">
      <h5>Vista previa:</h5>
      <div class="table-container mb-3">
        <table class="table table-bordered table-sm">
          <thead class="table-dark">
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
            <tr v-for="(item, index) in paginatedData" :key="index">
              <td>{{ item.producto.code }}</td>
              <td>{{ item.producto.name }}</td>
              <td>$ {{ item.producto.price }}</td>
              <td>{{ item.producto.marca.name }}</td>
              <td>{{ item.producto.categories.name }}</td>

              <!-- Descripción -->
              <td>
                <div v-if="!item.editingDesc">
                  <span>{{ item.producto.descripcion }}</span>
                  <button class="btn btn-sm btn-outline-primary ms-2" @click="editDesc(index + startIndex)">+</button>
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
      <nav>
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
      inputPage: 1
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.excelData.length / this.pageSize);
    },
    startIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    paginatedData() {
      return this.excelData.slice(this.startIndex, this.startIndex + this.pageSize);
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