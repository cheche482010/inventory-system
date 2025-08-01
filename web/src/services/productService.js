import api from "./api"

export const productService = {
  getAll(params) {
    const queryParams = { ...params }
    if (queryParams.perPage) {
      queryParams.limit = queryParams.perPage
      delete queryParams.perPage
    }
    return api.get("/products", { params: queryParams })
  },

  getById(id) {
    return api.get(`/products/${id}`)
  },

  create(data) {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {}
    return api.post("/products", data, config)
  },

  update(id, data) {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {}
    return api.put(`/products/${id}`, data, config)
  },

  delete(id) {
    return api.delete(`/products/${id}`)
  },
}
