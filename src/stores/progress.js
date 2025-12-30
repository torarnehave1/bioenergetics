import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export const useProgressStore = defineStore('progress', () => {
  const summary = ref(null)
  const trends = ref([])
  const segmentData = ref([])
  const comparisons = ref([])
  const exerciseStats = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchSummary() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/progress')
      summary.value = response
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTrends(days = 30) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/progress/trends?days=${days}`)
      trends.value = response.trends
      return response.trends
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSegmentData(days = 30) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/progress/segments?days=${days}`)
      segmentData.value = response.segments
      return response.segments
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchComparisons(limit = 10) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/progress/comparisons?limit=${limit}`)
      comparisons.value = response.comparisons
      return response.comparisons
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchExerciseStats() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/progress/exercises')
      exerciseStats.value = response.exercises
      return response.exercises
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAll(days = 30) {
    await Promise.all([
      fetchSummary(),
      fetchTrends(days),
      fetchSegmentData(days),
      fetchComparisons(),
      fetchExerciseStats(),
    ])
  }

  return {
    summary,
    trends,
    segmentData,
    comparisons,
    exerciseStats,
    loading,
    error,
    fetchSummary,
    fetchTrends,
    fetchSegmentData,
    fetchComparisons,
    fetchExerciseStats,
    fetchAll,
  }
})
