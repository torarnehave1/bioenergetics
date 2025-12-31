<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const isAuthenticated = computed(() => {
  const isSessionVerified = sessionStorage.getItem('bioenergetics_session_verified') === '1'
  return userStore.loggedIn && isSessionVerified
})
</script>

<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1>Body Experience App</h1>
        <p class="hero-subtitle">
          Explore your body's wisdom through bioenergetic analysis.
          Track sensations, practice grounding, and discover your patterns.
        </p>

        <div class="hero-actions">
          <RouterLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="btn btn-primary btn-lg"
          >
            Go to Dashboard
          </RouterLink>
          <template v-else>
            <RouterLink to="/login" class="btn btn-primary btn-lg">
              Get Started
            </RouterLink>
          </template>
        </div>
      </div>

      <div class="hero-visual">
        <div class="body-silhouette">
          <div class="segment segment-1" title="Ocular"></div>
          <div class="segment segment-2" title="Oral"></div>
          <div class="segment segment-3" title="Cervical"></div>
          <div class="segment segment-4" title="Thoracic"></div>
          <div class="segment segment-5" title="Diaphragmatic"></div>
          <div class="segment segment-6" title="Abdominal"></div>
          <div class="segment segment-7" title="Pelvic"></div>
        </div>
      </div>
    </div>

    <section class="features">
      <h2>What You Can Do</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <span class="feature-icon">📝</span>
          <h3>Log Body Experiences</h3>
          <p>Record sensations before and after exercises. Track how your body responds to different practices.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">🧘</span>
          <h3>Guided Exercises</h3>
          <p>Access a library of grounding, breathing, and body awareness exercises.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">🌈</span>
          <h3>Reich's 7 Segments</h3>
          <p>Explore and understand the seven body segments and their emotional significance.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">📈</span>
          <h3>Track Progress</h3>
          <p>Visualize your journey with charts showing patterns and changes over time.</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">👨‍🏫</span>
          <h3>Instructor Support</h3>
          <p>Connect with instructors who can guide your practice (with your consent).</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">🛡️</span>
          <h3>Safe Practice</h3>
          <p>Built-in safety resources and check-ins to support your emotional wellbeing.</p>
        </div>
      </div>
    </section>

    <section class="about">
      <h2>About Bioenergetic Analysis</h2>
      <p>
        Bioenergetic Analysis is a form of body psychotherapy developed by Alexander Lowen,
        based on Wilhelm Reich's work. It explores the connection between the body and mind,
        recognizing that emotional experiences are stored in the body as muscular tension
        and blocked energy.
      </p>
      <p>
        By working with the body through breathing, movement, and awareness exercises,
        we can release chronic tension patterns and reconnect with our natural vitality.
      </p>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: center;
  padding: var(--space-2xl) 0;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-xl);
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.body-silhouette {
  width: 150px;
  height: 320px;
  position: relative;
}

.segment {
  position: absolute;
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

.segment-1 { /* Ocular */
  width: 60px;
  height: 45px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--segment-ocular);
  animation-delay: 0s;
}

.segment-2 { /* Oral */
  width: 45px;
  height: 30px;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--segment-oral);
  animation-delay: 0.3s;
}

.segment-3 { /* Cervical */
  width: 35px;
  height: 35px;
  top: 85px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--segment-cervical);
  animation-delay: 0.5s;
}

.segment-4 { /* Thoracic */
  width: 90px;
  height: 60px;
  top: 125px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--segment-thoracic);
  animation-delay: 0.7s;
}

.segment-5 { /* Diaphragmatic */
  width: 80px;
  height: 25px;
  top: 190px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--segment-diaphragmatic);
  animation-delay: 0.9s;
}

.segment-6 { /* Abdominal */
  width: 85px;
  height: 45px;
  top: 220px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--segment-abdominal);
  animation-delay: 1.1s;
}

.segment-7 { /* Pelvic */
  width: 100px;
  height: 55px;
  top: 270px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--segment-pelvic);
  animation-delay: 1.3s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
}

.features {
  padding: var(--space-2xl) 0;
}

.features h2 {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.feature-card {
  background: var(--color-surface);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: var(--space-md);
}

.feature-card h3 {
  margin-bottom: var(--space-sm);
}

.feature-card p {
  color: var(--color-text-secondary);
  margin: 0;
}

.about {
  padding: var(--space-2xl) 0;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.about h2 {
  margin-bottom: var(--space-lg);
}

.about p {
  color: var(--color-text-secondary);
  line-height: 1.8;
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    order: -1;
  }

  .body-silhouette {
    transform: scale(0.8);
  }
}
</style>
