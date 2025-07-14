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
        console.log("Error Login", error)
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