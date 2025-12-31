<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// TWO ENDPOINTS - as per Vegvisr pattern
const AUTH_API = 'https://bioenergetics-auth-worker.torarnehave.workers.dev'
const EMAIL_WORKER = 'https://email-worker.torarnehave.workers.dev'

const email = ref('')
const step = ref('email')
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  // Check for magic token in URL
  const magicToken = route.query.magic || route.query.token
  if (magicToken) {
    await verifyMagicToken(magicToken)
    return
  }

  // Check if already logged in
  userStore.loadFromStorage()
  if (userStore.loggedIn && sessionStorage.getItem('bioenergetics_session_verified') === '1') {
    router.push('/')
  }
})

// Check email via AUTH WORKER
async function checkEmail() {
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Please enter a valid email address'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${AUTH_API}/check-email?email=${encodeURIComponent(email.value)}`)
    const data = await response.json()

    if (data.exists) {
      await sendMagicLink()
    } else {
      error.value = 'Email not registered. Please contact an administrator.'
    }
  } catch (e) {
    error.value = 'Failed to check email. Please try again.'
  } finally {
    loading.value = false
  }
}

// Send magic link via EMAIL WORKER DIRECTLY
async function sendMagicLink() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${EMAIL_WORKER}/login/magic/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        redirectUrl: 'https://bioenergetics.vegvisr.org/login'
      })
    })

    if (response.ok) {
      step.value = 'magic'
      success.value = 'Magic link sent! Check your email.'
    } else {
      error.value = 'Failed to send magic link. Please try again.'
    }
  } catch (e) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}

// CRITICAL: After magic link verification, use userContext from fetchUserContext
// The emailVerificationToken comes from /userdata endpoint, NOT from magic link response
async function verifyMagicToken(token) {
  loading.value = true
  step.value = 'verifying'
  error.value = ''

  try {
    const response = await fetch(`${EMAIL_WORKER}/login/magic/verify?token=${encodeURIComponent(token)}`)
    const data = await response.json()

    if (data.success && data.email) {
      // fetchUserContext gets emailVerificationToken from /userdata endpoint
      const userContext = await userStore.fetchUserContext(data.email)

      // IMPORTANT: Use userContext directly - it contains the correct token
      userStore.setUser(userContext)
      sessionStorage.setItem('bioenergetics_session_verified', '1')
      router.push('/')
    } else {
      error.value = 'Invalid or expired magic link. Please request a new one.'
      step.value = 'email'
    }
  } catch (e) {
    error.value = 'Failed to verify magic link. Please try again.'
    step.value = 'email'
  } finally {
    loading.value = false
    // Clean up URL
    router.replace({ query: {} })
  }
}

function handleSubmit() {
  if (step.value === 'email') checkEmail()
}

function resetForm() {
  step.value = 'email'
  email.value = ''
  error.value = ''
  success.value = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome</h1>
        <p>Sign in to Body Experience App</p>
      </div>

      <!-- Verifying state -->
      <div v-if="step === 'verifying'" class="login-verifying">
        <div class="spinner"></div>
        <p>Verifying your login...</p>
      </div>

      <!-- Email input form -->
      <div v-else-if="step === 'email'" class="login-form">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="email">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              required
              autocomplete="email"
              :disabled="loading"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg"
            style="width: 100%"
            :disabled="loading"
          >
            {{ loading ? 'Checking...' : 'Continue with Magic Link' }}
          </button>
        </form>
      </div>

      <!-- Magic link sent -->
      <div v-else-if="step === 'magic'" class="login-success">
        <div class="success-icon">📬</div>
        <h2>Check your email!</h2>
        <p>
          We sent a magic link to <strong>{{ email }}</strong>.
          Click the link in the email to sign in.
        </p>

        <div class="button-group">
          <button class="btn btn-secondary" @click="sendMagicLink" :disabled="loading">
            {{ loading ? 'Sending...' : 'Resend Magic Link' }}
          </button>
          <button class="btn btn-outline" @click="resetForm">
            Use different email
          </button>
        </div>
      </div>

      <!-- Error message -->
      <p v-if="error" class="error-message">
        {{ error }}
      </p>

      <!-- Success message -->
      <p v-if="success && step !== 'magic'" class="success-message">
        {{ success }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.login-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2xl);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.login-header h1 {
  margin-bottom: var(--space-xs);
}

.login-header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.login-verifying {
  text-align: center;
  padding: var(--space-xl) 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: var(--color-danger);
  text-align: center;
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-md);
}

.success-message {
  color: var(--color-success);
  text-align: center;
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-md);
}

.login-success {
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.login-success h2 {
  margin-bottom: var(--space-md);
}

.login-success p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover {
  background: var(--color-bg-secondary);
}
</style>
