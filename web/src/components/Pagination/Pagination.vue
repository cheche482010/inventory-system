<template>
    <nav v-if="totalPages > 1">
        <ul class="pagination justify-content-center flex-wrap">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(1)">&laquo;</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">&lt;</button>
            </li>

            <!-- Primera página -->
            <li class="page-item" :class="{ active: currentPage === 1 }" v-if="currentPage > 3">
                <button class="page-link" @click="changePage(1)">1</button>
            </li>
            <li class="page-item disabled" v-if="currentPage > 4">
                <button class="page-link">...</button>
            </li>

            <!-- Rango de páginas alrededor de la actual -->
            <li class="page-item" v-for="page in displayedPages" :key="page" :class="{ active: currentPage === page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>

            <!-- Última página -->
            <li class="page-item disabled" v-if="currentPage < totalPages - 3">
                <button class="page-link">...</button>
            </li>
            <li class="page-item" :class="{ active: currentPage === totalPages }" v-if="currentPage < totalPages - 2">
                <button class="page-link" @click="changePage(totalPages)">{{ totalPages }}</button>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)">&gt;</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(totalPages)">&raquo;</button>
            </li>

            <!-- Input para ir a página específica -->
            <li class="page-item ms-2">
                <div class="input-group" style="width: 120px;">
                    <input type="number" class="form-control" v-model.number="inputPage" min="1" :max="totalPages"
                        @keyup.enter="goToPage" placeholder="Página...">
                    <button class="btn btn-outline-secondary" @click="goToPage">Ir</button>
                </div>
            </li>
        </ul>
    </nav>
</template>

<script src="./Pagination.js"></script>
