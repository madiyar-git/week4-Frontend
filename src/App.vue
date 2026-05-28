<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()

const { isAuthenticated, username } = storeToRefs(authStore)
const { logout } = authStore

function handleLogout(): void {
  logout()         
  router.push('/login') 
}
</script>

<template>
  <main class="app-main">
    <header class="app-header">
      <h1>Task Manager</h1>
      
      <nav class="nav-bar">
        <RouterLink v-if="isAuthenticated" to="/tasks" class="nav-link">Tasks</RouterLink>
        
        <RouterLink v-if="!isAuthenticated" to="/login" class="nav-link">Login</RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/register" class="nav-link">Registration</RouterLink>
        
        <div v-if="isAuthenticated" class="user-menu">
          <span class="username-display">Привет, {{ username }}</span>
          <button @click="handleLogout" class="logout-btn">
            Log out
          </button>
        </div>
      </nav>
    </header>

    <RouterView />
  </main> 
</template>

<style>
body {
  margin: 0;
  background-color: #121212;
  color: #ffffff;
  font-family: sans-serif;
}

.app-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.app-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 50px;
  width: 220px;
  border-radius: 25px;
  color: #000000;
  background-color: #1db954;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: -0.5px;
  margin-bottom: 20px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username-display {
  font-size: 0.9rem;
  font-weight: 600;
  color: #b3b3b3;
  padding-left: 8px;
}

.logout-btn {
  background: none;
  border: none;
  color: #ff4d4f; 
  font-size: 0.9rem;
  font-weight: 600;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 14px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.logout-btn:hover {
  background-color: #4a1d24;
  color: #feb2b2;
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #181818;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #282828;
}

.nav-link {
  color: #b3b3b3; 
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 14px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.nav-link:hover {
  color: #ffffff; 
}

.nav-link.router-link-active {
  color: #1db954;
  background-color: #282828; 
  font-weight: 700;
}
</style>