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
                <th>Estado</th>
                <th>Items</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="budget in myBudgets" :key="budget.id">
                <td>#{{ budget.id }}</td>
                <td>{{ new Date(budget.updatedAt).toLocaleDateString() }}</td>
                <td>
                  <span :class="`badge bg-${statusColor(budget.status)}`"
                    >{{ budget.status }}</span
                  >
                </td>
                <td>{{ budget.items.length }}</td>
                <td>${{ calculateTotal(budget.items).toFixed(2) }}</td>
                <td>
                  <button
                    v-if="budget.status === 'approved'"
                    class="btn btn-sm btn-success"
                    @click="download(budget.id)"
                  >
                    <font-awesome-icon icon="download" /> Descargar PDF
                  </button>
                  <span v-else class="text-muted small">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./MyRequests.js"></script>
