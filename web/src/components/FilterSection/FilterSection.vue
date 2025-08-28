<template>
    <div class="card mb-4">
        <div class="card-body">
            <div class="row g-3">
                <!-- Search -->
                <div v-if="hasSearch" class="col-md-3">
                    <label class="form-label">Buscar</label>
                    <input type="text" class="form-control" :placeholder="searchPlaceholder" :value="modelValue.search"
                        @input="updateDebounced('search', $event.target.value)" />
                </div>

                <!-- Date Filter -->
                <div v-if="hasDateFilter" class="col-md-3">
                    <label class="form-label">Fecha</label>
                    <input type="date" class="form-control" :value="modelValue.date"
                        @change="updateAndFilter('date', $event.target.value)" />
                </div>

                <!-- Per Page -->
                <div v-if="hasPerPage" class="col-md-2">
                    <label class="form-label">Mostrar</label>
                    <select class="form-select" :value="modelValue.perPage"
                        @change="updateAndFilter('perPage', $event.target.value)">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="all">Todas</option>
                    </select>
                </div>

                <!-- Dynamic Filters -->
                <div v-for="filter in dynamicFilters" :key="filter.key" :class="filter.col || 'col-md-2'">
                    <label class="form-label">{{ filter.label }}</label>
                    <select class="form-select" :value="modelValue[filter.key]"
                        @change="updateAndFilter(filter.key, $event.target.value)">
                        <option value="">{{ filter.placeholder || 'Todos' }}</option>
                        <option v-for="option in filter.options" :key="option.value" :value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-6 col-md-2">
                    <button @click="clear" class="btn btn-outline-secondary">
                        <font-awesome-icon icon="eraser" class="me-2" />
                        Limpiar
                    </button>
                </div>
                <div class="col-6 col-md-2 ms-md-auto justify-content-end d-flex">
                    <slot name="extra-buttons"></slot>
                </div>
            </div>
        </div>
    </div>
</template>


<script src="./FilterSection.js"></script>