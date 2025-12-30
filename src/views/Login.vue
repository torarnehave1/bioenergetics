<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const name = ref('')
const showNameField = ref(false)
const sent = ref(false)
const devLink = ref('')

async function handleSubmit() {
  try {
    const response = await authStore.requestMagicLink(email.value, name.value || null)

    sent.value = true

    // In development, show the magic link
    if (response.devLink) {
      devLink.value = response.devLink
    }
  } catch (err) {
    console.error('Login error:', err)
  }
}

function resetForm() {
  sent.value = false
  email.value = ''
  name.value = ''
  devLink.value = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome</h1>
        <p>Sign in to Body Experience App</p>
      </div>

      <div v-if="!sent" class="login-form">
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
            />
          </div>

          <div v-if="showNameField" class="form-group">
            <label class="form-label" for="name">Your name (optional)</label>
            <input
              id="name"
              v-model="name"
              type="text"
              class="form-input"
              placeholder="Your name"
              autocomplete="name"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg"
            style="width: 100%"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Sending...' : 'Send Magic Link' }}
          </button>

          <p v-if="!showNameField" class="new-user-link">
            New here?
            <button type="button" class="link-btn" @click="showNameField = true">
              Add your name
            </button>
          </p>
        </form>

        <p v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </p>
      </div>

      <div v-else class="login-success">
        <div class="success-icon">📬</div>
        <h2>Check your email!</h2>
        <p>
          We sent a magic link to <strong>{{ email }}</strong>.
          Click the link in the email to sign in.
        </p>

        <!-- Development mode: show magic link -->
        <div v-if="devLink" class="dev-link-box">
          <p class="dev-notice">Development mode - Magic link:</p>
          <a :href="devLink" class="dev-link">{{ devLink }}</a>
        </div>

        <button class="btn btn-secondary" @click="resetForm">
          Try a different email
        </button>
      </div>
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

.new-user-link {
  text-align: center;
  margin-top: var(--space-md);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.error-message {
  color: var(--color-danger);
  text-align: center;
  margin-top: var(--space-md);
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

.dev-link-box {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  word-break: break-all;
}

.dev-notice {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.dev-link {
  font-size: 0.875rem;
  color: var(--color-primary);
}
</style>
