<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalles del Usuario</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Información Personal</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>{{ user.firstName }} {{ user.lastName }}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{{ user.email }}</td>
                  </tr>
                  <tr>
                    <td><strong>Rol:</strong></td>
                    <td>
                      <span :class="`badge bg-${getRoleBadgeColor(user.role)}`">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Estado:</strong></td>
                    <td>
                      <span :class="`badge bg-${user.isActive ? 'success' : 'danger'}`">
                        {{ user.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Información del Sistema</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>ID:</strong></td>
                    <td>{{ user.id }}</td>
                  </tr>
                  <tr>
                    <td><strong>Último Login:</strong></td>
                    <td>{{ formatDate(user.lastLogin) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Creado:</strong></td>
                    <td>{{ formatDate(user.createdAt) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Actualizado:</strong></td>
                    <td>{{ formatDate(user.updatedAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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

<script src="./UserViewModal.js"></script>
