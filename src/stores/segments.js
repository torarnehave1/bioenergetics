import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export const useSegmentsStore = defineStore('segments', () => {
  const segments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Sensation types available for logging
  const sensationTypes = ref([
    { id: 'tension', label: 'Tension', icon: '💢' },
    { id: 'relaxation', label: 'Relaxation', icon: '😌' },
    { id: 'warmth', label: 'Warmth', icon: '🔥' },
    { id: 'coldness', label: 'Coldness', icon: '❄️' },
    { id: 'tingling', label: 'Tingling', icon: '✨' },
    { id: 'numbness', label: 'Numbness', icon: '🔇' },
    { id: 'pain', label: 'Pain', icon: '⚡' },
    { id: 'pleasure', label: 'Pleasure', icon: '💚' },
    { id: 'pulsing', label: 'Pulsing', icon: '💓' },
    { id: 'heaviness', label: 'Heaviness', icon: '⬇️' },
    { id: 'lightness', label: 'Lightness', icon: '⬆️' },
    { id: 'openness', label: 'Openness', icon: '🌸' },
    { id: 'constriction', label: 'Constriction', icon: '🔒' },
    { id: 'neutral', label: 'Neutral', icon: '➖' },
  ])

  async function fetchSegments() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/segments')
      segments.value = response.segments
      return response.segments
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function getSegmentById(id) {
    return segments.value.find(s => s.id === id)
  }

  function getSensationTypeById(id) {
    return sensationTypes.value.find(s => s.id === id)
  }

  return {
    segments,
    sensationTypes,
    loading,
    error,
    fetchSegments,
    getSegmentById,
    getSensationTypeById,
  }
})
