import api from "./api"

export const importService = {
  importData(dataToImport) {
    return api.post("/import", { dataToImport })
  },
}
