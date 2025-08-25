<template>
    <div v-if="visible" class="image-modal-overlay" @click="close">
        <div class="image-modal-content">
            <span class="close-button" @click.stop="close">&times;</span>
            <img :src="imageUrl" alt="Imagen ampliada" class="enlarged-image" />
        </div>
    </div>
</template>

<script src="./ImageModal.js"></script>
<style scoped src="./ImageModal.scss"></style>
