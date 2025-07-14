<template>
  <div class="login-container">
    <div class="login-card">
      <div class="text-center mb-4">
        <h2 class="mb-3">Sistema de Inventario</h2>
        <p class="text-muted">Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="form.email"
            required
            :disabled="loading"
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="form.password"
            required
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="mt-4">
        <small class="text-muted">
          <strong>Usuarios de prueba:</strong><br>
          Admin: admin@inventory.com / admin123<br>
          Usuario: user@inventory.com / user123<br>
          Dev: dev@inventory.com / dev123
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = ref({
      email: '',
      password: ''
    })
    
    const loading = ref(false)

    const handleLogin = async () => {
      loading.value = true
      try {
        await authStore.login(form.value)
        router.push('/')
      } catch (error) {
        // Error handled in store
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      handleLogin
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--info-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.login-card {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
}
</style>
