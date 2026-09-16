<script setup lang="ts"></script>

<template>
  <div class="async-loading">
    <div class="spinner"></div>
    <span>Module loading...</span>
  </div>
</template>

<style scoped>
.async-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #b3b3b3;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1ed760;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
