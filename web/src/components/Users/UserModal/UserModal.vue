<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="firstName" class="form-label">Nombre *</label>
                  <input type="text" class="form-control" id="firstName" v-model="form.firstName"
                    :class="{ 'is-invalid': errors.firstName }" required :disabled="loading" />
                  <div v-if="errors.firstName" class="invalid-feedback">
                    {{ errors.firstName }}
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label for="lastName" class="form-label">Apellido *</label>
                  <input type="text" class="form-control" id="lastName" v-model="form.lastName"
                    :class="{ 'is-invalid': errors.lastName }" required :disabled="loading" />
                  <div v-if="errors.lastName" class="invalid-feedback">
                    {{ errors.lastName }}
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email *</label>
              <input type="email" class="form-control" id="email" v-model="form.email"
                :class="{ 'is-invalid': errors.email }" required :disabled="loading || isEdit" />
              <div v-if="errors.email" class="invalid-feedback">
                {{ errors.email }}
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="password" class="form-label">
                    {{ isEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña *' }}
                  </label>
                  <input type="password" class="form-control" id="password" v-model="form.password"
                    :class="{ 'is-invalid': errors.password }" :required="!isEdit" :disabled="loading" />
                  <div v-if="errors.password" class="invalid-feedback">
                    {{ errors.password }}
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label for="role" class="form-label">Rol *</label>
                  <select class="form-select" id="role" v-model="form.role" :class="{ 'is-invalid': errors.role }"
                    required :disabled="loading">
                    <option value="">Seleccionar rol</option>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="dev">Desarrollador</option>
                  </select>
                  <div v-if="errors.role" class="invalid-feedback">
                    {{ errors.role }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="canManagePermissions" type="button" class="btn btn-info text-white me-auto" @click="openPermissionsModal">
              <font-awesome-icon icon="key" class="me-1" />
              Gestionar Permisos
            </button>
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEdit ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <UserPermissionsModal 
    v-if="showPermissionsModal && userForPermissions" 
    :user-id="userForPermissions.id" 
    :user-name="`${userForPermissions.firstName} ${userForPermissions.lastName}`"
    @close="closePermissionsModal" 
  />
</template>

<script src="./UserModal.js"></script>
