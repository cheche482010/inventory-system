<template>
    <div class="permissions">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Gestión de Permisos</h1>
            <button @click="showCreateModal = true" class="btn btn-primary">
                <font-awesome-icon icon="plus" class="me-2" />
                Nuevo Permiso
            </button>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Buscar</label>
                        <input type="text" class="form-control" placeholder="Nombre o descripción..."
                            v-model="filters.search" @input="debouncedSearch" />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Recurso</label>
                        <select class="form-select" v-model="filters.resource" @change="applyFilters">
                            <option value="">Todos los recursos</option>
                            <option value="products">Productos</option>
                            <option value="brands">Marcas</option>
                            <option value="categories">Categorías</option>
                            <option value="users">Usuarios</option>
                            <option value="activities">Actividades</option>
                            <option value="dashboard">Dashboard</option>
                            <option value="permissions">Permisos</option>
                            <option value="import">Importación</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Mostrar</label>
                        <select class="form-select" v-model="filters.limit" @change="applyFilters">
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button @click="clearFilters" class="btn btn-outline-secondary">
                            <font-awesome-icon icon="eraser" class="me-2" />
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>
        </div>

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
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Recurso</th>
                                    <th>Acción</th>
                                    <th>Estado</th>
                                    <th>Fecha Creación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="permissions.length === 0">
                                    <td colspan="7" class="text-center py-4">
                                        <div class="alert alert-info">
                                            <font-awesome-icon icon="exclamation-triangle" class="me-2" />
                                            No se encontraron permisos que coincidan con los filtros aplicados.
                                        </div>
                                    </td>
                                </tr>
                                <tr v-for="permission in permissions" :key="permission.id" v-else>
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
                            <li class="page-item"
                                :class="{ disabled: pagination.currentPage === pagination.totalPages }">
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
        <PermissionModal v-if="showCreateModal || editingPermission" :permission="editingPermission" @close="closeModal"
            @saved="handleSaved" />
    </div>
</template>

<script src="./Permissions.js"></script>
