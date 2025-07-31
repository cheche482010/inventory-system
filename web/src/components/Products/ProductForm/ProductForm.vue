<template>
  <div class="product-form">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="code" class="form-label">Código *</label>
                <input type="text" class="form-control" id="code" v-model="form.code"
                  :class="{ 'is-invalid': errors.code }" required :disabled="loading" />
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
                  <input type="number" step="0.01" min="0" class="form-control" id="price" v-model="form.price"
                    :class="{ 'is-invalid': errors.price }" required :disabled="loading" />
                  <div v-if="errors.price" class="invalid-feedback">
                    {{ errors.price }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="name" class="form-label">Nombre del Producto *</label>
            <textarea class="form-control" id="name" rows="2" v-model="form.name" :class="{ 'is-invalid': errors.name }"
              required :disabled="loading"></textarea>
            <div v-if="errors.name" class="invalid-feedback">
              {{ errors.name }}
            </div>
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Descripción</label>
            <textarea class="form-control" id="description" rows="3" v-model="form.description"
              :disabled="loading"></textarea>
          </div>

          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label for="status" class="form-label">Estado *</label>
                <select class="form-select" id="status" v-model="form.status" :class="{ 'is-invalid': errors.status }"
                  required :disabled="loading">
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
                <select class="form-select" id="brandId" v-model="form.brandId"
                  :class="{ 'is-invalid': errors.brandId }" required :disabled="loading">
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
                <select class="form-select" id="categoryId" v-model="form.categoryId"
                  :class="{ 'is-invalid': errors.categoryId }" required :disabled="loading">
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
            <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <font-awesome-icon icon="save" class="me-2" />
              {{ isEdit ? 'Actualizar' : 'Crear' }} Producto
            </button>
          </div>
        </form>
  </div>
</template>

<script src="./ProductForm.js"></script>
<style scoped src="./ProductForm.scss"></style>
