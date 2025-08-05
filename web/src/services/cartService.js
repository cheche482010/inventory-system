import api from "./api";

export const cartService = {
  getCart() {
    return api.get("/cart");
  },

  addItem(item) {
    return api.post("/cart/items", item);
  },

  removeItem(productId) {
    return api.delete(`/cart/items/${productId}`);
  },

  submitCart() {
    return api.post("/cart/submit");
  },
};
