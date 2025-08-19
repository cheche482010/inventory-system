import axios from 'axios';

const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

export const dolarService = {
  async getDolarRate() {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching dolar rate:', error);
      throw error;
    }
  },
};
