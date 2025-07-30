<template>
    <div class="user-permissions">
        <h5>Permisos</h5>
        <div class="row">
            <div class="col-md-6">
                <h6>Permisos Asignados</h6>
                <ul class="list-group">
                    <li v-for="permission in assignedPermissions" :key="permission.id"
                        class="list-group-item d-flex justify-content-between align-items-center">
                        {{ permission.description }}
                        <button class="btn btn-danger btn-sm" @click="revokePermission(permission.id)">
                            <font-awesome-icon icon="trash" />
                        </button>
                    </li>
                </ul>
            </div>
            <div class="col-md-6">
                <h6>Permisos Disponibles</h6>
                <ul class="list-group">
                    <li v-for="permission in availablePermissions" :key="permission.id"
                        class="list-group-item d-flex justify-content-between align-items-center">
                        {{ permission.description }}
                        <button class="btn btn-success btn-sm" @click="assignPermission(permission.id)">
                            <font-awesome-icon icon="plus" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script src="./UserPermissions.js"></script>
