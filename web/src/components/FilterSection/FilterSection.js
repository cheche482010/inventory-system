import { computed } from 'vue';

let searchTimeout;

export default {
    name: 'FilterSection',
    props: {
        modelValue: {
            type: Object,
            required: true,
        },
        config: {
            type: Array,
            required: true,
        },
        searchPlaceholder: {
            type: String,
            default: 'Buscar...',
        },
    },
    emits: ['update:modelValue', 'filter', 'clear'],
    setup(props, { emit }) {
        const hasSearch = computed(() => props.config.some(f => f.type === 'search'));
        const hasPerPage = computed(() => props.config.some(f => f.type === 'perPage'));
        const hasDateFilter = computed(() => props.config.some(f => f.type === 'date'));
        const dynamicFilters = computed(() => props.config.filter(f => f.type === 'select'));

        const updateValue = (key, value) => {
            emit('update:modelValue', { ...props.modelValue, [key]: value });
        };

        const updateAndFilter = (key, value) => {
            updateValue(key, value);
            emit('filter');
        };

        const updateDebounced = (key, value) => {
            updateValue(key, value);
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                emit('filter');
            }, 500);
        };

        const clear = () => {
            emit('clear');
        };

        return {
            hasSearch,
            hasPerPage,
            hasDateFilter,
            dynamicFilters,
            updateDebounced,
            updateAndFilter,
            clear,
        };
    },
};