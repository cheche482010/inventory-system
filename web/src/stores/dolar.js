import { defineStore } from 'pinia';
import { dolarService } from '@/services/dolarService';

export const useDolarStore = defineStore('dolar', {
  state: () => ({
    rate: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchDolarRate() {
      this.loading = true;
      this.error = null;
      try {
        const data = await dolarService.getDolarRate();
        this.rate = data.promedio;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  },
});
