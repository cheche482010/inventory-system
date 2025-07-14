import api from "./api"

export const categoryService = {
  getAll() {
    return api.get("/categories")
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
