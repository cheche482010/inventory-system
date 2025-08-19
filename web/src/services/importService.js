import api from "./api"

export const importService = {
  importData(dataToImport) {
    const formData = new FormData()

    dataToImport.forEach((item, index) => {
      if (item.img && item.img instanceof File) {
        formData.append(`images`, item.img)
        formData.append(`imageIndexes`, index)
      }
    })

    formData.append('dataToImport', JSON.stringify(dataToImport))

    return api.post("/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
}
