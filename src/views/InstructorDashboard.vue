<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const students = ref([])
const selectedStudent = ref(null)
const studentProgress = ref(null)
const loading = ref(true)
const loadingProgress = ref(false)
const showAddModal = ref(false)
const newStudentEmail = ref('')
const addingStudent = ref(false)

onMounted(async () => {
  await loadStudents()
})

async function loadStudents() {
  loading.value = true
  try {
    // TODO: Integrate with body-experience-worker API
    students.value = []
  } catch (err) {
    console.error('Failed to load students:', err)
  } finally {
    loading.value = false
  }
}

async function selectStudent(student) {
  if (selectedStudent.value?.id === student.id) {
    selectedStudent.value = null
    studentProgress.value = null
    return
  }

  selectedStudent.value = student

  if (!student.consent_given) {
    studentProgress.value = null
    return
  }

  loadingProgress.value = true
  try {
    // TODO: Integrate with body-experience-worker API
    studentProgress.value = null
  } catch (err) {
    console.error('Failed to load student progress:', err)
    studentProgress.value = null
  } finally {
    loadingProgress.value = false
  }
}

async function addStudent() {
  if (!newStudentEmail.value) return

  addingStudent.value = true
  try {
    // TODO: Integrate with body-experience-worker API
    await loadStudents()
    showAddModal.value = false
    newStudentEmail.value = ''
  } catch (err) {
    console.error('Failed to add student:', err)
  } finally {
    addingStudent.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="instructor-dashboard">
    <header class="page-header">
      <div>
        <h1>Instructor Dashboard</h1>
        <p class="subtitle">Manage your students and track their progress</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        + Add Student
      </button>
    </header>

    <div class="dashboard-grid">
      <!-- Student list -->
      <section class="card students-card">
        <h2>Your Students</h2>

        <div v-if="loading" class="loading-state">Loading students...</div>

        <div v-else-if="students.length" class="student-list">
          <button
            v-for="student in students"
            :key="student.id"
            class="student-item"
            :class="{ selected: selectedStudent?.id === student.id }"
            @click="selectStudent(student)"
          >
            <div class="student-avatar">
              {{ (student.name || student.email)[0].toUpperCase() }}
            </div>
            <div class="student-info">
              <span class="student-name">{{ student.name || 'Unnamed' }}</span>
              <span class="student-email">{{ student.email }}</span>
            </div>
            <div class="student-status">
              <span
                v-if="student.consent_given"
                class="consent-badge granted"
                title="Consent granted"
              >
                ✓
              </span>
              <span
                v-else
                class="consent-badge pending"
                title="Awaiting consent"
              >
                ⏳
              </span>
            </div>
          </button>
        </div>

        <div v-else class="empty-state">
          <p>No students yet.</p>
          <button class="btn btn-primary btn-sm" @click="showAddModal = true">
            Add your first student
          </button>
        </div>
      </section>

      <!-- Student details -->
      <section class="card details-card">
        <div v-if="!selectedStudent" class="placeholder">
          <span class="placeholder-icon">👈</span>
          <p>Select a student to view their progress</p>
        </div>

        <template v-else>
          <div class="student-header">
            <div class="student-avatar large">
              {{ (selectedStudent.name || selectedStudent.email)[0].toUpperCase() }}
            </div>
            <div>
              <h2>{{ selectedStudent.name || 'Unnamed Student' }}</h2>
              <p class="text-muted">{{ selectedStudent.email }}</p>
            </div>
          </div>

          <!-- No consent message -->
          <div v-if="!selectedStudent.consent_given" class="no-consent">
            <span class="icon">🔒</span>
            <h3>Awaiting Consent</h3>
            <p>
              This student hasn't granted you access to their progress data yet.
              They can do this from their Profile settings.
            </p>
          </div>

          <!-- Loading progress -->
          <div v-else-if="loadingProgress" class="loading-state">
            Loading progress data...
          </div>

          <!-- Student progress -->
          <template v-else-if="studentProgress">
            <div class="progress-stats">
              <div class="stat">
                <span class="stat-value">{{ studentProgress.stats?.total_experiences || 0 }}</span>
                <span class="stat-label">Experiences</span>
              </div>
              <div class="stat">
                <span class="stat-value">
                  {{ studentProgress.stats?.avg_mood?.toFixed(1) || '-' }}
                </span>
                <span class="stat-label">Avg Mood</span>
              </div>
              <div class="stat">
                <span class="stat-value">
                  {{ studentProgress.stats?.avg_grounding?.toFixed(1) || '-' }}
                </span>
                <span class="stat-label">Avg Grounding</span>
              </div>
            </div>

            <h3>Recent Experiences</h3>
            <div v-if="studentProgress.experiences?.length" class="experience-list">
              <div
                v-for="exp in studentProgress.experiences.slice(0, 10)"
                :key="exp.id"
                class="experience-item"
              >
                <div class="exp-date">{{ formatDate(exp.created_at) }}</div>
                <div class="exp-details">
                  <span class="exp-type" :class="exp.experience_type">
                    {{ exp.experience_type }}
                  </span>
                  <span v-if="exp.exercise_title" class="exp-exercise">
                    {{ exp.exercise_title }}
                  </span>
                </div>
                <div class="exp-ratings">
                  <span title="Mood">😊 {{ exp.mood_rating || '-' }}</span>
                  <span title="Energy">⚡ {{ exp.energy_rating || '-' }}</span>
                  <span title="Grounding">🌍 {{ exp.grounding_rating || '-' }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No experiences logged yet.</p>
            </div>
          </template>
        </template>
      </section>
    </div>

    <!-- Add student modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Add Student</h3>
            <button class="close-btn" @click="showAddModal = false">✕</button>
          </div>

          <div class="modal-body">
            <p class="modal-description">
              Enter the student's email address. They will appear in your list,
              but you won't be able to see their progress until they grant consent.
            </p>

            <div class="form-group">
              <label class="form-label" for="student-email">Student Email</label>
              <input
                id="student-email"
                v-model="newStudentEmail"
                type="email"
                class="form-input"
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddModal = false">
              Cancel
            </button>
            <button
              class="btn btn-primary"
              :disabled="!newStudentEmail || addingStudent"
              @click="addStudent"
            >
              {{ addingStudent ? 'Adding...' : 'Add Student' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.instructor-dashboard {
  max-width: 1200px;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: var(--space-lg);
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.students-card h2 {
  margin-bottom: var(--space-lg);
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.student-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  width: 100%;
}

.student-item:hover {
  background: var(--color-border-light);
}

.student-item.selected {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.student-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.student-avatar.large {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  display: block;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-email {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.consent-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.75rem;
}

.consent-badge.granted {
  background: var(--color-success);
  color: white;
}

.consent-badge.pending {
  background: var(--color-border);
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--color-text-secondary);
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.student-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.student-header h2 {
  margin-bottom: var(--space-xs);
}

.no-consent {
  text-align: center;
  padding: var(--space-xl);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.no-consent .icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: var(--space-md);
}

.no-consent h3 {
  margin-bottom: var(--space-sm);
}

.no-consent p {
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat {
  text-align: center;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
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

.details-card h3 {
  margin-bottom: var(--space-md);
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.experience-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: var(--space-md);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.exp-date {
  color: var(--color-text-muted);
}

.exp-type {
  text-transform: capitalize;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  background: var(--color-border);
  margin-right: var(--space-sm);
}

.exp-type.before {
  background: var(--color-info);
  color: white;
}

.exp-type.after {
  background: var(--color-success);
  color: white;
}

.exp-ratings {
  display: flex;
  gap: var(--space-sm);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.modal {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 450px;
  width: 100%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.modal-body {
  padding: var(--space-lg);
}

.modal-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}
</style>
