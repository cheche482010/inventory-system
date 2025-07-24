import api from "./api"

export const permissionService = {
  getAll(params) {
    return api.get("/permissions", { params })
  },

  getById(id) {
    return api.get(`/permissions/${id}`)
  },

  create(data) {
    return api.post("/permissions", data)
  },

  update(id, data) {
    return api.put(`/permissions/${id}`, data)
  },

  delete(id) {
    return api.delete(`/permissions/${id}`)
  },

  getUserPermissions(userId) {
    return api.get(`/permissions/user/${userId}`)
  },
}
