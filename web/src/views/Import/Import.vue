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
              <tr
                v-for="(item, index) in paginatedData"
                :key="index"
              >
                <td>{{ item.producto.code }}</td>
                <td>{{ item.producto.name }}</td>
                <td>$ {{ item.producto.price }}</td>
                <td>{{ item.producto.marca.name }}</td>
                <td>{{ item.producto.categories.name }}</td>
  
                <!-- Descripción -->
                <td>
                  <div v-if="!item.editingDesc">
                    <span>{{ item.producto.descripcion}}</span>
                    <button class="btn btn-sm btn-outline-primary ms-2" @click="editDesc(index + startIndex)">+</button>
                  </div>
                  <div v-else>
                    <input
                      v-model="item.tempDesc"
                      class="form-control form-control-sm"
                      placeholder="Escribe una descripción..."
                    />
                    <button class="btn btn-sm btn-success mt-1" @click="saveDesc(index + startIndex)">Guardar</button>
                    <button class="btn btn-sm btn-secondary mt-1 ms-1" @click="cancelDesc(index + startIndex)">Cancelar</button>
                  </div>
                </td>
  
                <!-- Estatus -->
                <td>
                  <select
                    v-model="item.producto.status"
                    class="form-select form-select-sm"
                  >
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
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--">Anterior</button>
            </li>
            <li
              class="page-item"
              v-for="page in totalPages"
              :key="page"
              :class="{ active: currentPage === page }"
            >
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++">Siguiente</button>
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
        pageSize: 10
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
  
  .pagination button {
    padding: 5px 10px;
  }
  
  .pagination button.active {
    font-weight: bold;
    background-color: #007bff;
    color: white;
  }
  
  /* Simple Modal */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 4px;
  }
  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  </style>
  