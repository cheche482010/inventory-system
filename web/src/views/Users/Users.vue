<template>
  <div class="users">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Usuarios</h1>
      <div class="btn-group">
        <button v-if="canCreate" @click="showCreateModal = true" class="btn btn-primary">
          <font-awesome-icon icon="plus" class="me-2" />
          Nuevo Usuario
        </button>
        <!-- <button @click="clearFilters" class="btn btn-outline-secondary">
          <font-awesome-icon icon="eraser" class="me-2" />
          Limpiar Filtros
        </button> -->
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Buscar</label>
            <input type="text" class="form-control" placeholder="Nombre, apellido o email..." v-model="filters.search"
              @input="debouncedSearch" />
          </div>
          <div class="col-md-2">
            <label class="form-label">Mostrar</label>
            <select class="form-select" v-model="filters.limit" @change="applyFilters">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Rol</label>
            <select class="form-select" v-model="filters.role" @change="applyFilters">
              <option value="">Todos</option>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="dev">Desarrollador</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Estado</label>
            <select class="form-select" v-model="filters.isActive" @change="applyFilters">
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div class="col-md-3">
            <button @click="clearFilters" class="btn btn-outline-secondary">
              <font-awesome-icon icon="eraser" class="me-2" />
              Limpiar Filtros
            </button>
          </div>
        </div>
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
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Login</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="hasNoResults">
                  <td colspan="7" class="text-center py-4">
                    <div class="alert alert-info">
                      <font-awesome-icon icon="exclamation-triangle" class="me-2" />
                      No se encontraron usuarios que coincidan con los filtros aplicados.
                    </div>
                  </td>
                </tr>
                <tr v-for="user in users" :key="user.id" v-else>
                  <td>{{ user.id }}</td>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="`badge bg-${getRoleBadgeColor(user.role)}`">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span :class="`badge bg-${user.isActive ? 'success' : 'danger'}`">
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.lastLogin) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-info" @click="viewUser(user)" title="Ver">
                        <font-awesome-icon icon="eye" />
                      </button>
                      <button v-if="canUpdate && user.id !== currentUser?.id" class="btn btn-outline-warning"
                        @click="editUser(user)" title="Editar">
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button v-if="user.isActive && user.id !== currentUser?.id" class="btn btn-outline-secondary"
                        @click="toggleUserStatus(user)" title="Desactivar">
                        <font-awesome-icon icon="lock" />
                      </button>
                      <button v-else-if="!user.isActive" class="btn btn-outline-success" @click="toggleUserStatus(user)"
                        title="Activar">
                        <font-awesome-icon icon="unlock" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <nav v-if="showPagination">
            <ul class="pagination justify-content-center  mt-3">
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

    <!-- Create/Edit Modal -->
    <UserModal v-if="showCreateModal || editingUser" :user="editingUser" @close="closeModal" @saved="handleSaved" />

    <!-- View Modal -->
    <UserViewModal v-if="viewingUser" :user="viewingUser" @close="viewingUser = null" />
  </div>
</template>

<script src="./Users.js"></script>
