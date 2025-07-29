<template>
  <div class="login-container">
    <div class="login-card">
      <div class="text-center mb-4">
        <h2 class="mb-3">Global Diesel</h2>
        <p class="text-muted">Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" v-model="form.email" required :disabled="loading" />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <input type="password" class="form-control" id="password" v-model="form.password" required
            :disabled="loading" />
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script src="./Login.js"></script>
<style scoped src="./Login.scss"></style>