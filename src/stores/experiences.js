import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useExperiencesStore = defineStore('experiences', () => {
  const experiences = ref([])
  const currentSession = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchExperiences(options = {}) {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (options.limit) params.append('limit', options.limit)
      if (options.offset) params.append('offset', options.offset)
      if (options.sessionId) params.append('session_id', options.sessionId)

      const response = await api.get(`/api/experiences?${params}`)
      experiences.value = response.experiences
      return response.experiences
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSession(sessionId) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/experiences/session/${sessionId}`)
      currentSession.value = {
        id: sessionId,
        experiences: response.experiences,
      }
      return response.experiences
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createExperience(data) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/experiences', data)
      experiences.value.unshift(response.experience)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteExperience(id) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/api/experiences/${id}`)
      experiences.value = experiences.value.filter(e => e.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitSafetyCheckin(data) {
    try {
      await api.post('/api/experiences/safety-checkin', data)
    } catch (err) {
      console.error('Safety checkin error:', err)
    }
  }

  return {
    experiences,
    currentSession,
    loading,
    error,
    fetchExperiences,
    fetchSession,
    createExperience,
    deleteExperience,
    submitSafetyCheckin,
  }
})
