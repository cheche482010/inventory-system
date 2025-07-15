<template>
  <div class="error-container">
    <div class="error-card">
      <font-awesome-icon icon="lock" class="error-icon text-danger mb-4" />
      <h1 class="error-title">403</h1>
      <h2 class="error-subtitle">Acceso Denegado</h2>
      <p class="error-message">No tienes permiso para acceder a esta página.</p>
      <router-link to="/" class="btn btn-primary mt-4">
        <font-awesome-icon icon="home" class="me-2" />
        Ir al Dashboard
      </router-link>
    </div>
  </div>
</template>

<script src="./403.js"></script>
<style scoped src="./403.scss"></style>