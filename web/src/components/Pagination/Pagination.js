import { ref, computed, watch } from 'vue';

export default {
    name: 'Pagination',
    props: {
        currentPage: {
            type: Number,
            required: true,
        },
        totalPages: {
            type: Number,
            required: true,
        },
        maxVisibleButtons: {
            type: Number,
            default: 5,
        },
    },
    emits: ['page-changed'],
    setup(props, { emit }) {
        const inputPage = ref(props.currentPage);

        watch(() => props.currentPage, (newPage) => {
            inputPage.value = newPage;
        });

        const displayedPages = computed(() => {
            const { currentPage, totalPages, maxVisibleButtons } = props;
            if (totalPages <= 1) return [];

            if (totalPages <= maxVisibleButtons) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }

            const half = Math.floor(maxVisibleButtons / 2);
            let start = Math.max(1, currentPage - half);
            let end = Math.min(totalPages, currentPage + half);

            if (currentPage - half < 1) {
                end += 1 - (currentPage - half);
            }
            if (currentPage + half > totalPages) {
                start -= (currentPage + half) - totalPages;
            }

            start = Math.max(1, start);
            end = Math.min(totalPages, end);

            const pages = [];
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            return pages;
        });

        const changePage = (page) => {
            if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
                emit('page-changed', page);
            }
        };

        const goToPage = () => {
            const page = Number(inputPage.value);
            if (!isNaN(page) && page >= 1 && page <= props.totalPages) {
                changePage(page);
            } else {
                inputPage.value = props.currentPage;
            }
        };

        return {
            inputPage,
            displayedPages,
            changePage,
            goToPage,
        };
    },
};
