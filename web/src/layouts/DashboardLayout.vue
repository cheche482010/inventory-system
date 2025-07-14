<template>
  <div class="dashboard-layout">
    <div class="row g-0">
      <!-- Sidebar -->
      <div class="col-md-3 col-lg-2">
        <nav class="sidebar p-3">
          <div class="text-center mb-4">
            <h5 class="text-white">Inventario</h5>
            <small class="text-white-50">{{ user?.firstName }} {{ user?.lastName }}</small>
          </div>

          <ul class="nav nav-pills flex-column">
            <li class="nav-item mb-2">
              <router-link to="/" class="nav-link" active-class="active">
                <font-awesome-icon icon="home" class="me-2" />
                Dashboard
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link to="/products" class="nav-link" active-class="active">
                <font-awesome-icon icon="box" class="me-2" />
                Productos
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link to="/brands" class="nav-link" active-class="active">
                <font-awesome-icon icon="tags" class="me-2" />
                Marcas
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link to="/categories" class="nav-link" active-class="active">
                <font-awesome-icon icon="tags" class="me-2" />
                Categorías
              </router-link>
            </li>
            <li class="nav-item mb-2" v-if="canViewUsers">
              <router-link to="/users" class="nav-link" active-class="active">
                <font-awesome-icon icon="users" class="me-2" />
                Usuarios
              </router-link>
            </li>
            <li class="nav-item mb-2" v-if="canViewUsers">
              <router-link to="/activities" class="nav-link" active-class="active">
                <font-awesome-icon icon="history" class="me-2" />
                Actividades
              </router-link>
            </li>
          </ul>

          <div class="mt-auto pt-3">
            <button @click="logout" class="btn btn-outline-light btn-sm w-100">
              <font-awesome-icon icon="sign-out-alt" class="me-2" />
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="col-md-9 col-lg-10">
        <main class="main-content p-4">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'DashboardLayout',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const user = computed(() => authStore.user)
    const canViewUsers = computed(() => ['admin', 'dev'].includes(authStore.user?.role))

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    onMounted(() => {
      if (!authStore.user) {
        authStore.fetchUser()
      }
    })

    return {
      user,
      canViewUsers,
      logout
    }
  }
}
</script>
