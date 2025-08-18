import api from "./api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const budgetService = {
  getAll() {
    return api.get("/budgets")
  },

  getMyBudgets() {
    return api.get("/budgets/my")
  },

  getBudget(id) {
    return api.get(`/budgets/${id}`)
  },

  generateBudgetPdf(budget) {
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

      // Table Data
      const tableData = budget.items.map((item) => [
        item.product.name,
        item.quantity,
        `$${item.price}`,
        `$${(item.quantity * item.price).toFixed(2)}`,
      ])

      // Table Footer
      const total = budget.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
      tableData.push([
        { content: "Total:", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
        { content: `$${total.toFixed(2)}`, styles: { fontStyle: "bold" } },
      ])

      // Generate Table
      autoTable(doc, {
        head: [["Producto", "Cantidad", "Precio Unit.", "Subtotal"]],
        body: tableData,
        startY: 60,
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

  async downloadPdf(id) {
    const response = await this.getBudget(id)
    this.generateBudgetPdf(response.data)
    return response
  },
}
