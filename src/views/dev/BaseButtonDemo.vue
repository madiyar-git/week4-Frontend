<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <div class="demo-page">
    <h1>BaseButton Component Showcase</h1>
    <hr />

    <section class="demo-section">
      <h2>1. Variants (Normal / Loading / Disabled)</h2>
      <div class="demo-grid">
        <BaseButton variant="primary">Primary</BaseButton>
        <BaseButton variant="primary" loading>Primary</BaseButton>
        <BaseButton variant="primary" disabled>Primary</BaseButton>

        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="secondary" loading>Secondary</BaseButton>
        <BaseButton variant="secondary" disabled>Secondary</BaseButton>

        <BaseButton variant="danger">Danger</BaseButton>
        <BaseButton variant="danger" loading>Danger</BaseButton>
        <BaseButton variant="danger" disabled>Danger</BaseButton>
      </div>
    </section>

    <section class="demo-section">
      <h2>2. Sizes × Variants</h2>
      <div class="demo-row">
        <BaseButton size="sm" variant="primary">Small Primary</BaseButton>
        <BaseButton size="md" variant="primary">Medium Primary</BaseButton>
        <BaseButton size="lg" variant="primary">Large Primary</BaseButton>
      </div>
      <div class="demo-row" style="margin-top: 10px;">
        <BaseButton size="sm" variant="secondary" loading>Small</BaseButton>
        <BaseButton size="md" variant="secondary" loading>Medium</BaseButton>
        <BaseButton size="lg" variant="secondary" loading>Large</BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}
.demo-section {
  margin: 30px 0;
}
.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  gap: 20px;
  align-items: center;
}
.demo-row {
  display: flex;
  gap: 15px;
  align-items: center;
}
h2 {
  font-size: 1.25rem;
  margin-bottom: 15px;
  color: #4b5563;
}
</style>