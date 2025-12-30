<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import SafetyBanner from './components/SafetyBanner.vue'

const authStore = useAuthStore()

// Check auth on app load
authStore.checkAuth()
</script>

<template>
  <div class="app">
    <SafetyBanner />
    <NavBar v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 768px) {
  .main-content {
    padding: 2rem;
  }
}
</style>
