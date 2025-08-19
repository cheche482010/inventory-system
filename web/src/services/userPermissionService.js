import api from "./api"

export const userPermissionService = {
  getPermissions(userId) {
    return api.get(`/users/${userId}/permissions`)
  },

  assignPermission(userId, permissionId) {
    return api.post(`/users/${userId}/permissions`, { permissionId })
  },

  revokePermission(userId, permissionId) {
    return api.delete(`/users/${userId}/permissions/${permissionId}`)
  },
}
