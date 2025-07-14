<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? 'Editar Marca' : 'Nueva Marca' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="name" class="form-label">Nombre de la Marca *</label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="form.name"
                :class="{ 'is-invalid': errors.name }"
                required
                :disabled="loading"
              />
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEdit ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { brandService } from '@/services/brandService'
import { useToast } from 'vue-toastification'

export default {
  name: 'BrandModal',
  props: {
    brand: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const loading = ref(false)
    const errors = ref({})
    const form = ref({
      name: ''
    })

    const isEdit = computed(() => !!props.brand)

    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.name.trim()) {
        errors.value.name = 'El nombre es requerido'
      }

      return Object.keys(errors.value).length === 0
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true
      try {
        if (isEdit.value) {
          await brandService.update(props.brand.id, form.value)
          toast.success('Marca actualizada exitosamente')
        } else {
          await brandService.create(form.value)
          toast.success('Marca creada exitosamente')
        }
        emit('saved')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al guardar marca')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (props.brand) {
        form.value.name = props.brand.name
      }
    })

    return {
      form,
      loading,
      errors,
      isEdit,
      handleSubmit
    }
  }
}
</script>
