import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export const useExercisesStore = defineStore('exercises', () => {
  const exercises = ref([])
  const categories = ref([])
  const currentExercise = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    try {
      const response = await api.get('/api/exercises/categories')
      categories.value = response.categories
      return response.categories
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  async function fetchExercises(options = {}) {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (options.category) params.append('category', options.category)
      if (options.difficulty) params.append('difficulty', options.difficulty)

      const response = await api.get(`/api/exercises?${params}`)
      exercises.value = response.exercises
      return response.exercises
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchExercise(id) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/exercises/${id}`)
      currentExercise.value = response.exercise
      return response.exercise
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createExercise(data) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/exercises', data)
      exercises.value.unshift(response.exercise)
      return response.exercise
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateExercise(id, data) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put(`/api/exercises/${id}`, data)
      const index = exercises.value.findIndex(e => e.id === id)
      if (index !== -1) {
        exercises.value[index] = response.exercise
      }
      if (currentExercise.value?.id === id) {
        currentExercise.value = response.exercise
      }
      return response.exercise
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteExercise(id) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/api/exercises/${id}`)
      exercises.value = exercises.value.filter(e => e.id !== id)
      if (currentExercise.value?.id === id) {
        currentExercise.value = null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    exercises,
    categories,
    currentExercise,
    loading,
    error,
    fetchCategories,
    fetchExercises,
    fetchExercise,
    createExercise,
    updateExercise,
    deleteExercise,
  }
})
