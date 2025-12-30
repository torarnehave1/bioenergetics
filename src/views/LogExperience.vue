<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExperiencesStore } from '../stores/experiences'
import { useExercisesStore } from '../stores/exercises'
import BodyMap from '../components/BodyMap.vue'
import RatingScale from '../components/RatingScale.vue'

const router = useRouter()
const route = useRoute()
const experiencesStore = useExperiencesStore()
const exercisesStore = useExercisesStore()

// Form state
const step = ref(1)
const experienceType = ref('general')
const sessionId = ref(route.params.sessionId || null)
const selectedExercise = ref(null)
const sensations = ref([])
const moodRating = ref(5)
const energyRating = ref(5)
const groundingRating = ref(5)
const notes = ref('')
const feelingSafe = ref(true)
const needsSupport = ref(false)

const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  await exercisesStore.fetchExercises()

  // If we have a session ID, determine if this is before or after
  if (sessionId.value) {
    const sessionExperiences = await experiencesStore.fetchSession(sessionId.value)
    if (sessionExperiences.length > 0) {
      experienceType.value = 'after'
      // Pre-select the exercise from the before experience
      const beforeExp = sessionExperiences.find(e => e.experience_type === 'before')
      if (beforeExp?.exercise_id) {
        selectedExercise.value = beforeExp.exercise_id
      }
    }
  }
})

const totalSteps = computed(() => experienceType.value === 'general' ? 3 : 4)

const currentStepTitle = computed(() => {
  if (step.value === 1) return 'Type & Exercise'
  if (step.value === 2) return 'Body Sensations'
  if (step.value === 3) return 'Overall Ratings'
  if (step.value === 4) return 'Safety Check'
  return ''
})

const canProceed = computed(() => {
  if (step.value === 1) {
    if (experienceType.value === 'before' || experienceType.value === 'after') {
      return !!selectedExercise.value
    }
    return true
  }
  return true
})

function nextStep() {
  if (step.value < totalSteps.value) {
    step.value++
  } else {
    saveExperience()
  }
}

function prevStep() {
  if (step.value > 1) {
    step.value--
  }
}

async function saveExperience() {
  saving.value = true

  try {
    const result = await experiencesStore.createExperience({
      exercise_id: selectedExercise.value,
      experience_type: experienceType.value,
      session_id: sessionId.value,
      notes: notes.value,
      mood_rating: moodRating.value,
      energy_rating: energyRating.value,
      grounding_rating: groundingRating.value,
      sensations: sensations.value,
    })

    // Submit safety check-in
    if (experienceType.value !== 'general') {
      await experiencesStore.submitSafetyCheckin({
        experience_id: result.experience.id,
        feeling_safe: feelingSafe.value,
        needs_support: needsSupport.value,
      })
    }

    saved.value = true

    // If this was a "before" experience, redirect to exercise and then back for "after"
    if (experienceType.value === 'before' && selectedExercise.value) {
      setTimeout(() => {
        router.push(`/exercises/${selectedExercise.value}?session=${result.session_id}`)
      }, 1500)
    }
  } catch (err) {
    console.error('Failed to save experience:', err)
  } finally {
    saving.value = false
  }
}

function startNew() {
  step.value = 1
  experienceType.value = 'general'
  sessionId.value = null
  selectedExercise.value = null
  sensations.value = []
  moodRating.value = 5
  energyRating.value = 5
  groundingRating.value = 5
  notes.value = ''
  feelingSafe.value = true
  needsSupport.value = false
  saved.value = false
}
</script>

<template>
  <div class="log-experience">
    <header class="page-header">
      <h1>Log Body Experience</h1>
      <p class="subtitle">Take a moment to notice what's happening in your body</p>
    </header>

    <!-- Success state -->
    <div v-if="saved" class="success-card card">
      <div class="success-content">
        <span class="success-icon">✓</span>
        <h2>Experience Logged!</h2>
        <p v-if="experienceType === 'before'">
          Now let's do the exercise. You'll log your "after" experience when done.
        </p>
        <p v-else>
          Great work noticing your body sensations.
        </p>

        <div class="success-actions">
          <button class="btn btn-primary" @click="startNew">
            Log Another
          </button>
          <RouterLink to="/dashboard" class="btn btn-secondary">
            Back to Dashboard
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="form-container">
      <!-- Progress indicator -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (step / totalSteps) * 100 + '%' }"></div>
      </div>
      <div class="step-indicator">
        Step {{ step }} of {{ totalSteps }}: {{ currentStepTitle }}
      </div>

      <!-- Step 1: Type & Exercise -->
      <div v-if="step === 1" class="step-content card">
        <h2>What kind of experience is this?</h2>

        <div class="type-options">
          <button
            class="type-option"
            :class="{ selected: experienceType === 'general' }"
            @click="experienceType = 'general'; selectedExercise = null"
          >
            <span class="type-icon">📝</span>
            <span class="type-label">General Check-in</span>
            <span class="type-desc">Just noticing how I feel right now</span>
          </button>

          <button
            class="type-option"
            :class="{ selected: experienceType === 'before' }"
            @click="experienceType = 'before'"
          >
            <span class="type-icon">⏳</span>
            <span class="type-label">Before Exercise</span>
            <span class="type-desc">Logging before starting an exercise</span>
          </button>

          <button
            class="type-option"
            :class="{ selected: experienceType === 'after' }"
            @click="experienceType = 'after'"
          >
            <span class="type-icon">✅</span>
            <span class="type-label">After Exercise</span>
            <span class="type-desc">Logging after completing an exercise</span>
          </button>
        </div>

        <div v-if="experienceType === 'before' || experienceType === 'after'" class="exercise-select">
          <h3>Select Exercise</h3>
          <div class="exercise-grid">
            <button
              v-for="exercise in exercisesStore.exercises"
              :key="exercise.id"
              class="exercise-option"
              :class="{ selected: selectedExercise === exercise.id }"
              @click="selectedExercise = exercise.id"
            >
              <span class="exercise-title">{{ exercise.title }}</span>
              <span class="exercise-category">{{ exercise.category_name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Body Sensations -->
      <div v-if="step === 2" class="step-content card">
        <h2>What do you notice in your body?</h2>
        <p class="step-instruction">
          Click on body segments to record sensations. Take your time to scan each area.
        </p>

        <BodyMap v-model="sensations" />
      </div>

      <!-- Step 3: Overall Ratings -->
      <div v-if="step === 3" class="step-content card">
        <h2>Overall Experience</h2>

        <RatingScale
          v-model="moodRating"
          label="Mood"
          low-label="Low"
          high-label="High"
          icon="😊"
          color="var(--color-info)"
        />

        <RatingScale
          v-model="energyRating"
          label="Energy Level"
          low-label="Depleted"
          high-label="Energized"
          icon="⚡"
          color="var(--color-warning)"
        />

        <RatingScale
          v-model="groundingRating"
          label="Grounding"
          low-label="Ungrounded"
          high-label="Grounded"
          icon="🌍"
          color="var(--color-primary)"
        />

        <div class="form-group">
          <label class="form-label">Notes (optional)</label>
          <textarea
            v-model="notes"
            class="form-textarea"
            rows="3"
            placeholder="Any thoughts, observations, or insights..."
          ></textarea>
        </div>
      </div>

      <!-- Step 4: Safety Check (for exercise sessions) -->
      <div v-if="step === 4" class="step-content card">
        <h2>Safety Check-in</h2>
        <p class="step-instruction">
          It's important to check in with yourself after body work.
        </p>

        <div class="safety-options">
          <div class="safety-question">
            <p>Are you feeling safe and regulated right now?</p>
            <div class="safety-buttons">
              <button
                class="safety-btn"
                :class="{ selected: feelingSafe }"
                @click="feelingSafe = true"
              >
                Yes, I feel okay
              </button>
              <button
                class="safety-btn warning"
                :class="{ selected: !feelingSafe }"
                @click="feelingSafe = false"
              >
                I'm feeling unsettled
              </button>
            </div>
          </div>

          <div v-if="!feelingSafe" class="support-section">
            <p>Would you like support resources?</p>
            <button
              class="btn btn-secondary"
              @click="needsSupport = true"
            >
              Show me grounding techniques
            </button>
          </div>

          <div v-if="needsSupport" class="grounding-tips card">
            <h4>Quick Grounding</h4>
            <ul>
              <li>Feel your feet firmly on the floor</li>
              <li>Take 3 slow breaths</li>
              <li>Name 5 things you can see</li>
              <li>Hold something textured</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="form-navigation">
        <button
          v-if="step > 1"
          class="btn btn-secondary"
          @click="prevStep"
        >
          Back
        </button>
        <div class="spacer"></div>
        <button
          class="btn btn-primary"
          :disabled="!canProceed || saving"
          @click="nextStep"
        >
          {{ step === totalSteps ? (saving ? 'Saving...' : 'Save Experience') : 'Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-experience {
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.progress-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--transition-normal);
}

.step-indicator {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.step-content {
  animation: slideUp var(--transition-normal);
}

.step-content h2 {
  margin-bottom: var(--space-md);
}

.step-instruction {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.type-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--space-lg);
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.type-option:hover {
  background: var(--color-border-light);
}

.type-option.selected {
  border-color: var(--color-primary);
  background: var(--color-bg);
}

.type-icon {
  font-size: 1.5rem;
  margin-bottom: var(--space-sm);
}

.type-label {
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.type-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.exercise-select h3 {
  margin-bottom: var(--space-md);
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-sm);
}

.exercise-option {
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.exercise-option:hover {
  background: var(--color-border-light);
}

.exercise-option.selected {
  border-color: var(--color-primary);
}

.exercise-title {
  font-weight: 500;
  font-size: 0.875rem;
}

.exercise-category {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.form-navigation {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.spacer {
  flex: 1;
}

.success-card {
  text-align: center;
  padding: var(--space-2xl);
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--color-success);
  color: white;
  font-size: 2rem;
  border-radius: 50%;
  margin-bottom: var(--space-lg);
}

.success-content h2 {
  margin-bottom: var(--space-md);
}

.success-content p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.success-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.safety-question {
  margin-bottom: var(--space-lg);
}

.safety-question p {
  margin-bottom: var(--space-md);
  font-weight: 500;
}

.safety-buttons {
  display: flex;
  gap: var(--space-md);
}

.safety-btn {
  flex: 1;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.safety-btn:hover {
  background: var(--color-border-light);
}

.safety-btn.selected {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 10%, white);
}

.safety-btn.warning.selected {
  border-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 10%, white);
}

.support-section {
  margin-bottom: var(--space-lg);
}

.grounding-tips {
  background: var(--color-bg-secondary);
}

.grounding-tips h4 {
  margin-bottom: var(--space-md);
}

.grounding-tips ul {
  list-style: none;
  padding: 0;
}

.grounding-tips li {
  padding: var(--space-sm) 0;
  padding-left: var(--space-lg);
  position: relative;
}

.grounding-tips li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-primary);
}
</style>
