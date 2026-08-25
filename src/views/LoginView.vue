<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useApi } from '@/composables/useApi';
import { useNotify } from '@/composables/useNotify';
import { authApi, type LoginResponse } from '@/api/authApi';

import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseForm from '@/components/base/BaseForm.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const notify = useNotify();

const username = ref<string>('');
const password = ref<string>('');

const { loading: isLoading, error, execute, status_code } = useApi<LoginResponse>();

const isFormValid = computed<boolean>(() => {
  const isUsernameValid = username.value.trim().length >= 3;
  const isPasswordValid = password.value.length >= 6;
  return isUsernameValid && isPasswordValid;
});

const errorMsg = computed(() => {
  if (status_code.value === 429) {
    return 'Too many attempts. Please try again later.';
  }
  if (error.value) {
    return 'Wrong username or password. Try again.';
  }
  return null;
});

async function handleSubmit() {
  if (!isFormValid.value || isLoading.value) return;

  const result = await execute(async () => {
    const res = await authApi.login({
      username: username.value,
      password: password.value
    });
    return res.data;
  });

  if (result?.access && result?.refresh) {
    auth.login(username.value, result.access, result.refresh);
    notify.success('Welcome back!');
    const redirectPath = (route.query.redirect as string) || '/tasks';
    router.push(redirectPath);
  }
}

onMounted(() => {
  if (route.query.registered === '1') {
    notify.success('You have successfully registered! Please log in now.');
    router.replace({ query: {} });
  }
});
</script>

<template>
  <div class="login-container">
    <BaseCard class="login-card">
      <template #header>
        <h2>Sign in</h2>
      </template>

      <BaseForm :is-submitting="isLoading" @submit="handleSubmit">
        <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

        <BaseInput
          v-model="username"
          name="username"
          label="Username"
          placeholder="Enter your username"
          autocomplete="username"
          :error="error"
        />

        <BaseInput
          v-model="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autocomplete="current-password"
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="!isFormValid || isLoading"
          :loading="isLoading"
          style="width: 100%; margin-top: 12px"
        >
          Sign In
        </BaseButton>
      </BaseForm>
    </BaseCard>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 40px 20px;
  min-height: 70vh;
  width: 20vw;
}

h2 {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.success-banner {
  background-color: #1db954;
  color: #000000;
  padding: 12px;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-sizing: border-box;
}

.error-banner {
  background-color: rgba(233, 20, 41, 0.15);
  border: 1px solid rgba(233, 20, 41, 0.35);
  color: #ff4d5e;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
}
</style>
