<template>
  <div class="product-form">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
      <router-link to="/products" class="btn btn-outline-secondary">
        <font-awesome-icon icon="times" class="me-2" />
        Cancelar
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="code" class="form-label">Código *</label>
                <input
                  type="text"
                  class="form-control"
                  id="code"
                  v-model="form.code"
                  :class="{ 'is-invalid': errors.code }"
                  required
                  :disabled="loading"
                />
                <div v-if="errors.code" class="invalid-feedback">
                  {{ errors.code }}
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="price" class="form-label">Precio *</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    id="price"
                    v-model="form.price"
                    :class="{ 'is-invalid': errors.price }"
                    required
                    :disabled="loading"
                  />
                  <div v-if="errors.price" class="invalid-feedback">
                    {{ errors.price }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="name" class="form-label">Nombre del Producto *</label>
            <textarea
              class="form-control"
              id="name"
              rows="2"
              v-model="form.name"
              :class="{ 'is-invalid': errors.name }"
              required
              :disabled="loading"
            ></textarea>
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

          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label for="status" class="form-label">Estado *</label>
                <select
                  class="form-select"
                  id="status"
                  v-model="form.status"
                  :class="{ 'is-invalid': errors.status }"
                  required
                  :disabled="loading"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="disponible">Disponible</option>
                  <option value="nuevo">Producto Nuevo</option>
                  <option value="oferta">Oferta</option>
                  <option value="agotado">Agotado</option>
                </select>
                <div v-if="errors.status" class="invalid-feedback">
                  {{ errors.status }}
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label for="brandId" class="form-label">Marca *</label>
                <select
                  class="form-select"
                  id="brandId"
                  v-model="form.brandId"
                  :class="{ 'is-invalid': errors.brandId }"
                  required
                  :disabled="loading"
                >
                  <option value="">Seleccionar marca</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
                <div v-if="errors.brandId" class="invalid-feedback">
                  {{ errors.brandId }}
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label for="categoryId" class="form-label">Categoría *</label>
                <select
                  class="form-select"
                  id="categoryId"
                  v-model="form.categoryId"
                  :class="{ 'is-invalid': errors.categoryId }"
                  required
                  :disabled="loading"
                >
                  <option value="">Seleccionar categoría</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <div v-if="errors.categoryId" class="invalid-feedback">
                  {{ errors.categoryId }}
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <router-link to="/products" class="btn btn-secondary">
              Cancelar
            </router-link>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <font-awesome-icon icon="save" class="me-2" />
              {{ isEdit ? 'Actualizar' : 'Crear' }} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'

export default {
  name: 'ProductForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const productStore = useProductStore()
    
    const loading = ref(false)
    const brands = ref([])
    const categories = ref([])
    const errors = ref({})
    
    const form = ref({
      code: '',
      name: '',
      description: '',
      price: '',
      status: '',
      brandId: '',
      categoryId: ''
    })

    const isEdit = computed(() => !!route.params.id)

    const loadData = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          brandService.getAll(),
          categoryService.getAll()
        ])
        
        brands.value = brandsResponse.data
        categories.value = categoriesResponse.data

        if (isEdit.value) {
          const product = await productStore.fetchProduct(route.params.id)
          form.value = {
            code: product.code,
            name: product.name,
            description: product.description || '',
            price: product.price,
            status: product.status,
            brandId: product.brandId,
            categoryId: product.categoryId
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.code.trim()) {
        errors.value.code = 'El código es requerido'
      }
      
      if (!form.value.name.trim()) {
        errors.value.name = 'El nombre es requerido'
      }
      
      if (!form.value.price || form.value.price <= 0) {
        errors.value.price = 'El precio debe ser mayor a 0'
      }
      
      if (!form.value.status) {
        errors.value.status = 'El estado es requerido'
      }
      
      if (!form.value.brandId) {
        errors.value.brandId = 'La marca es requerida'
      }
      
      if (!form.value.categoryId) {
        errors.value.categoryId = 'La categoría es requerida'
      }

      return Object.keys(errors.value).length === 0
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true
      try {
        if (isEdit.value) {
          await productStore.updateProduct(route.params.id, form.value)
        } else {
          await productStore.createProduct(form.value)
        }
        router.push('/products')
      } catch (error) {
        // Error handled in store
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      form,
      loading,
      brands,
      categories,
      errors,
      isEdit,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.product-form {
  .card {
    @include card-shadow;
  }
  
  .form-control, .form-select {
    border-radius: var(--border-radius);
    
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  }
}
</style>
