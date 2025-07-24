import api from "./api"

export const userService = {
  getAll() {
    return api.get("/users")
  },

  searchUsers(params) {
    return api.get("/users/search", { params })
  },

  create(data) {
    return api.post("/users", data)
  },

  update(id, data) {
    return api.put(`/users/${id}`, data)
  },
}
