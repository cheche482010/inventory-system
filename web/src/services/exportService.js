import * as XLSX from "xlsx"
import jsPDF from "jspdf"

// Importar jspdf-autotable de manera correcta para Vite
import autoTable from "jspdf-autotable"

export const exportService = {
  // Exportar a Excel
  exportToExcel(data, filename = "productos") {
    try {
      // Preparar los datos para Excel
      const excelData = data.map((product) => ({
        Código: product.code,
        Nombre: product.name,
        Marca: product.brand?.name || "N/A",
        Categoría: product.category?.name || "N/A",
        Estado: product.status,
        Precio: `$${product.price}`,
        "Fecha Creación": new Date(product.createdAt).toLocaleDateString("es-ES"),
        Descripción: product.description || "Sin descripción",
      }))

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()

      // Configurar ancho de columnas
      const colWidths = [
        { wch: 15 }, // Código
        { wch: 40 }, // Nombre
        { wch: 20 }, // Marca
        { wch: 20 }, // Categoría
        { wch: 15 }, // Estado
        { wch: 12 }, // Precio
        { wch: 15 }, // Fecha
        { wch: 50 }, // Descripción
      ]
      ws["!cols"] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, "Productos")

      // Descargar archivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`)

      return true
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      throw new Error("Error al generar archivo Excel")
    }
  },

  // Exportar a PDF con autoTable
  exportToPDF(data, filename = "productos") {
    try {
      const doc = new jsPDF()

      // Configuración del documento
      doc.setFontSize(18)
      doc.text("Reporte de Productos", 14, 22)

      // Información adicional
      doc.setFontSize(11)
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, 14, 32)
      doc.text(`Total de productos: ${data.length}`, 14, 38)

      // Preparar datos para la tabla
      const tableData = data.map((product) => [
        product.code,
        product.name.length > 30 ? product.name.substring(0, 30) + "..." : product.name,
        product.brand?.name || "N/A",
        product.category?.name || "N/A",
        product.status,
        `$${product.price}`,
      ])

      // Usar autoTable importado
      autoTable(doc, {
        head: [["Código", "Nombre", "Marca", "Categoría", "Estado", "Precio"]],
        body: tableData,
        startY: 45,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Código
          1: { cellWidth: 60 }, // Nombre
          2: { cellWidth: 30 }, // Marca
          3: { cellWidth: 30 }, // Categoría
          4: { cellWidth: 25 }, // Estado
          5: { cellWidth: 20 }, // Precio
        },
      })

      // Agregar pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
      }

      // Descargar archivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      doc.save(`${filename}_${timestamp}.pdf`)

      return true
    } catch (error) {
      console.error("Error al exportar a PDF:", error)
      throw new Error("Error al generar archivo PDF")
    }
  },

  // Exportar a PDF sin autoTable (alternativa)
  exportToPDFSimple(data, filename = "productos") {
    try {
      const doc = new jsPDF()
      let yPosition = 20

      // Configuración del documento
      doc.setFontSize(18)
      doc.text("Reporte de Productos", 14, yPosition)
      yPosition += 15

      // Información adicional
      doc.setFontSize(11)
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, 14, yPosition)
      yPosition += 8
      doc.text(`Total de productos: ${data.length}`, 14, yPosition)
      yPosition += 15

      // Estadísticas
      const stats = this.getExportStats(data)
      doc.text("Estadísticas por estado:", 14, yPosition)
      yPosition += 8

      Object.entries(stats.porEstado).forEach(([status, count]) => {
        doc.text(`  • ${status}: ${count} productos`, 14, yPosition)
        yPosition += 6
      })
      yPosition += 10

      // Lista de productos
      doc.setFontSize(12)
      doc.text("Lista de Productos:", 14, yPosition)
      yPosition += 10

      doc.setFontSize(9)
      data.forEach((product, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        // Información del producto
        const productInfo = `${index + 1}. ${product.code} - ${product.name}`
        doc.text(productInfo.substring(0, 80), 14, yPosition)
        yPosition += 6

        const details = `   Marca: ${product.brand?.name || "N/A"} | Categoría: ${product.category?.name || "N/A"} | Estado: ${product.status} | Precio: $${product.price}`
        doc.text(details, 14, yPosition)
        yPosition += 8
      })

      // Agregar pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
      }

      // Descargar archivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      doc.save(`${filename}_${timestamp}.pdf`)

      return true
    } catch (error) {
      console.error("Error al exportar a PDF simple:", error)
      throw new Error("Error al generar archivo PDF")
    }
  },

  // Obtener estadísticas para el reporte
  getExportStats(data) {
    const stats = {
      total: data.length,
      porEstado: {},
      porMarca: {},
      porCategoria: {},
    }

    data.forEach((product) => {
      // Estadísticas por estado
      stats.porEstado[product.status] = (stats.porEstado[product.status] || 0) + 1

      // Estadísticas por marca
      const marca = product.brand?.name || "Sin marca"
      stats.porMarca[marca] = (stats.porMarca[marca] || 0) + 1

      // Estadísticas por categoría
      const categoria = product.category?.name || "Sin categoría"
      stats.porCategoria[categoria] = (stats.porCategoria[categoria] || 0) + 1
    })

    return stats
  },
}
