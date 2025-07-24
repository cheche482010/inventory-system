<template>
    <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEdit ? 'Editar Permiso' : 'Nuevo Permiso' }}</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <form @submit.prevent="handleSubmit">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="name" class="form-label">Nombre del Permiso *</label>
                            <input type="text" class="form-control" id="name" v-model="form.name"
                                :class="{ 'is-invalid': errors.name }" required :disabled="loading"
                                placeholder="ej: reports:read" />
                            <div v-if="errors.name" class="invalid-feedback">
                                {{ errors.name }}
                            </div>
                            <div class="form-text">
                                Formato recomendado: recurso:acción (ej: products:create)
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Descripción</label>
                            <textarea class="form-control" id="description" rows="2" v-model="form.description"
                                :disabled="loading" placeholder="Descripción del permiso"></textarea>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="resource" class="form-label">Recurso *</label>
                                    <select class="form-select" id="resource" v-model="form.resource"
                                        :class="{ 'is-invalid': errors.resource }" required :disabled="loading">
                                        <option value="">Seleccionar recurso</option>
                                        <option value="products">Productos</option>
                                        <option value="brands">Marcas</option>
                                        <option value="categories">Categorías</option>
                                        <option value="users">Usuarios</option>
                                        <option value="activities">Actividades</option>
                                        <option value="dashboard">Dashboard</option>
                                        <option value="permissions">Permisos</option>
                                        <option value="import">Importación</option>
                                        <option value="reports">Reportes</option>
                                    </select>
                                    <div v-if="errors.resource" class="invalid-feedback">
                                        {{ errors.resource }}
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="action" class="form-label">Acción *</label>
                                    <select class="form-select" id="action" v-model="form.action"
                                        :class="{ 'is-invalid': errors.action }" required :disabled="loading">
                                        <option value="">Seleccionar acción</option>
                                        <option value="read">Leer (read)</option>
                                        <option value="create">Crear (create)</option>
                                        <option value="update">Actualizar (update)</option>
                                        <option value="delete">Eliminar (delete)</option>
                                        <option value="export">Exportar (export)</option>
                                        <option value="import">Importar (import)</option>
                                    </select>
                                    <div v-if="errors.action" class="invalid-feedback">
                                        {{ errors.action }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
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
</template>

<script src="./Permissions.js"></script>