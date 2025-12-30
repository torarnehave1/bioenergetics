<script setup>
import { ref } from 'vue'

const showBanner = ref(false)
const showSupportModal = ref(false)

function openSupport() {
  showSupportModal.value = true
}

function closeSupport() {
  showSupportModal.value = false
}

// Check if user has dismissed the banner recently
const dismissed = localStorage.getItem('safety_banner_dismissed')
if (!dismissed) {
  showBanner.value = true
}

function dismissBanner() {
  showBanner.value = false
  localStorage.setItem('safety_banner_dismissed', Date.now().toString())
}
</script>

<template>
  <div v-if="showBanner" class="safety-banner">
    <div class="banner-content">
      <span class="banner-icon">🛡️</span>
      <p class="banner-text">
        Working with body sensations can bring up strong emotions.
        <button class="support-link" @click="openSupport">Need support?</button>
      </p>
      <button class="dismiss-btn" @click="dismissBanner" aria-label="Dismiss">✕</button>
    </div>
  </div>

  <!-- Support Modal -->
  <Teleport to="body">
    <div v-if="showSupportModal" class="modal-overlay" @click.self="closeSupport">
      <div class="modal support-modal">
        <div class="modal-header">
          <h3>Safety & Support Resources</h3>
          <button class="close-btn" @click="closeSupport">✕</button>
        </div>

        <div class="modal-body">
          <div class="support-section">
            <h4>🧘 Grounding Techniques</h4>
            <ul>
              <li>Feel your feet on the floor</li>
              <li>Name 5 things you can see</li>
              <li>Take 3 slow, deep breaths</li>
              <li>Hold something cold or textured</li>
            </ul>
          </div>

          <div class="support-section">
            <h4>⚠️ When to Stop</h4>
            <p>
              Stop any exercise if you experience:
            </p>
            <ul>
              <li>Intense fear or panic</li>
              <li>Dissociation or feeling disconnected</li>
              <li>Physical pain (beyond mild discomfort)</li>
              <li>Overwhelming emotions you can't regulate</li>
            </ul>
          </div>

          <div class="support-section">
            <h4>📞 Crisis Resources</h4>
            <ul>
              <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
              <li><strong>SAMHSA Helpline:</strong> 1-800-662-4357</li>
              <li><strong>International:</strong> <a href="https://findahelpline.com" target="_blank">findahelpline.com</a></li>
            </ul>
          </div>

          <div class="support-section">
            <h4>💚 Remember</h4>
            <p>
              You are in control of your practice. Go at your own pace.
              It's okay to take breaks or stop entirely.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click="closeSupport">Got it</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.safety-banner {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  color: white;
  padding: var(--space-sm) var(--space-md);
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  max-width: 1200px;
  margin: 0 auto;
}

.banner-icon {
  font-size: 1.25rem;
}

.banner-text {
  margin: 0;
  font-size: 0.875rem;
}

.support-link {
  background: none;
  border: none;
  color: white;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
}

.dismiss-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.8;
  padding: var(--space-xs);
}

.dismiss-btn:hover {
  opacity: 1;
}

/* Modal styles */
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.support-section {
  margin-bottom: var(--space-lg);
}

.support-section:last-child {
  margin-bottom: 0;
}

.support-section h4 {
  margin-bottom: var(--space-sm);
  color: var(--color-primary);
}

.support-section ul {
  list-style: none;
  padding: 0;
}

.support-section li {
  padding: var(--space-xs) 0;
  padding-left: var(--space-md);
  position: relative;
}

.support-section li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.support-section a {
  color: var(--color-primary);
}

.modal-footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  text-align: right;
}
</style>
