<template>
  <div class="users">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Usuarios</h1>
      <div class="btn-group">
        <button v-if="canCreate" @click="showCreateModal = true" class="btn btn-primary">
          <font-awesome-icon icon="plus" class="me-2" />
          Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Filters -->
    <FilterSection v-model="filters" :config="filterConfig" search-placeholder="Nombre, apellido o email..."
      @filter="applyFilters" @clear="clearFilters" />

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
                  <th>#</th>
                  <th @click="sort('firstName')" class="sortable">
                    Nombre
                    <font-awesome-icon v-if="filters.sortBy === 'firstName'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('email')" class="sortable">
                    Email
                    <font-awesome-icon v-if="filters.sortBy === 'email'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('role')" class="sortable">
                    Rol
                    <font-awesome-icon v-if="filters.sortBy === 'role'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('isActive')" class="sortable">
                    Estado
                    <font-awesome-icon v-if="filters.sortBy === 'isActive'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
                  <th @click="sort('lastLogin')" class="sortable">
                    Último Login
                    <font-awesome-icon v-if="filters.sortBy === 'lastLogin'"
                      :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                    <font-awesome-icon v-else icon="sort" class="text-muted" />
                  </th>
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
                <tr v-for="(user, index) in users" :key="user.id" v-else>
                  <td>{{ getRowNumber(index) }}</td>
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
          <Pagination v-if="showPagination" :current-page="pagination.currentPage" :total-pages="pagination.totalPages"
            @page-changed="changePage" />
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
