<template>
  <div class="activities">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Bitácora de Actividades</h1>
      <div class="d-flex gap-2">
        <select class="form-select" v-model="filters.action" @change="applyFilters">
          <option value="">Todas las acciones</option>
          <option value="CREATE">Crear</option>
          <option value="UPDATE">Actualizar</option>
          <option value="DELETE">Eliminar</option>
        </select>
        <select class="form-select" v-model="filters.resource" @change="applyFilters">
          <option value="">Todos los recursos</option>
          <option value="PRODUCT">Productos</option>
          <option value="BRAND">Marcas</option>
          <option value="CATEGORY">Categorías</option>
          <option value="USER">Usuarios</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Recurso</th>
                  <th>IP</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in activities" :key="activity.id">
                  <td>{{ formatDate(activity.createdAt) }}</td>
                  <td>
                    <div>
                      <strong>{{ activity.user?.firstName }} {{ activity.user?.lastName }}</strong>
                      <br>
                      <small class="text-muted">{{ activity.user?.email }}</small>
                    </div>
                  </td>
                  <td>
                    <span :class="`badge bg-${getActionBadgeColor(activity.action)}`">
                      {{ getActionLabel(activity.action) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-info">
                      {{ getResourceLabel(activity.resource) }}
                    </span>
                  </td>
                  <td>{{ activity.ipAddress }}</td>
                  <td>
                    <button class="btn btn-outline-info btn-sm" @click="viewDetails(activity)" title="Ver detalles">
                      <font-awesome-icon icon="eye" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <nav v-if="pagination.totalPages > 1">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="changePage(pagination.currentPage - 1)">
                  Anterior
                </button>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item"
                :class="{ active: page === pagination.currentPage }">
                <button class="page-link" @click="changePage(page)">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                <button class="page-link" @click="changePage(pagination.currentPage + 1)">
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <ActivityDetailsModal v-if="selectedActivity" :activity="selectedActivity" @close="selectedActivity = null" />
  </div>
</template>

<script src="./Activities.js"></script>