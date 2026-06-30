<script setup lang="ts">
import { ref } from 'vue';
import BaseInput from '@/components/base/BaseInput.vue';

const textValue = ref('');
const passwordValue = ref('');
const emailValue = ref('');
const errorValue = ref('Invalid email format');
const helperValue = ref('Password must contain at least 8 characters');
</script>

<template>
  <div class="demo-page">
    <h1>UI Kit Showcase</h1>
    <hr />

    <section class="demo-section">
      <h2>BaseInput States</h2>
      <div class="demo-input-container">
        <BaseInput v-model="textValue" label="Username" placeholder="Enter username..." required />

        <BaseInput v-model="emailValue" type="email" label="Email Address" :error="errorValue" />

        <BaseInput v-model="passwordValue" type="password" label="Password" :helper="helperValue" />

        <BaseInput
          v-model="textValue"
          label="Disabled Field"
          placeholder="You cannot type here"
          disabled
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
}
.demo-section {
  margin: 40px 0;
  text-align: left;
}
.demo-input-container {
  display: flex;
  flex-direction: column;
  max-width: 400px;
}
.demo-grid {
  display: flex;
  gap: 15px;
}
h1 {
  color: #121212;
}
h2 {
  color: #ffffff;
  margin-bottom: 20px;
  border-bottom: 1px solid #282828;
  padding-bottom: 5px;
}
</style>
