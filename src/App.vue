<script setup>
import { RouterView } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import NavBar from './components/NavBar.vue'
import SafetyBanner from './components/SafetyBanner.vue'

const userStore = useUserStore()

// Load user from storage on app load
onMounted(() => {
  userStore.loadFromStorage()
})

const isAuthenticated = computed(() => {
  const isSessionVerified = sessionStorage.getItem('bioenergetics_session_verified') === '1'
  return userStore.loggedIn && isSessionVerified
})
</script>

<template>
  <div class="app">
    <SafetyBanner />
    <NavBar v-if="isAuthenticated" />
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
