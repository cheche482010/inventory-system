<template>
    <div class="permissions">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Gestión de Permisos</h1>
            <button @click="showCreateModal = true" class="btn btn-primary">
                <font-awesome-icon icon="plus" class="me-2" />
                Nuevo Permiso
            </button>
        </div>

        <FilterSection v-model="filters" :config="filterConfig" search-placeholder="Nombre o descripción..."
            @filter="applyFilters" @clear="clearFilters" />

        <!-- Permissions Table -->
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
                                    <th @click="sort('name')" class="sortable">
                                        Nombre
                                        <font-awesome-icon v-if="filters.sortBy === 'name'"
                                            :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                                        <font-awesome-icon v-else icon="sort" class="text-muted" />
                                    </th>
                                    <th @click="sort('description')" class="sortable">
                                        Descripción
                                        <font-awesome-icon v-if="filters.sortBy === 'description'"
                                            :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                                        <font-awesome-icon v-else icon="sort" class="text-muted" />
                                    </th>
                                    <th @click="sort('resource')" class="sortable">
                                        Recurso
                                        <font-awesome-icon v-if="filters.sortBy === 'resource'"
                                            :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                                        <font-awesome-icon v-else icon="sort" class="text-muted" />
                                    </th>
                                    <th @click="sort('action')" class="sortable">
                                        Acción
                                        <font-awesome-icon v-if="filters.sortBy === 'action'"
                                            :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                                        <font-awesome-icon v-else icon="sort" class="text-muted" />
                                    </th>
                                    <th>Estado</th>
                                    <th @click="sort('createdAt')" class="sortable">
                                        Fecha Creación
                                        <font-awesome-icon v-if="filters.sortBy === 'createdAt'"
                                            :icon="filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'" />
                                        <font-awesome-icon v-else icon="sort" class="text-muted" />
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="permissions.length === 0">
                                    <td colspan="8" class="text-center py-4">
                                        <div class="alert alert-info">
                                            <font-awesome-icon icon="exclamation-triangle" class="me-2" />
                                            No se encontraron permisos que coincidan con los filtros aplicados.
                                        </div>
                                    </td>
                                </tr>
                                <tr v-for="(permission, index) in permissions" :key="permission.id" v-else>
                                    <td>{{ getRowNumber(index) }}</td>
                                    <td>
                                        <code>{{ permission.name }}</code>
                                    </td>
                                    <td>{{ permission.description }}</td>
                                    <td>
                                        <span class="badge bg-info">{{ permission.resource }}</span>
                                    </td>
                                    <td>
                                        <span :class="`badge bg-${getActionBadgeColor(permission.action)}`">
                                            {{ permission.action }}
                                        </span>
                                    </td>
                                    <td>
                                        <span :class="`badge bg-${permission.isActive ? 'success' : 'danger'}`">
                                            {{ permission.isActive ? 'Activo' : 'Inactivo' }}
                                        </span>
                                    </td>
                                    <td>{{ formatDate(permission.createdAt) }}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-warning" @click="editPermission(permission)"
                                                title="Editar">
                                                <font-awesome-icon icon="edit" />
                                            </button>
                                            <button class="btn btn-outline-danger" @click="confirmDelete(permission)"
                                                title="Eliminar">
                                                <font-awesome-icon icon="trash" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <Pagination v-if="pagination.totalPages > 1" :current-page="pagination.currentPage"
                        :total-pages="pagination.totalPages" @page-changed="changePage" />
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <PermissionModal v-if="showCreateModal || editingPermission" :permission="editingPermission" @close="closeModal"
            @saved="handleSaved" />
    </div>
</template>

<script src="./Permissions.js"></script>