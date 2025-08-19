<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Gestionar Permisos - {{ userName }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Permisos Asignados</h6>
              <ul class="list-group" style="max-height: 300px; overflow-y: auto;">
                <li v-for="permission in assignedPermissions" :key="permission.id"
                    class="list-group-item d-flex justify-content-between align-items-center">
                  {{ permission.description }}
                  <button class="btn btn-danger btn-sm" @click="revokePermission(permission.id)">
                    <font-awesome-icon icon="trash" />
                  </button>
                </li>
                <li v-if="assignedPermissions.length === 0" class="list-group-item text-muted">
                  No hay permisos asignados
                </li>
              </ul>
            </div>
            <div class="col-md-6">
              <h6>Permisos Disponibles</h6>
              <ul class="list-group" style="max-height: 300px; overflow-y: auto;">
                <li v-for="permission in availablePermissions" :key="permission.id"
                    class="list-group-item d-flex justify-content-between align-items-center">
                  {{ permission.description }}
                  <button class="btn btn-success btn-sm" @click="assignPermission(permission.id)">
                    <font-awesome-icon icon="plus" />
                  </button>
                </li>
                <li v-if="availablePermissions.length === 0" class="list-group-item text-muted">
                  Todos los permisos están asignados
                </li>
              </ul>
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

<script src="./UserPermissionsModal.js"></script>