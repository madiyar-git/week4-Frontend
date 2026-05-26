<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute() 

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
  isLoading.value = true
  error.value = null
  try {
    await new Promise(r => setTimeout(r, 500))
    router.push({ name: 'tasks' })
  } catch (e: unknown) {
    if (e instanceof Error){
        error.value = e.message
    }else{
        error.value = 'Login error'
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

    <form @submit.prevent="handleSubmit" class="login-form">
      <h2>Sign in</h2>

      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="ex: Madiyar"
          :disabled="isLoading"
          autocomplete="username"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="your password here..."
          :disabled="isLoading"
          autocomplete="current-password"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button 
        type="submit" 
        class="submit-btn" 
        :disabled="!isFormValid || isLoading"
        >
        <span v-if="isLoading" class="btn-spinner"></span>
        <span v-else>Войти</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  width: 100%;
}
.success-banner {
  background-color: #14321a;
  border: 1px solid #1db954;
  color: #1db954;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 20px;
  max-width: 400px;
  text-align: center;
}

.login-form {
  background-color: #181818;
  border: 1px solid #282828;
  padding: 40px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

h2 {
  margin: 0 0 24px 0;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: #ffffff;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}

input {
  background-color: #3e3e3e;
  border: 1px solid #535353;
  color: #ffffff;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #1db954; 
  background-color: #4a4a4a;
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background-color: #4a1d24;
  color: #feb2b2;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ff4d4f;
}

.submit-btn {
  width: 100%;
  background-color: #1db954;
  color: #000000;
  border: none;
  padding: 14px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  transition: transform 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1ed760;
  transform: scale(1.02);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  background-color: #535353;
  color: #b3b3b3;
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #000000;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>