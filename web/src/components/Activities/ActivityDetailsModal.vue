<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalles de la Actividad</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Información General</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>ID:</strong></td>
                    <td>{{ activity.id }}</td>
                  </tr>
                  <tr>
                    <td><strong>Fecha:</strong></td>
                    <td>{{ formatDate(activity.createdAt) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Acción:</strong></td>
                    <td>
                      <span :class="`badge bg-${getActionBadgeColor(activity.action)}`">
                        {{ getActionLabel(activity.action) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Recurso:</strong></td>
                    <td>
                      <span class="badge bg-info">
                        {{ getResourceLabel(activity.resource) }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="activity.resourceId">
                    <td><strong>ID del Recurso:</strong></td>
                    <td>{{ activity.resourceId }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Usuario y Sistema</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Usuario:</strong></td>
                    <td>{{ activity.user?.firstName }} {{ activity.user?.lastName }}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{{ activity.user?.email }}</td>
                  </tr>
                  <tr>
                    <td><strong>IP:</strong></td>
                    <td>{{ activity.ipAddress }}</td>
                  </tr>
                  <tr>
                    <td><strong>User Agent:</strong></td>
                    <td class="text-break">{{ activity.userAgent }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activity.details" class="mt-3">
            <h6>Detalles Técnicos</h6>
            <pre class="bg-light p-3 rounded"><code>{{ JSON.stringify(activity.details, null, 2) }}</code></pre>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./ActivityDetailsModal.js"></script>
