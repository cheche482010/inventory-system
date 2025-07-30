import api from "./api"

export const categoryService = {
  getAll(config = {}) {
    return api.get("/categories", config)
  },

  getAllCategories() {
    return api.get("/categories/all")
  },

  create(data) {
    return api.post("/categories", data)
  },

  update(id, data) {
    return api.put(`/categories/${id}`, data)
  },

  delete(id) {
    return api.delete(`/categories/${id}`)
  },
}
