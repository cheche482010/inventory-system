import api from "./api"

export const authService = {
  login(credentials) {
    return api.post("/auth/login", credentials)
  },

  me() {
    return api.get("/auth/me")
  },
}
