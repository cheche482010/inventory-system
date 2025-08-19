<template>
  <div class="my-requests-view">
    <h1>Mis Solicitudes de Presupuesto</h1>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="myBudgets.length === 0" class="alert alert-info">
      No has enviado ninguna solicitud de presupuesto.
    </div>

    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Total (Bs.)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="budget in myBudgets" :key="budget.id">
                <td>#{{ budget.id }}</td>
                <td>{{ new Date(budget.updatedAt).toLocaleDateString() }}</td>
                <td>{{ budget.items.length }}</td>
                <td>{{ formatCurrency(calculateTotal(budget.items)) }}</td>
                <td>
                  <span v-if="rate">{{ formatCurrency(calculateTotal(budget.items) * rate, 'Bs.', 'after') }}</span>
                  <span v-else>Calculando...</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-info me-2 text-white" @click="viewBudget(budget)">
                    <font-awesome-icon icon="eye" /> Ver
                  </button>
                  <button class="btn btn-sm btn-secondary me-2" @click="download(budget.id)">
                    <font-awesome-icon icon="file-pdf" /> PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
                    <span v-if="rate">{{ formatCurrency(calculateTotal(selectedBudget.items) * rate, 'Bs.', 'after') }}</span>
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
</template>

<script src="./MyRequests.js"></script>
