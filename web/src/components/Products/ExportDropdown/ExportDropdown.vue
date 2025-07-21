<template>
    <div class="dropdown">
        <button class="btn btn-success dropdown-toggle" type="button" id="exportDropdown" data-bs-toggle="dropdown"
            aria-expanded="false" :disabled="loading || products.length === 0">
            <font-awesome-icon icon="download" class="me-2" />
            Exportar
            <span v-if="loading" class="spinner-border spinner-border-sm ms-2"></span>
        </button>
        <ul class="dropdown-menu" aria-labelledby="exportDropdown">
            <li>
                <h6 class="dropdown-header">Formato de exportación</h6>
            </li>
            <li>
                <button class="dropdown-item" @click="exportToPDF" :disabled="loading">
                    <font-awesome-icon icon="file-pdf" class="me-2 text-danger" />
                    Exportar a PDF
                </button>
            </li>
            <li>
                <button class="dropdown-item" @click="exportToExcel" :disabled="loading">
                    <font-awesome-icon icon="file-excel" class="me-2 text-success" />
                    Exportar a Excel
                </button>
            </li>
            <li>
                <hr class="dropdown-divider">
            </li>
            <li>
                <span class="dropdown-item-text text-muted small">
                    <font-awesome-icon icon="info-circle" class="me-1" />
                    {{ exportInfo }}
                </span>
            </li>
        </ul>
    </div>
</template>

<script src="./ExportDropdown.js"></script>
