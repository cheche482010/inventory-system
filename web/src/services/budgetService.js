import api from "./api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency } from "@/helpers/formatHelper"
import axios from "axios"
import { useAuthStore } from "@/stores/auth"

export const budgetService = {
  getAll(params = {}) {
    return api.get("/budgets", { params })
  },

  getMyBudgets(params = {}) {
    return api.get("/budgets/my", { params })
  },

  getBudget(id) {
    return api.get(`/budgets/${id}`)
  },

  generateBudgetPdf(budget, rate) {
    try {
      const doc = new jsPDF()
      const user = budget.user

      // Header
      doc.setFontSize(20)
      doc.text(`Presupuesto #${budget.id}`, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" })

      // User Info
      doc.setFontSize(12)
      doc.text(`Cliente: ${user.firstName} ${user.lastName}`, 14, 40)
      doc.text(`Email: ${user.email}`, 14, 46)
      doc.text(`Fecha: ${new Date(budget.updatedAt).toLocaleDateString()}`, 14, 52)
      if (rate) {
        doc.text(`Tasa BCV: ${rate} Bs.`, 14, 58)
      }

      // Table Data
      const tableData = budget.items.map((item) => {
        const subtotal = item.quantity * item.price;
        const row = [
          item.product.name,
          item.quantity,
          formatCurrency(item.price),
          formatCurrency(subtotal),
        ];
        if (rate) {
          row.splice(3, 0, formatCurrency(item.price * rate, 'Bs.', 'after'));
          row.push(formatCurrency(subtotal * rate, 'Bs.', 'after'));
        }
        return row;
      });

      // Table Footer
      const total = budget.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
      const footer = [
        { content: "Total:", colSpan: rate ? 4: 3, styles: { halign: "right", fontStyle: "bold" } },
        { content: formatCurrency(total), styles: { fontStyle: "bold" } },
      ];

      if (rate) {
        footer.push({ content: formatCurrency(total * rate, 'Bs.', 'after'), styles: { fontStyle: "bold" } });
      }
      tableData.push(footer)

      // Generate Table
      const head = [["Producto", "Cantidad", "Precio Unit.", "Subtotal"]];
      if (rate) {
        head[0].splice(3, 0, "Precio Unit. (Bs.)");
        head[0].push("Subtotal (Bs.)");
      }
      autoTable(doc, {
        head: head,
        body: tableData,
        startY: 65,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        theme: "striped",
      })

      // Download
      doc.save(`presupuesto-${budget.id}.pdf`)
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      throw new Error("Error al generar el PDF")
    }
  },

  async downloadPdf(id, rate) {
    const response = await this.getBudget(id)
    this.generateBudgetPdf(response.data, rate)
    return response
  },

  async downloadBudgetExcel(budgetId) {
    const authStore = useAuthStore();
    const token = authStore.token;

    const fileApi = axios.create({
      baseURL: api.defaults.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    try {
      const response = await fileApi.get(`/budgets/${budgetId}/download-excel`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `presupuesto-${budgetId}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al descargar el Excel:', error);
      throw new Error('Error al descargar el Excel');
    }
  },
}
