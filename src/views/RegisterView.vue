<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseCard from '@/components/base/BaseCard.vue';

interface RegisterResponse {
  id: number;
  username: string;
}

const router = useRouter();

const username = ref<string>('');
const password = ref<string>('');
const password_confirm = ref<string>('');

const { loading: isLoading, error: backendError, execute } = useApi<RegisterResponse>();

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const doPasswordsMatch = computed<boolean>(() => {
  return password.value === password_confirm.value;
});

function validateForm(): string[] {
  const errorList: string[] = [];
  const trimmedUsername = username.value.trim();

  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    errorList.push('Username must have more than 3 and less than 30');
  }
  if (!USERNAME_REGEX.test(trimmedUsername) && trimmedUsername.length > 3) {
    errorList.push("Username must have latin letters, digits and '_' symbol");
  }

  if (password.value.length < 6) {
    errorList.push('Password must have at least 6 symbols');
  }

  if (!doPasswordsMatch.value && password_confirm.value.length > 0) {
    errorList.push('Passwords not matching');
  }

  return errorList;
}

const formErrors = computed<string[]>(() => {
  if (!username.value && !password.value && !password_confirm.value) return [];
  return validateForm();
});

const isFormValid = computed<boolean>(() => {
  const isFilled = !!username.value && !!password.value && !!password_confirm.value;
  return isFilled && validateForm().length === 0;
});

async function handleSubmit() {
  if (!isFormValid.value || isLoading.value) return;

  const result = await execute({
    method: 'POST',
    url: 'register/',
    data: {
      username: username.value,
      password: password.value,
      confirm_password: password_confirm.value
    }
  });

  if (result) {
    router.push({
      name: 'login',
      query: { registered: '1' }
    });
  }
}
</script>

<template>
  <div class="register-container">
    <BaseCard class="register-card">
      <template #header>
        <h2>Create account</h2>
      </template>

      <form @submit.prevent="handleSubmit" class="register-form">
        <BaseInput
          v-model="username"
          label="Username"
          type="text"
          placeholder="Latin letters, digits and '_'"
          :disabled="isLoading"
          autocomplete="username"
        />

        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          :disabled="isLoading"
          autocomplete="new-password"
        />

        <BaseInput
          v-model="password_confirm"
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          :disabled="isLoading"
          autocomplete="new-password"
        />

        <div v-if="backendError" class="error-box validation-error">
          {{ backendError }}
        </div>

        <div v-if="formErrors.length > 0" class="error-box validation-box">
          <ul class="errors-list">
            <li v-for="(error, index) in formErrors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="!isFormValid || isLoading"
          :loading="isLoading"
          style="width: 100%; margin-top: 12px"
        >
          Sign Up
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 40px 20px;
  min-height: 80vh;
}

.register-card {
  max-width: 450px;
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

.register-form {
  display: flex;
  flex-direction: column;
}

.error-box {
  background-color: #3d1d24;
  border: 1px solid #e53e3e;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  color: #feb2b2;
  font-size: 0.85rem;
}

.errors-list {
  margin: 0;
  padding-left: 20px;
  text-align: left;
}

.errors-list li {
  margin-bottom: 4px;
}
.errors-list li:last-child {
  margin-bottom: 0;
}
</style>
