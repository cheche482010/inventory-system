import { ref, computed } from 'vue'
import { exportService } from '@/services/exportService'
import { useToast } from 'vue-toastification'

export default {
  name: 'ExportDropdown',
  props: {
    products: {
      type: Array,
      required: true
    },
    filters: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const toast = useToast()
    const loading = ref(false)

    const exportInfo = computed(() => {
      const hasFilters = Object.values(props.filters).some(filter =>
        filter && filter !== '' && filter !== 'all'
      )

      if (hasFilters) {
        return `Se exportarán ${props.products.length} productos filtrados`
      }
      return `Se exportarán ${props.products.length} productos`
    })

    const exportToPDF = async () => {
      if (props.products.length === 0) {
        toast.warning('No hay productos para exportar')
        return
      }

      loading.value = true
      try {
        await exportService.exportToPDF(props.products, 'productos')
        toast.success('Archivo PDF generado exitosamente')
      } catch (error) {
        toast.error('Error al generar el archivo PDF con tabla')
        console.error('Export PDF error:', error)
      } finally {
        loading.value = false
      }
    }

    const exportToExcel = async () => {
      if (props.products.length === 0) {
        toast.warning('No hay productos para exportar')
        return
      }

      loading.value = true
      try {
        await exportService.exportToExcel(props.products, 'productos')
        toast.success('Archivo Excel generado exitosamente')
      } catch (error) {
        toast.error('Error al generar el archivo Excel')
        console.error('Export Excel error:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      exportInfo,
      exportToPDF,
      exportToExcel
    }
  }
}