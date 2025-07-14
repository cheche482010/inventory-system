<template>
  <div class="users">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Usuarios</h1>
      <button 
        v-if="canCreate" 
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <font-awesome-icon icon="plus" class="me-2" />
        Nuevo Usuario
      </button>
    </div>

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
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Login</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="`badge bg-${getRoleBadgeColor(user.role)}`">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span :class="`badge bg-${user.isActive ? 'success' : 'danger'}`">
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.lastLogin) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-info"
                        @click="viewUser(user)"
                        title="Ver"
                      >
                        <font-awesome-icon icon="eye" />
                      </button>
                      <button 
                        v-if="canCreate && user.id !== currentUser?.id"
                        class="btn btn-outline-warning"
                        @click="editUser(user)"
                        title="Editar"
                      >
                        <font-awesome-icon icon="edit" />
                      </button>
                      <button 
                        v-if="user.isActive && user.id !== currentUser?.id"
                        class="btn btn-outline-secondary"
                        @click="toggleUserStatus(user)"
                        title="Desactivar"
                      >
                        <font-awesome-icon icon="lock" />
                      </button>
                      <button 
                        v-else-if="!user.isActive"
                        class="btn btn-outline-success"
                        @click="toggleUserStatus(user)"
                        title="Activar"
                      >
                        <font-awesome-icon icon="unlock" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UserModal
      v-if="showCreateModal || editingUser"
      :user="editingUser"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- View Modal -->
    <UserViewModal
      v-if="viewingUser"
      :user="viewingUser"
      @close="viewingUser = null"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import { useToast } from 'vue-toastification'
import UserModal from '@/components/Users/UserModal.vue'
import UserViewModal from '@/components/Users/UserViewModal.vue'

export default {
  name: 'Users',
  components: {
    UserModal,
    UserViewModal
  },
  setup() {
    const authStore = useAuthStore()
    const toast = useToast()
    
    const users = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const editingUser = ref(null)
    const viewingUser = ref(null)
    
    const canCreate = computed(() => authStore.canCreate)
    const currentUser = computed(() => authStore.user)

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await userService.getAll()
        users.value = response.data
      } catch (error) {
        toast.error('Error al cargar usuarios')
      } finally {
        loading.value = false
      }
    }

    const getRoleBadgeColor = (role) => {
      const colors = {
        dev: 'danger',
        admin: 'warning',
        user: 'info'
      }
      return colors[role] || 'secondary'
    }

    const getRoleLabel = (role) => {
      const labels = {
        dev: 'Desarrollador',
        admin: 'Administrador',
        user: 'Usuario'
      }
      return labels[role] || role
    }

    const viewUser = (user) => {
      viewingUser.value = user
    }

    const editUser = (user) => {
      editingUser.value = user
    }

    const toggleUserStatus = async (user) => {
      const action = user.isActive ? 'desactivar' : 'activar'
      if (confirm(`¿Estás seguro de ${action} al usuario "${user.firstName} ${user.lastName}"?`)) {
        try {
          await userService.update(user.id, { isActive: !user.isActive })
          toast.success(`Usuario ${action}do exitosamente`)
          loadUsers()
        } catch (error) {
          toast.error(`Error al ${action} usuario`)
        }
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingUser.value = null
    }

    const handleSaved = () => {
      closeModal()
      loadUsers()
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      showCreateModal,
      editingUser,
      viewingUser,
      canCreate,
      currentUser,
      getRoleBadgeColor,
      getRoleLabel,
      viewUser,
      editUser,
      toggleUserStatus,
      closeModal,
      handleSaved,
      formatDate
    }
  }
}
</script>
