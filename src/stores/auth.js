import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isInstructor = computed(() => user.value?.role === 'instructor' || user.value?.role === 'admin')
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function checkAuth() {
    if (!token.value) {
      initialized.value = true
      return
    }

    try {
      loading.value = true
      const response = await api.get('/api/auth/me')
      user.value = response.user
    } catch (err) {
      // Token invalid, clear it
      logout()
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function requestMagicLink(email, name = null) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/auth/magic-link', { email, name })
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyToken(magicToken) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/auth/verify', { token: magicToken })

      if (response.success) {
        token.value = response.token
        user.value = response.user
        localStorage.setItem('auth_token', response.token)
        return true
      }
      return false
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/api/auth/logout')
      }
    } catch (err) {
      // Ignore logout errors
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
    }
  }

  async function updateProfile(data) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put('/api/users/me', data)
      user.value = response.user
      return response.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    initialized,
    loading,
    error,
    isAuthenticated,
    isInstructor,
    isAdmin,
    checkAuth,
    requestMagicLink,
    verifyToken,
    logout,
    updateProfile,
  }
})
