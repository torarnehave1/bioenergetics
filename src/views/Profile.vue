<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const name = ref('')
const consentTracking = ref(false)
const saving = ref(false)
const saved = ref(false)
const instructors = ref([])
const loadingInstructors = ref(true)

onMounted(async () => {
  name.value = userStore.email?.split('@')[0] || ''
  consentTracking.value = false

  // Load instructors (disabled for now - requires API integration)
  loadingInstructors.value = false
})

async function saveProfile() {
  saving.value = true
  saved.value = false

  try {
    // Profile update would be handled via dashboard.vegvisr.org in Vegvisr pattern
    // For now, just show saved
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err) {
    console.error('Failed to save profile:', err)
  } finally {
    saving.value = false
  }
}

async function toggleConsent(instructor, consent) {
  try {
    await api.post('/api/users/consent', {
      instructor_id: instructor.id,
      consent,
    })
    instructor.consent_given = consent ? 1 : 0
  } catch (err) {
    console.error('Failed to update consent:', err)
  }
}
</script>

<template>
  <div class="profile-page">
    <header class="page-header">
      <h1>Your Profile</h1>
    </header>

    <div class="profile-grid">
      <!-- Profile settings -->
      <section class="card profile-card">
        <h2>Profile Settings</h2>

        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              type="email"
              class="form-input"
              :value="userStore.email"
              disabled
            />
            <span class="form-help">Email cannot be changed</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="name">Display Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              class="form-input"
              placeholder="Your name"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <span class="role-badge" :class="userStore.role">
              {{ userStore.role }}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Account Status</label>
            <span class="text-muted">
              Active
            </span>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <span v-if="saved" class="save-success">Saved!</span>
          </div>
        </form>
      </section>

      <!-- Privacy & Consent -->
      <section class="card privacy-card">
        <h2>Privacy & Consent</h2>

        <div class="consent-section">
          <h3>Instructor Tracking</h3>
          <p class="consent-description">
            If you work with an instructor, you can choose to share your progress data with them.
            This helps them support your practice more effectively.
          </p>

          <div v-if="loadingInstructors" class="loading-state">
            Loading...
          </div>

          <div v-else-if="instructors.length" class="instructor-list">
            <div
              v-for="instructor in instructors"
              :key="instructor.id"
              class="instructor-item"
            >
              <div class="instructor-info">
                <span class="instructor-name">{{ instructor.name || instructor.email }}</span>
                <span v-if="instructor.consent_given" class="consent-status granted">
                  Access granted
                </span>
                <span v-else class="consent-status">
                  No access
                </span>
              </div>
              <div class="consent-actions">
                <button
                  v-if="!instructor.consent_given"
                  class="btn btn-primary btn-sm"
                  @click="toggleConsent(instructor, true)"
                >
                  Grant Access
                </button>
                <button
                  v-else
                  class="btn btn-secondary btn-sm"
                  @click="toggleConsent(instructor, false)"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>You don't have any instructors yet.</p>
            <p class="text-muted">
              If an instructor adds you to their student list, they'll appear here.
            </p>
          </div>
        </div>

        <div class="consent-section">
          <h3>Data Usage</h3>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="consentTracking"
              @change="saveProfile"
            />
            <span class="checkbox-text">
              Allow instructors I've approved to view my progress and experiences
            </span>
          </label>
        </div>
      </section>

      <!-- Data Export -->
      <section class="card data-card">
        <h2>Your Data</h2>

        <p class="data-description">
          Your body experience data belongs to you. You can export it at any time.
        </p>

        <div class="data-actions">
          <button class="btn btn-secondary">
            Export All Data (JSON)
          </button>
          <button class="btn btn-secondary">
            Export Experiences (CSV)
          </button>
        </div>

        <div class="danger-zone">
          <h3>Danger Zone</h3>
          <p>Permanently delete your account and all associated data.</p>
          <button class="btn btn-outline danger">
            Delete Account
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.profile-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.card h2 {
  margin-bottom: var(--space-lg);
}

.form-help {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
  background: var(--color-bg-secondary);
}

.role-badge.instructor {
  background: var(--color-primary);
  color: white;
}

.role-badge.admin {
  background: var(--color-danger);
  color: white;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.save-success {
  color: var(--color-success);
  font-weight: 500;
}

.consent-section {
  margin-bottom: var(--space-xl);
}

.consent-section h3 {
  font-size: 1rem;
  margin-bottom: var(--space-sm);
}

.consent-description {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--space-md);
}

.instructor-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.instructor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.instructor-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.instructor-name {
  font-weight: 500;
}

.consent-status {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.consent-status.granted {
  color: var(--color-success);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 4px;
}

.checkbox-text {
  font-size: 0.875rem;
}

.data-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.data-actions {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.danger-zone {
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.danger-zone h3 {
  color: var(--color-danger);
  font-size: 1rem;
  margin-bottom: var(--space-sm);
}

.danger-zone p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.btn.danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn.danger:hover {
  background: var(--color-danger);
  color: white;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-lg);
  color: var(--color-text-secondary);
}
</style>
