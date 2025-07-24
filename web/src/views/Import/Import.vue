<template>
    <div class="import-data">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Importar Datos</h1>
            <div class="badge bg-warning">
                <font-awesome-icon icon="construction" class="me-2" />
                En Construcción
            </div>
        </div>

        <div class="card">
            <div class="card-body text-center py-5">
                <font-awesome-icon icon="upload" class="fa-3x text-muted mb-4" />
                <h3 class="text-muted">Funcionalidad en Desarrollo</h3>
                <p class="text-muted">
                    Esta sección permitirá importar datos desde archivos Excel y CSV.
                    <br>
                    Estará disponible próximamente.
                </p>
                <div class="mt-4">
                    <div class="alert alert-info">
                        <font-awesome-icon icon="info-circle" class="me-2" />
                        Solo usuarios con permisos de <strong>admin</strong> y <strong>dev</strong> podrán acceder a
                        esta funcionalidad.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Import'
}
</script>

<style lang="scss" scoped>
.import-data {
    .fa-3x {
        font-size: 4rem;
    }
}
</style>
