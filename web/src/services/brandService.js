import api from "./api"

export const brandService = {
  getAll(config = {}) {
    return api.get("/brands", config)
  },

  create(data) {
    return api.post("/brands", data)
  },

  update(id, data) {
    return api.put(`/brands/${id}`, data)
  },

  delete(id) {
    return api.delete(`/brands/${id}`)
  },
}
