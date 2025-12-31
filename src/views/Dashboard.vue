<script setup>
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useProgressStore } from '../stores/progress'
import { useExperiencesStore } from '../stores/experiences'

const userStore = useUserStore()
const progressStore = useProgressStore()
const experiencesStore = useExperiencesStore()

const loading = ref(true)

onMounted(async () => {
  try {
    await Promise.all([
      progressStore.fetchSummary(),
      experiencesStore.fetchExperiences({ limit: 5 }),
    ])
  } finally {
    loading.value = false
  }
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const userName = computed(() => {
  return userStore.email?.split('@')[0] || 'there'
})
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>{{ greeting }}, {{ userName }}!</h1>
      <p class="subtitle">How is your body feeling today?</p>
    </header>

    <div class="quick-actions">
      <RouterLink to="/log" class="action-card primary">
        <span class="action-icon">📝</span>
        <div class="action-content">
          <h3>Log Experience</h3>
          <p>Record your current body sensations</p>
        </div>
      </RouterLink>

      <RouterLink to="/exercises" class="action-card">
        <span class="action-icon">🏃</span>
        <div class="action-content">
          <h3>Start Exercise</h3>
          <p>Choose from guided exercises</p>
        </div>
      </RouterLink>

      <RouterLink to="/body-segments" class="action-card">
        <span class="action-icon">🧘</span>
        <div class="action-content">
          <h3>Body Segments</h3>
          <p>Explore Reich's 7 segments</p>
        </div>
      </RouterLink>
    </div>

    <div class="dashboard-grid">
      <section class="card stats-card">
        <div class="card-header">
          <h2 class="card-title">Your Progress</h2>
          <RouterLink to="/progress" class="view-all">View all</RouterLink>
        </div>

        <div v-if="loading" class="loading-state">Loading...</div>

        <div v-else-if="progressStore.summary" class="stats-grid">
          <div class="stat">
            <span class="stat-value">{{ progressStore.summary.total_experiences || 0 }}</span>
            <span class="stat-label">Experiences logged</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ progressStore.summary.total_sessions || 0 }}</span>
            <span class="stat-label">Exercise sessions</span>
          </div>
          <div class="stat">
            <span class="stat-value">
              {{ progressStore.summary.averages?.avg_mood?.toFixed(1) || '-' }}
            </span>
            <span class="stat-label">Avg. mood</span>
          </div>
          <div class="stat">
            <span class="stat-value">
              {{ progressStore.summary.averages?.avg_grounding?.toFixed(1) || '-' }}
            </span>
            <span class="stat-label">Avg. grounding</span>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>Start logging experiences to see your progress!</p>
        </div>
      </section>

      <section class="card recent-card">
        <div class="card-header">
          <h2 class="card-title">Recent Experiences</h2>
        </div>

        <div v-if="loading" class="loading-state">Loading...</div>

        <div v-else-if="experiencesStore.experiences.length" class="experience-list">
          <div
            v-for="exp in experiencesStore.experiences"
            :key="exp.id"
            class="experience-item"
          >
            <div class="experience-type">
              <span class="type-badge" :class="exp.experience_type">
                {{ exp.experience_type }}
              </span>
            </div>
            <div class="experience-details">
              <span v-if="exp.exercise_title" class="exercise-name">
                {{ exp.exercise_title }}
              </span>
              <span class="experience-date">
                {{ new Date(exp.created_at).toLocaleDateString() }}
              </span>
            </div>
            <div class="experience-ratings">
              <span v-if="exp.mood_rating" title="Mood">
                😊 {{ exp.mood_rating }}
              </span>
              <span v-if="exp.energy_rating" title="Energy">
                ⚡ {{ exp.energy_rating }}
              </span>
              <span v-if="exp.grounding_rating" title="Grounding">
                🌍 {{ exp.grounding_rating }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>No experiences logged yet.</p>
          <RouterLink to="/log" class="btn btn-primary btn-sm">
            Log your first experience
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  margin-bottom: var(--space-xl);
}

.dashboard-header h1 {
  margin-bottom: var(--space-xs);
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.action-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  color: var(--color-text);
}

.action-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.action-card.primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
}

.action-icon {
  font-size: 2rem;
}

.action-content h3 {
  font-size: 1rem;
  margin-bottom: var(--space-xs);
}

.action-content p {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.view-all {
  font-size: 0.875rem;
  color: var(--color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.stat {
  text-align: center;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.experience-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.type-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  text-transform: capitalize;
  background: var(--color-border);
}

.type-badge.before {
  background: var(--color-info);
  color: white;
}

.type-badge.after {
  background: var(--color-success);
  color: white;
}

.experience-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.exercise-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.experience-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.experience-ratings {
  display: flex;
  gap: var(--space-sm);
  font-size: 0.875rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.empty-state .btn {
  margin-top: var(--space-md);
}
</style>
