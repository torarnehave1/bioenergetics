<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExercisesStore } from '../stores/exercises'

const router = useRouter()
const route = useRoute()
const exercisesStore = useExercisesStore()

const loading = ref(true)
const sessionId = ref(route.query.session || null)

onMounted(async () => {
  await exercisesStore.fetchExercise(route.params.id)
  loading.value = false
})

const exercise = computed(() => exercisesStore.currentExercise)

const targetSegments = computed(() => {
  if (!exercise.value?.target_segments) return []
  try {
    return JSON.parse(exercise.value.target_segments)
  } catch {
    return []
  }
})

function startExercise() {
  // Generate a new session ID and redirect to log experience
  const newSessionId = crypto.randomUUID()
  router.push(`/log?type=before&exercise=${exercise.value.id}&session=${newSessionId}`)
}

function logAfter() {
  router.push(`/log/${sessionId.value}`)
}

const difficultyColors = {
  beginner: 'var(--color-success)',
  intermediate: 'var(--color-warning)',
  advanced: 'var(--color-danger)',
}
</script>

<template>
  <div class="exercise-detail">
    <div v-if="loading" class="loading-state">
      Loading exercise...
    </div>

    <template v-else-if="exercise">
      <div class="back-link">
        <RouterLink to="/exercises">← Back to exercises</RouterLink>
      </div>

      <div class="exercise-content card">
        <div class="exercise-header">
          <div>
            <span
              class="difficulty-badge"
              :style="{ backgroundColor: difficultyColors[exercise.difficulty] }"
            >
              {{ exercise.difficulty }}
            </span>
            <span v-if="exercise.category_name" class="category-badge">
              {{ exercise.category_name }}
            </span>
          </div>
          <span v-if="exercise.duration_minutes" class="duration">
            ⏱️ {{ exercise.duration_minutes }} minutes
          </span>
        </div>

        <h1>{{ exercise.title }}</h1>
        <p class="description">{{ exercise.description }}</p>

        <!-- Target segments -->
        <div v-if="targetSegments.length" class="target-segments">
          <h3>Target Body Segments</h3>
          <div class="segment-tags">
            <span
              v-for="segment in targetSegments"
              :key="segment"
              class="segment-tag"
              :style="{ '--segment-color': `var(--segment-${segment})` }"
            >
              {{ segment }}
            </span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="instructions-section">
          <h3>Instructions</h3>
          <div class="instructions">
            {{ exercise.instructions || 'No detailed instructions available.' }}
          </div>
        </div>

        <!-- Safety notes -->
        <div v-if="exercise.safety_notes" class="safety-section">
          <h3>⚠️ Safety Notes</h3>
          <p class="safety-notes">{{ exercise.safety_notes }}</p>
        </div>

        <!-- Actions -->
        <div class="actions">
          <template v-if="sessionId">
            <p class="session-notice">
              You're in an exercise session. Complete the exercise above, then log your experience.
            </p>
            <button class="btn btn-primary btn-lg" @click="logAfter">
              Log After Experience
            </button>
          </template>
          <template v-else>
            <button class="btn btn-primary btn-lg" @click="startExercise">
              Start Exercise Session
            </button>
            <p class="action-hint">
              This will log your "before" experience, then guide you through the exercise.
            </p>
          </template>
        </div>
      </div>
    </template>

    <div v-else class="error-state card">
      <h2>Exercise not found</h2>
      <p>The exercise you're looking for doesn't exist or has been removed.</p>
      <RouterLink to="/exercises" class="btn btn-primary">
        Browse exercises
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.exercise-detail {
  max-width: 800px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: var(--space-lg);
}

.back-link a {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.back-link a:hover {
  color: var(--color-primary);
}

.exercise-content {
  padding: var(--space-xl);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.difficulty-badge,
.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-right: var(--space-sm);
}

.difficulty-badge {
  color: white;
}

.category-badge {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.duration {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.exercise-content h1 {
  margin-bottom: var(--space-md);
}

.description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-xl);
}

.target-segments,
.instructions-section,
.safety-section {
  margin-bottom: var(--space-xl);
}

.target-segments h3,
.instructions-section h3,
.safety-section h3 {
  margin-bottom: var(--space-md);
  font-size: 1rem;
}

.segment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.segment-tag {
  padding: var(--space-xs) var(--space-md);
  background: color-mix(in srgb, var(--segment-color) 20%, transparent);
  border-left: 3px solid var(--segment-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  text-transform: capitalize;
}

.instructions {
  background: var(--color-bg-secondary);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  line-height: 1.8;
  white-space: pre-wrap;
}

.safety-section {
  background: color-mix(in srgb, var(--color-warning) 10%, white);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-warning);
}

.safety-notes {
  margin: 0;
  color: var(--color-text-secondary);
}

.actions {
  text-align: center;
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border-light);
}

.session-notice {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.action-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: var(--space-md);
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--space-2xl);
}

.error-state h2 {
  margin-bottom: var(--space-md);
}

.error-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}
</style>
