<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { AxiosError } from 'axios'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseCard from '@/components/base/BaseCard.vue'

interface DjangoErrorData {
  detail?: string
}

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref<string>('')
const password = ref<string>('')

const isLoading = ref<boolean>(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const isFormValid = computed<boolean>(() => {
  const isUsernameValid = username.value.trim().length >= 3
  const isPasswordValid = password.value.length >= 6
  return isUsernameValid && isPasswordValid
})

async function handleSubmit() {
  if (!isFormValid.value || isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    await auth.login(username.value, password.value)
    const redirectPath = (route.query.redirect as string) || '/tasks'

    router.push(redirectPath)
  } catch (err: unknown) {
    const axiosError = err as AxiosError<DjangoErrorData>
    if (axiosError.response?.data?.detail) {
      error.value = 'Wrong username or password. Try Again.'
    } else {
      error.value = 'Something wrong...'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (route.query.registered === '1') {
    successMessage.value = 'You have successfully registered! Please log in now.'
    setTimeout(() => {
      router.replace({ query: {} })
    }, 3000)
  }
})
</script>

<template>
  <div class="login-container">
    <div v-if="successMessage" class="success-banner">
      {{ successMessage }}
    </div>

    <BaseCard class="login-card">
      <template #header>
        <h2>Sign in</h2>
      </template>

      <form @submit.prevent="handleSubmit" class="login-form">
        <BaseInput
          v-model="username"
          label="Username"
          placeholder="Enter your username"
          :disabled="isLoading"
          autocomplete="username"
          :error="error"
        />

        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          :disabled="isLoading"
          :error="error"
          autocomplete="current-password"
        />

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="!isFormValid || isLoading"
          :loading="isLoading"
          style="width: 100%; margin-top: 12px;"
        >
          Sign In
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 70vh;
}

.login-card {
  max-width: 400px;
}

h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.error-message {
  color: #e91429;
  font-size: 0.85rem;
  margin-bottom: 16px;
  text-align: left;
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
</style>