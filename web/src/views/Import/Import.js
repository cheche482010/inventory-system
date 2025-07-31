import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { importService } from '@/services/importService';
import Pagination from '@/components/Pagination/Pagination.vue';

export default {
    name: 'ImportarExcel',
    components: {
        Pagination,
    },
    data() {
        return {
            excelData: [],
            currentPage: 1,
            pageSize: 10,
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
        onPageChanged(page) {
            this.currentPage = page;
        },
        clearFilters() {
            this.searchText = '';
            this.priceFilter = '';
            this.brandFilter = '';
            this.categoryFilter = '';
            this.currentPage = 1;
        },
        async saveData() {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Deseas importar estos datos al sistema?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                this.validateAndImport();
            }
        },
        async validateAndImport() {
            const itemsWithoutStatus = this.excelData.filter(item => !item.producto.status);

            if (itemsWithoutStatus.length > 0) {
                const { value: defaultStatus } = await Swal.fire({
                    title: 'Productos sin estatus',
                    text: `Hay ${itemsWithoutStatus.length} productos sin estatus. Selecciona un estatus por defecto:`,
                    icon: 'warning',
                    input: 'select',
                    inputOptions: {
                        'disponible': 'Disponible',
                        'nuevo': 'Nuevo',
                        'oferta': 'Oferta',
                        'agotado': 'Agotado'
                    },
                    inputPlaceholder: 'Selecciona un estatus',
                    showCancelButton: true,
                    confirmButtonText: 'Aplicar y guardar',
                    cancelButtonText: 'Cancelar',
                    inputValidator: (value) => {
                        if (!value) {
                            return 'Debes seleccionar un estatus por defecto';
                        }
                    }
                });

                if (defaultStatus) {
                    itemsWithoutStatus.forEach(item => {
                        item.producto.status = defaultStatus;
                    });
                    this.processImport();
                }
            } else {
                this.processImport();
            }
        },
        async processImport() {
            const dataToImport = this.excelData.map(item => ({
                code: item.producto.code,
                name: item.producto.name,
                description: item.producto.descripcion,
                price: item.producto.price,
                status: item.producto.status,
                brand: item.producto.marca.name,
                category: item.producto.categories.name,
            }));

            try {
                const response = await importService.importData(dataToImport);
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Ocurrió un error desconocido';
                const errorDetails = error.response?.data?.errors ?
                    `<br><pre>${JSON.stringify(error.response.data.errors, null, 2)}</pre>` : '';

                Swal.fire({
                    title: 'Error al importar',
                    html: errorMessage + errorDetails,
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    }
};