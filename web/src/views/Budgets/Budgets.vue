<template>
  <div class="budgets-view">
    <h1>Solicitudes de Presupuesto</h1>

    <FilterSection v-model="filters" :config="filterConfig" @filter="applyFilters" @clear="clearFilters" />

    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="hasNoResults" class="alert alert-info">
          No se encontraron solicitudes que coincidan con los filtros aplicados.
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th @click="sort('user.firstName')" class="sortable">
                    Usuario
                    <font-awesome-icon v-if="filters.sortBy === 'user.firstName'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('updatedAt')" class="sortable">
                    Fecha
                    <font-awesome-icon v-if="filters.sortBy === 'updatedAt'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Total (Bs.)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(budget, index) in budgets" :key="budget.id"
                  :class="{ 'table-info': budget.id === highlightedBudgetId }">
                  <td>{{ filters.perPage === 'all' ? index + 1 : (pagination.currentPage - 1) * filters.perPage + index +
                    1 }}</td>
                  <td>{{ budget.user.firstName }} {{ budget.user.lastName }}</td>
                  <td>{{ new Date(budget.updatedAt).toLocaleDateString() }}</td>
                  <td>{{ budget.items.length }}</td>
                  <td>{{ formatCurrency(calculateTotal(budget.items)) }}</td>
                  <td>
                    <span v-if="rate">{{ formatCurrency(calculateTotal(budget.items) * rate, 'Bs.', 'after')
                    }}</span>
                    <span v-else>Calculando...</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-info me-2 text-white" @click="viewBudget(budget)">
                      <font-awesome-icon icon="eye" /> Ver
                    </button>
                    <button class="btn btn-sm btn-secondary me-2" @click="download(budget)">
                      <font-awesome-icon icon="download" /> Descargar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination v-if="showPagination" :current-page="pagination.currentPage" :total-pages="pagination.totalPages"
            @page-changed="changePage" />
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedBudget" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles del Presupuesto #{{ selectedBudget.id }}</h5>
            <button type="button" class="btn-close" @click="selectedBudget = null"></button>
          </div>
          <div class="modal-body">
            <h6>Usuario: {{ selectedBudget.user.firstName }} {{ selectedBudget.user.lastName }} ({{
              selectedBudget.user.email }})</h6>
            <table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Precio Unitario (Bs.)</th>
                  <th>Subtotal</th>
                  <th>Subtotal (Bs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedBudget.items" :key="item.id">
                  <td>{{ item.product.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.price) }}</td>
                  <td>
                    <span v-if="rate">{{ formatCurrency(item.price * rate, 'Bs.', 'after') }}</span>
                    <span v-else>...</span>
                  </td>
                  <td>{{ formatCurrency(item.quantity * item.price) }}</td>
                  <td>
                    <span v-if="rate">{{ formatCurrency(item.quantity * item.price * rate, 'Bs.', 'after') }}</span>
                    <span v-else>...</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="4" class="text-end">Total:</th>
                  <th>{{ formatCurrency(calculateTotal(selectedBudget.items)) }}</th>
                  <th>
                    <span v-if="rate">{{ formatCurrency(calculateTotal(selectedBudget.items) * rate, 'Bs.', 'after')
                      }}</span>
                    <span v-else>...</span>
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="selectedBudget = null">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Budgets.js"></script>
