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
    return api.post("/products", data)
  },

  update(id, data) {
    return api.put(`/products/${id}`, data)
  },

  delete(id) {
    return api.delete(`/products/${id}`)
  },
}
