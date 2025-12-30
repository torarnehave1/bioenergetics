<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const verifying = ref(true)
const error = ref(null)

onMounted(async () => {
  const token = route.query.token

  if (!token) {
    error.value = 'No verification token provided'
    verifying.value = false
    return
  }

  try {
    const success = await authStore.verifyToken(token)

    if (success) {
      // Redirect to dashboard or original destination
      const redirect = route.query.redirect || '/dashboard'
      router.replace(redirect)
    } else {
      error.value = 'Invalid or expired token'
    }
  } catch (err) {
    error.value = err.message || 'Verification failed'
  } finally {
    verifying.value = false
  }
})
</script>

<template>
  <div class="verify-page">
    <div class="verify-card">
      <div v-if="verifying" class="verifying">
        <div class="spinner"></div>
        <p>Verifying your login...</p>
      </div>

      <div v-else-if="error" class="error">
        <div class="error-icon">⚠️</div>
        <h2>Verification Failed</h2>
        <p>{{ error }}</p>
        <RouterLink to="/login" class="btn btn-primary">
          Try Again
        </RouterLink>
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

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.error h2 {
  margin-bottom: var(--space-md);
}

.error p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}
</style>
