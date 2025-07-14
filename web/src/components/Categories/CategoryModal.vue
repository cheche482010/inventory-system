<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? 'Editar Categoría' : 'Nueva Categoría' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="name" class="form-label">Nombre de la Categoría *</label>
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

            <div class="mb-3">
              <label for="description" class="form-label">Descripción</label>
              <textarea
                class="form-control"
                id="description"
                rows="3"
                v-model="form.description"
                :disabled="loading"
              ></textarea>
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
import { categoryService } from '@/services/categoryService'
import { useToast } from 'vue-toastification'

export default {
  name: 'CategoryModal',
  props: {
    category: {
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
      name: '',
      description: ''
    })

    const isEdit = computed(() => !!props.category)

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
          await categoryService.update(props.category.id, form.value)
          toast.success('Categoría actualizada exitosamente')
        } else {
          await categoryService.create(form.value)
          toast.success('Categoría creada exitosamente')
        }
        emit('saved')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al guardar categoría')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (props.category) {
        form.value.name = props.category.name
        form.value.description = props.category.description || ''
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
