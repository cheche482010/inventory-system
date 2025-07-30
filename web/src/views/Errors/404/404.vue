<template>
    <div class="error-container">
        <div class="error-card">
            <font-awesome-icon icon="exclamation-triangle" class="error-icon text-warning mb-4" />
            <h1 class="error-title">404</h1>
            <h2 class="error-subtitle">Página No Encontrada</h2>
            <p class="error-message">Lo sentimos, la página que buscas no existe.</p>
            <router-link to="/" class="btn btn-primary mt-4">
                <font-awesome-icon icon="home" class="me-2" />
                Ir al Dashboard
            </router-link>
        </div>
    </div>
</template>

<script src="./404.js"></script>
<style scoped src="./404.scss"></style>