import api from "./api";

export const budgetService = {
  getAll() {
    return api.get("/budgets");
  },

  getMyBudgets() {
    return api.get("/budgets/my");
  },

  downloadPdf(id) {
    return api.get(`/budgets/${id}/pdf`, {
        responseType: 'blob', 
    });
  },

  approve(id) {
    return api.put(`/budgets/${id}/approve`);
  },

  reject(id) {
    return api.put(`/budgets/${id}/reject`);
  },
};
