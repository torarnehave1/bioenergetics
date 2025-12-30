<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProgressStore } from '../stores/progress'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const progressStore = useProgressStore()
const timeRange = ref(30)
const loading = ref(true)

onMounted(async () => {
  await progressStore.fetchAll(timeRange.value)
  loading.value = false
})

async function changeTimeRange(days) {
  timeRange.value = days
  loading.value = true
  await progressStore.fetchAll(days)
  loading.value = false
}

// Chart data for trends
const trendsChartData = computed(() => ({
  labels: progressStore.trends.map(t => {
    const date = new Date(t.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }),
  datasets: [
    {
      label: 'Mood',
      data: progressStore.trends.map(t => t.avg_mood),
      borderColor: 'rgb(52, 152, 219)',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Energy',
      data: progressStore.trends.map(t => t.avg_energy),
      borderColor: 'rgb(243, 156, 18)',
      backgroundColor: 'rgba(243, 156, 18, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Grounding',
      data: progressStore.trends.map(t => t.avg_grounding),
      borderColor: 'rgb(79, 121, 66)',
      backgroundColor: 'rgba(79, 121, 66, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
}))

const trendsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 1,
      max: 10,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
    },
  },
}

// Segment chart data
const segmentChartData = computed(() => ({
  labels: progressStore.segmentData.map(s => s.segment_name),
  datasets: [
    {
      label: 'Average Intensity',
      data: progressStore.segmentData.map(s => s.avg_intensity || 0),
      backgroundColor: progressStore.segmentData.map(s => s.segment_color),
      borderRadius: 4,
    },
  ],
}))

const segmentChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: {
      min: 0,
      max: 10,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
}
</script>

<template>
  <div class="progress-page">
    <header class="page-header">
      <h1>Your Progress</h1>
      <div class="time-range">
        <button
          v-for="days in [7, 30, 90]"
          :key="days"
          class="range-btn"
          :class="{ active: timeRange === days }"
          @click="changeTimeRange(days)"
        >
          {{ days }} days
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      Loading your progress data...
    </div>

    <template v-else>
      <!-- Summary stats -->
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="stat-icon">📝</span>
          <div class="stat-content">
            <span class="stat-value">{{ progressStore.summary?.total_experiences || 0 }}</span>
            <span class="stat-label">Total Experiences</span>
          </div>
        </div>

        <div class="stat-card card">
          <span class="stat-icon">🏃</span>
          <div class="stat-content">
            <span class="stat-value">{{ progressStore.summary?.total_sessions || 0 }}</span>
            <span class="stat-label">Exercise Sessions</span>
          </div>
        </div>

        <div class="stat-card card">
          <span class="stat-icon">😊</span>
          <div class="stat-content">
            <span class="stat-value">
              {{ progressStore.summary?.averages?.avg_mood?.toFixed(1) || '-' }}
            </span>
            <span class="stat-label">Avg Mood</span>
          </div>
        </div>

        <div class="stat-card card">
          <span class="stat-icon">🌍</span>
          <div class="stat-content">
            <span class="stat-value">
              {{ progressStore.summary?.averages?.avg_grounding?.toFixed(1) || '-' }}
            </span>
            <span class="stat-label">Avg Grounding</span>
          </div>
        </div>
      </div>

      <!-- Trends chart -->
      <section class="chart-section card">
        <h2>Rating Trends</h2>
        <div v-if="progressStore.trends.length" class="chart-container">
          <Line :data="trendsChartData" :options="trendsChartOptions" />
        </div>
        <div v-else class="empty-chart">
          <p>Log more experiences to see trends over time.</p>
        </div>
      </section>

      <!-- Body segments chart -->
      <section class="chart-section card">
        <h2>Body Segment Activity</h2>
        <div v-if="progressStore.segmentData.length" class="chart-container">
          <Bar :data="segmentChartData" :options="segmentChartOptions" />
        </div>
        <div v-else class="empty-chart">
          <p>Log body sensations to see segment activity.</p>
        </div>
      </section>

      <!-- Before/After comparisons -->
      <section class="comparisons-section card">
        <h2>Before & After Comparisons</h2>

        <div v-if="progressStore.comparisons.length" class="comparison-list">
          <div
            v-for="comp in progressStore.comparisons"
            :key="comp.session_id"
            class="comparison-item"
          >
            <div class="comparison-header">
              <span class="comparison-exercise">{{ comp.exercise_title || 'Exercise' }}</span>
              <span class="comparison-date">
                {{ new Date(comp.date).toLocaleDateString() }}
              </span>
            </div>

            <div class="comparison-metrics">
              <div class="metric">
                <span class="metric-label">Mood</span>
                <div class="metric-bars">
                  <div class="bar-row">
                    <span class="bar-label">Before</span>
                    <div class="bar-container">
                      <div
                        class="bar before"
                        :style="{ width: (comp.before.mood || 0) * 10 + '%' }"
                      >
                        {{ comp.before.mood }}
                      </div>
                    </div>
                  </div>
                  <div class="bar-row">
                    <span class="bar-label">After</span>
                    <div class="bar-container">
                      <div
                        class="bar after"
                        :style="{ width: (comp.after.mood || 0) * 10 + '%' }"
                      >
                        {{ comp.after.mood }}
                      </div>
                    </div>
                  </div>
                </div>
                <span class="change" :class="{ positive: comp.changes.mood > 0, negative: comp.changes.mood < 0 }">
                  {{ comp.changes.mood > 0 ? '+' : '' }}{{ comp.changes.mood }}
                </span>
              </div>

              <div class="metric">
                <span class="metric-label">Energy</span>
                <div class="metric-bars">
                  <div class="bar-row">
                    <span class="bar-label">Before</span>
                    <div class="bar-container">
                      <div
                        class="bar before"
                        :style="{ width: (comp.before.energy || 0) * 10 + '%' }"
                      >
                        {{ comp.before.energy }}
                      </div>
                    </div>
                  </div>
                  <div class="bar-row">
                    <span class="bar-label">After</span>
                    <div class="bar-container">
                      <div
                        class="bar after"
                        :style="{ width: (comp.after.energy || 0) * 10 + '%' }"
                      >
                        {{ comp.after.energy }}
                      </div>
                    </div>
                  </div>
                </div>
                <span class="change" :class="{ positive: comp.changes.energy > 0, negative: comp.changes.energy < 0 }">
                  {{ comp.changes.energy > 0 ? '+' : '' }}{{ comp.changes.energy }}
                </span>
              </div>

              <div class="metric">
                <span class="metric-label">Grounding</span>
                <div class="metric-bars">
                  <div class="bar-row">
                    <span class="bar-label">Before</span>
                    <div class="bar-container">
                      <div
                        class="bar before"
                        :style="{ width: (comp.before.grounding || 0) * 10 + '%' }"
                      >
                        {{ comp.before.grounding }}
                      </div>
                    </div>
                  </div>
                  <div class="bar-row">
                    <span class="bar-label">After</span>
                    <div class="bar-container">
                      <div
                        class="bar after"
                        :style="{ width: (comp.after.grounding || 0) * 10 + '%' }"
                      >
                        {{ comp.after.grounding }}
                      </div>
                    </div>
                  </div>
                </div>
                <span class="change" :class="{ positive: comp.changes.grounding > 0, negative: comp.changes.grounding < 0 }">
                  {{ comp.changes.grounding > 0 ? '+' : '' }}{{ comp.changes.grounding }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>Complete exercise sessions to see before/after comparisons.</p>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.progress-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.time-range {
  display: flex;
  gap: var(--space-sm);
}

.range-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.range-btn:hover {
  background: var(--color-border-light);
}

.range-btn.active {
  background: var(--color-primary);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.chart-section {
  margin-bottom: var(--space-xl);
}

.chart-section h2 {
  margin-bottom: var(--space-lg);
}

.chart-container {
  height: 300px;
}

.empty-chart,
.empty-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.comparisons-section h2 {
  margin-bottom: var(--space-lg);
}

.comparison-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.comparison-item {
  padding: var(--space-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.comparison-exercise {
  font-weight: 600;
}

.comparison-date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.comparison-metrics {
  display: grid;
  gap: var(--space-md);
}

.metric {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: var(--space-md);
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.bar-label {
  font-size: 0.7rem;
  width: 40px;
  color: var(--color-text-muted);
}

.bar-container {
  flex: 1;
  height: 16px;
  background: var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--space-xs);
  font-size: 0.7rem;
  color: white;
  min-width: 20px;
  transition: width var(--transition-normal);
}

.bar.before {
  background: var(--color-info);
}

.bar.after {
  background: var(--color-success);
}

.change {
  font-weight: 600;
  text-align: right;
}

.change.positive {
  color: var(--color-success);
}

.change.negative {
  color: var(--color-danger);
}

.loading-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-secondary);
}
</style>
