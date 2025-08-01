


import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { faBars, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { library } from "@fortawesome/fontawesome-svg-core"

library.add(faBars, faChevronLeft, faChevronRight)

export default {
    name: 'DashboardLayout',
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()
        const isSidebarOpen = ref(true)
        const isMobile = ref(false)
        const mediaQuery = ref(null)

        const user = computed(() => authStore.user)
        const canCreate = computed(() => authStore.canCreate)
        const canViewUsers = computed(() => authStore.canViewUsers)
        const canViewActivities = computed(() => authStore.canViewActivities)
        const canViewPermissions = computed(() => authStore.canViewPermissions)
        const canViewDashboard = computed(() => authStore.canViewDashboard)
        const canImport = computed(() => authStore.canImport)

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

        const logout = () => {
            authStore.logout()
            router.push('/login')
        }

        const toggleSidebar = () => {
            isSidebarOpen.value = !isSidebarOpen.value
        }

        const closeSidebarOnMobile = () => {
            if (isMobile.value) {
                isSidebarOpen.value = false
            }
        }

        const handleMediaQueryChange = (e) => {
            isMobile.value = !e.matches
            if (e.matches) {
                isSidebarOpen.value = true
            } else {
                isSidebarOpen.value = false
            }
        }

        onMounted(() => {
            if (!authStore.user) {
                authStore.fetchUser()
            }

            mediaQuery.value = window.matchMedia('(min-width: 768px)')
            isMobile.value = !mediaQuery.value.matches
            isSidebarOpen.value = mediaQuery.value.matches
            mediaQuery.value.addEventListener('change', handleMediaQueryChange)
        })

        onUnmounted(() => {
            if (mediaQuery.value) {
                mediaQuery.value.removeEventListener('change', handleMediaQueryChange)
            }
        })

        return {
            user,
            canCreate,
            canViewUsers,
            canViewActivities,
            canViewPermissions,
            canViewDashboard,
            canImport,
            getRoleBadgeColor,
            getRoleLabel,
            logout,
            isSidebarOpen,
            isMobile,
            toggleSidebar,
            closeSidebarOnMobile
        }
    }
}

