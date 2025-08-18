<template>
  <div class="budgets-view">
    <h1>Solicitudes de Presupuesto</h1>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="budgets.length === 0" class="alert alert-info">
      No hay solicitudes de presupuesto.
    </div>

    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="budget in budgets" :key="budget.id">
                <td>#{{ budget.id }}</td>
                <td>{{ budget.user.firstName }} {{ budget.user.lastName }}</td>
                <td>{{ new Date(budget.updatedAt).toLocaleDateString() }}</td>
                <td>{{ budget.items.length }}</td>
                <td>${{ calculateTotal(budget.items).toFixed(2) }}</td>
                <td>
                  <button class="btn btn-sm btn-info me-2" @click="viewBudget(budget)">
                    <font-awesome-icon icon="eye" /> Ver
                  </button>
                  <button class="btn btn-sm btn-secondary me-2" @click="download(budget)">
                    <font-awesome-icon icon="file-pdf" /> PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedBudget" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
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
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedBudget.items" :key="item.id">
                  <td>{{ item.product.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>${{ item.price }}</td>
                  <td>${{ (item.quantity * item.price).toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="3" class="text-end">Total:</th>
                  <th>${{ calculateTotal(selectedBudget.items).toFixed(2) }}</th>
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
