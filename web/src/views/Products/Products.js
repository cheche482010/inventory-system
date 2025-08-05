import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';
import { brandService } from '@/services/brandService';
import { categoryService } from '@/services/categoryService';
import ProductModal from '@/components/Products/ProductModal/ProductModal.vue';
import ProductForm from '@/components/Products/ProductForm/ProductForm.vue';
import ExportDropdown from '@/components/Products/ExportDropdown/ExportDropdown.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import FilterSection from '@/components/FilterSection/FilterSection.vue';
import { storeToRefs } from 'pinia';

export default {
  name: 'Products',
  components: {
    ProductModal,
    ProductForm,
    ExportDropdown,
    Pagination,
    FilterSection,
  },
  setup() {
    const authStore = useAuthStore();
    const productStore = useProductStore();
    const cartStore = useCartStore();

    const { products, loading, pagination, filters, hasNoResults, showPagination } = storeToRefs(productStore);
    const { userRole } = storeToRefs(authStore);

    const quantities = ref({});

    // Watch for products changes to initialize quantities
    watch(products, (newProducts) => {
      newProducts.forEach(p => {
        if (quantities.value[p.id] === undefined) {
          quantities.value[p.id] = 1;
        }
      });
    }, { deep: true });

    const addToCart = (product) => {
      const quantity = quantities.value[product.id];
      if (quantity > 0) {
        cartStore.addItem({
          productId: product.id,
          quantity: quantity,
        });
      }
    };

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

    const filterConfig = computed(() => [
      { type: 'search', key: 'search', col: 'col-md-3' },
      { type: 'perPage', key: 'perPage', col: 'col-md-2' },
      {
        type: 'select',
        key: 'status',
        label: 'Estado',
        options: [
          { value: 'disponible', text: 'Disponible' },
          { value: 'nuevo', text: 'Nuevo' },
          { value: 'oferta', text: 'Oferta' },
          { value: 'agotado', text: 'Agotado' },
        ],
        col: 'col-md-2',
      },
      {
        type: 'select',
        key: 'brandId',
        label: 'Marca',
        options: brands.value.map(b => ({ value: b.id, text: b.name })),
        col: 'col-md-2',
      },
      {
        type: 'select',
        key: 'categoryId',
        label: 'Categoría',
        options: categories.value.map(c => ({ value: c.id, text: c.name })),
        col: 'col-md-3',
      },
    ]);

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
        sortBy: 'name',
        sortOrder: 'asc',
      });
      productStore.fetchProducts();
    };

    const sort = (field) => {
      const { sortBy, sortOrder } = productStore.filters;
      let newSortOrder = 'asc';
      if (sortBy === field && sortOrder === 'asc') {
        newSortOrder = 'desc';
      }
      productStore.setFilters({ ...productStore.filters, sortBy: field, sortOrder: newSortOrder });
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

    const baseUrl = import.meta.env.NODE_ENV === "production"
      ? `${import.meta.env.PROD_BACKEND_URL}`
      : `${import.meta.env.LOCAL_BACKEND_URL}`;

    return {
      products,
      loading,
      baseUrl,
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
      changePage,
      viewProduct,
      confirmDelete,
      createProduct,
      editProduct,
      closeProductForm,
      clearFilters,
      hasNoResults,
      handleFormSuccess,
      sort,
      filterConfig,
      // For cart
      userRole,
      quantities,
      addToCart,
    };
  },
};