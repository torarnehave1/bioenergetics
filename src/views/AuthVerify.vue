<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Redirect to login with token - Login.vue handles verification
onMounted(() => {
  const token = route.query.token || route.query.magic
  if (token) {
    router.replace({ path: '/login', query: { token } })
  } else {
    router.replace('/login')
  }
})
</script>

<template>
  <div class="verify-page">
    <div class="verify-card">
      <div class="verifying">
        <div class="spinner"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.verify-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2xl);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.verifying {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
