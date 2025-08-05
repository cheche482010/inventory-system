import api from "./api";

export const notificationService = {
  getAll() {
    return api.get("/notifications");
  },

  markAsRead(id) {
    return api.put(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return api.put("/notifications/mark-all-read");
  },
};
