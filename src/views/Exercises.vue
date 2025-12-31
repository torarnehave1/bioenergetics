<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useExercisesStore } from '../stores/exercises'
import { useUserStore } from '../stores/userStore'

const exercisesStore = useExercisesStore()
const userStore = useUserStore()

const isInstructor = computed(() =>
  userStore.role === 'instructor' || userStore.role === 'Admin' || userStore.role === 'Superadmin'
)

const selectedCategory = ref('')
const selectedDifficulty = ref('')
const showCreateModal = ref(false)

onMounted(async () => {
  await Promise.all([
    exercisesStore.fetchCategories(),
    exercisesStore.fetchExercises(),
  ])
})

const filteredExercises = computed(() => {
  return exercisesStore.exercises.filter(exercise => {
    if (selectedCategory.value && exercise.category_id !== selectedCategory.value) {
      return false
    }
    if (selectedDifficulty.value && exercise.difficulty !== selectedDifficulty.value) {
      return false
    }
    return true
  })
})

const difficulties = [
  { value: 'beginner', label: 'Beginner', color: 'var(--color-success)' },
  { value: 'intermediate', label: 'Intermediate', color: 'var(--color-warning)' },
  { value: 'advanced', label: 'Advanced', color: 'var(--color-danger)' },
]

function getCategoryIcon(categoryId) {
  const icons = {
    grounding: '🌍',
    breathing: '💨',
    body_segments: '🧘',
    expression: '🗣️',
    movement: '💃',
  }
  return icons[categoryId] || '📋'
}

function getDifficultyColor(difficulty) {
  return difficulties.find(d => d.value === difficulty)?.color || 'var(--color-text-muted)'
}
</script>

<template>
  <div class="exercises-page">
    <header class="page-header">
      <div>
        <h1>Exercise Library</h1>
        <p class="subtitle">Explore grounding, breathing, and body awareness exercises</p>
      </div>
      <button
        v-if="isInstructor"
        class="btn btn-primary"
        @click="showCreateModal = true"
      >
        + Create Exercise
      </button>
    </header>

    <!-- Filters -->
    <div class="filters card">
      <div class="filter-group">
        <label class="filter-label">Category</label>
        <div class="filter-options">
          <button
            class="filter-btn"
            :class="{ active: !selectedCategory }"
            @click="selectedCategory = ''"
          >
            All
          </button>
          <button
            v-for="category in exercisesStore.categories"
            :key="category.id"
            class="filter-btn"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            <span class="filter-icon">{{ getCategoryIcon(category.id) }}</span>
            {{ category.name }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Difficulty</label>
        <div class="filter-options">
          <button
            class="filter-btn"
            :class="{ active: !selectedDifficulty }"
            @click="selectedDifficulty = ''"
          >
            All
          </button>
          <button
            v-for="diff in difficulties"
            :key="diff.value"
            class="filter-btn"
            :class="{ active: selectedDifficulty === diff.value }"
            @click="selectedDifficulty = diff.value"
          >
            {{ diff.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Exercise grid -->
    <div v-if="exercisesStore.loading" class="loading-state">
      Loading exercises...
    </div>

    <div v-else-if="filteredExercises.length" class="exercise-grid">
      <RouterLink
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        :to="`/exercises/${exercise.id}`"
        class="exercise-card card"
      >
        <div class="exercise-header">
          <span class="exercise-icon">{{ getCategoryIcon(exercise.category_id) }}</span>
          <span
            class="difficulty-badge"
            :style="{ backgroundColor: getDifficultyColor(exercise.difficulty) }"
          >
            {{ exercise.difficulty }}
          </span>
        </div>

        <h3 class="exercise-title">{{ exercise.title }}</h3>
        <p class="exercise-description">{{ exercise.description }}</p>

        <div class="exercise-meta">
          <span v-if="exercise.duration_minutes" class="meta-item">
            ⏱️ {{ exercise.duration_minutes }} min
          </span>
          <span class="meta-item">
            {{ exercise.category_name }}
          </span>
        </div>
      </RouterLink>
    </div>

    <div v-else class="empty-state card">
      <p>No exercises found matching your filters.</p>
      <button class="btn btn-secondary" @click="selectedCategory = ''; selectedDifficulty = ''">
        Clear filters
      </button>
    </div>
  </div>
</template>

<style scoped>
.exercises-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xl);
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.filters {
  margin-bottom: var(--space-xl);
}

.filter-group {
  margin-bottom: var(--space-md);
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  background: var(--color-border-light);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
}

.filter-icon {
  font-size: 1rem;
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.exercise-card {
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
  color: var(--color-text);
}

.exercise-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.exercise-icon {
  font-size: 2rem;
}

.difficulty-badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 500;
  color: white;
  text-transform: capitalize;
}

.exercise-title {
  margin-bottom: var(--space-sm);
}

.exercise-description {
  flex: 1;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.exercise-meta {
  display: flex;
  gap: var(--space-md);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-secondary);
}

.empty-state .btn {
  margin-top: var(--space-md);
}
</style>
