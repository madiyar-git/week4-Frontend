<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router';
import type { AxiosError } from 'axios'

interface DjangoRegisterErrorData {
  username?: string[]
  detail?: string
}

const router = useRouter()
const auth = useAuthStore()

const username = ref<string>('')
const password = ref<string>('')
const password_confirm = ref<string>('')

const isLoading = ref<boolean>(false)
const localError = ref<string | null>(null)

// Разрешены только латинские буквы, цифры и нижнее подчеркивание
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

const doPasswordsMatch = computed<boolean>(() =>{
    return password.value === password_confirm.value
})

function validateForm(): string[]{
    const errorList: string[] = []
    const trimmedUsername = username.value.trim()

    if ( trimmedUsername.length < 3 || trimmedUsername.length > 30){
        errorList.push("Username must have more than 3 and less than 30 ")
    }
    if (!USERNAME_REGEX.test(trimmedUsername) && trimmedUsername.length > 3){
        errorList.push("Username must have latin letters, digits and '_' symbol ")
    }

    if (password.value.length < 6){
        errorList.push("Password must have at least 6 symbols")
    }

    if (!doPasswordsMatch.value && password_confirm.value.length > 0){
        errorList.push("Passwords not matching")
    }

    return errorList
} 

const formErrors = computed<string[]>(() =>{
    if (!username.value && !password.value && !password_confirm.value) return []
    return validateForm()
})

const isFormValid = computed<boolean>(() => {
    const isFilled = !!username.value && !!password.value && !!password_confirm.value
    return isFilled && validateForm().length === 0
})

async function handleSubmit() {
    if(!isFormValid.value || isLoading.value) return
        
    isLoading.value = true
    localError.value = null
    try {
        await auth.register(username.value, password.value)
        router.push(
            { 
                name: 'login',
                query: { registered: '1' }
            })
    } catch (err) {
        const axiosError = err as AxiosError<DjangoRegisterErrorData>
        const backendUsernameError = axiosError.response?.data?.username?.[0]
        if (backendUsernameError) {
            localError.value = backendUsernameError
        } else {
            localError.value = axiosError.response?.data?.detail || 'Registration error'
        }

        } finally {
        isLoading.value = false
    }
}

</script>

<template>
    <div class="register-container">
        <form @submit.prevent="handleSubmit" class="register-form">
            <h2>Create account</h2>
            <div class="form-group">
                <label for="username">Username</label>
                <input id="username" v-model="username" type="text" 
                placeholder="Latin letter, digits and '_' symbol" 
                :disabled="isLoading" autocomplete="username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input id="password" v-model="password" type="password" 
                placeholder="Enter password" 
                :disabled="isLoading" autocomplete="password">
            </div>
            <div class="form-group">
                <label for="password_confirm">Confirm password </label>
                <input id="password_confirm" v-model="password_confirm" type="password" 
                placeholder="Confirm password" 
                :disabled="isLoading" autocomplete="new-password">
            </div>
            <div v-if="localError" class="error-box validation-error">
                {{ localError }}
            </div>
                <div v-if="formErrors.length > 0" class="error-box validation-box">
                    <ul class="errors-list">
                    <li v-for="(error, index) in formErrors" :key="index">
                        {{ error }}
                    </li>
                    </ul>
                </div>            

                <button type="submit" class="submit-btn" :disabled="!isFormValid || isLoading">
                    <span v-if="isLoading" class="btn-spinner"></span>
                    <span v-else>Sign up</span>
                </button>
        </form>
    </div>
</template>
<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  width: 100%;
}
.register-form {
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

.error-box {
  background-color: #4a1d24;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.server-error {
  color: #feb2b2;
  text-align: center;
  font-size: 0.9rem;
}

.validation-box {
  background-color: #1c1c1c;
  border: 1px solid #3e3e3e;
}

.errors-list {
  margin: 0;
  padding-left: 18px;
  color: #ff7875;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
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