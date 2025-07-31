import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/products';
import { brandService } from '@/services/brandService';
import { categoryService } from '@/services/categoryService';
import ProductModal from '@/components/Products/ProductModal/ProductModal.vue';
import ProductForm from '@/components/Products/ProductForm/ProductForm.vue';
import ExportDropdown from '@/components/Products/ExportDropdown/ExportDropdown.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import { storeToRefs } from 'pinia';

let searchTimeout;

export default {
  name: 'Products',
  components: {
    ProductModal,
    ProductForm,
    ExportDropdown,
    Pagination,
  },
  setup() {
    const authStore = useAuthStore();
    const productStore = useProductStore();

    const { products, loading, pagination, filters, hasNoResults, showPagination } = storeToRefs(productStore);

    const brands = ref([]);
    const categories = ref([]);
    const selectedProduct = ref(null);
    const showProductForm = ref(false);
    const editingProduct = ref(null);

    const canCreate = computed(() => authStore.hasPermission('products:create'));
    const canDelete = computed(() => authStore.hasPermission('products:delete'));
    const canExport = computed(() => authStore.hasPermission('products:export'));

    const loadBrands = async () => {
      try {
        const response = await brandService.getAllBrands();
        brands.value = response.data;
      } catch (error) {
        console.error('Error loading brands:', error);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        categories.value = response.data;
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    const applyFilters = () => {
      productStore.fetchProducts();
    };

    const debouncedSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(applyFilters, 500);
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        productStore.setPage(page);
        productStore.fetchProducts();
      }
    };

    const viewProduct = (product) => {
      selectedProduct.value = product;
    };

    const confirmDelete = (product) => {
      Swal.fire({
        title: `¿Estás seguro de eliminar el producto ${product.code}?`,
        text: "No podrás revertir esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          productStore.deleteProduct(product.id);
        }
      });
    };

    const createProduct = () => {
      editingProduct.value = null;
      showProductForm.value = true;
    };

    const editProduct = (product) => {
      editingProduct.value = product;
      showProductForm.value = true;
    };

    const closeProductForm = () => {
      showProductForm.value = false;
      editingProduct.value = null;
    };

    const clearFilters = () => {
      productStore.setFilters({
        search: '',
        status: '',
        brandId: '',
        categoryId: '',
        perPage: '10',
      });
      productStore.fetchProducts();
    };

    const handleFormSuccess = () => {
      closeProductForm();
      productStore.fetchProducts();
    };

    onMounted(() => {
      productStore.fetchProducts();
      loadBrands();
      loadCategories();
    });

    return {
      products,
      loading,
      pagination,
      filters,
      brands,
      categories,
      selectedProduct,
      showProductForm,
      editingProduct,
      canCreate,
      canDelete,
      canExport,
      showPagination,
      applyFilters,
      debouncedSearch,
      changePage,
      viewProduct,
      confirmDelete,
      createProduct,
      editProduct,
      closeProductForm,
      clearFilters,
      hasNoResults,
      handleFormSuccess,
    };
  },
};