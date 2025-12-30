<script setup>
import { ref, onMounted } from 'vue'
import { useSegmentsStore } from '../stores/segments'

const segmentsStore = useSegmentsStore()
const selectedSegment = ref(null)

onMounted(async () => {
  await segmentsStore.fetchSegments()
})

function selectSegment(segment) {
  selectedSegment.value = selectedSegment.value?.id === segment.id ? null : segment
}

// Detailed information about each segment
const segmentDetails = {
  ocular: {
    functions: ['Visual perception', 'Crying and weeping', 'Eye contact', 'Attention and focus'],
    blockages: ['Chronic tension in forehead', 'Eye strain and headaches', 'Difficulty making eye contact', 'Spacing out or dissociation'],
    exercises: ['Eye stretches and rotations', 'Soft focus exercises', 'Forehead massage', 'Allowing tears'],
  },
  oral: {
    functions: ['Taking in nourishment', 'Verbal expression', 'Kissing and biting', 'Crying out'],
    blockages: ['Jaw tension (TMJ)', 'Difficulty speaking up', 'Shallow breathing through mouth', 'Grinding teeth'],
    exercises: ['Jaw release exercises', 'Humming and toning', 'Yawning stretches', 'Gentle jaw massage'],
  },
  cervical: {
    functions: ['Control and surrender', 'Turning toward or away', 'Swallowing emotions', 'Voice production'],
    blockages: ['Stiff neck', 'Choking sensations', 'Difficulty swallowing', 'Thyroid issues'],
    exercises: ['Neck stretches', 'Head rolls', 'Voicing sounds', 'Throat opening exercises'],
  },
  thoracic: {
    functions: ['Heartfelt emotions', 'Reaching out', 'Breathing deeply', 'Love and grief'],
    blockages: ['Shallow breathing', 'Collapsed chest', 'Arm tension', 'Difficulty giving/receiving'],
    exercises: ['Chest opening stretches', 'Deep breathing', 'Arm reaching exercises', 'Heart-opening poses'],
  },
  diaphragmatic: {
    functions: ['Breath regulation', 'Managing anxiety', 'Connection upper/lower body', 'Emotional processing'],
    blockages: ['Restricted breathing', 'Chronic anxiety', 'Tension in solar plexus', 'Difficulty relaxing'],
    exercises: ['Diaphragmatic breathing', 'Belly massage', 'Side stretches', 'Letting go exercises'],
  },
  abdominal: {
    functions: ['Gut feelings', 'Core support', 'Digestion', 'Containing emotions'],
    blockages: ['Chronic belly tension', 'Digestive issues', 'Low back pain', 'Difficulty trusting gut'],
    exercises: ['Belly breathing', 'Core awareness', 'Lower back releases', 'Gut feeling exercises'],
  },
  pelvic: {
    functions: ['Grounding', 'Sexuality', 'Basic trust', 'Connection to earth'],
    blockages: ['Hip tension', 'Sexual difficulties', 'Lack of grounding', 'Fear of pleasure'],
    exercises: ['Grounding exercises', 'Hip circles', 'Leg shaking', 'Pelvic floor awareness'],
  },
}
</script>

<template>
  <div class="body-segments-page">
    <header class="page-header">
      <h1>Reich's 7 Body Segments</h1>
      <p class="subtitle">
        Wilhelm Reich identified seven muscular armor segments where emotional tension accumulates.
        Click on a segment to learn more.
      </p>
    </header>

    <div class="segments-container">
      <!-- Visual body with segments -->
      <div class="body-visual">
        <div class="segment-stack">
          <button
            v-for="segment in segmentsStore.segments"
            :key="segment.id"
            class="segment-block"
            :class="{ selected: selectedSegment?.id === segment.id }"
            :style="{ '--segment-color': segment.color }"
            @click="selectSegment(segment)"
          >
            <span class="segment-number">{{ segment.order_index }}</span>
            <span class="segment-name">{{ segment.name }}</span>
          </button>
        </div>
      </div>

      <!-- Segment details -->
      <div class="segment-details">
        <div v-if="selectedSegment" class="detail-card card">
          <div class="detail-header" :style="{ borderColor: selectedSegment.color }">
            <h2>
              <span class="segment-dot" :style="{ backgroundColor: selectedSegment.color }"></span>
              {{ selectedSegment.name }} Segment
            </h2>
          </div>

          <p class="segment-description">{{ selectedSegment.description }}</p>

          <div class="detail-section">
            <h3>Functions</h3>
            <ul>
              <li v-for="func in segmentDetails[selectedSegment.id]?.functions" :key="func">
                {{ func }}
              </li>
            </ul>
          </div>

          <div class="detail-section">
            <h3>Signs of Blockage</h3>
            <ul class="blockage-list">
              <li v-for="block in segmentDetails[selectedSegment.id]?.blockages" :key="block">
                {{ block }}
              </li>
            </ul>
          </div>

          <div class="detail-section">
            <h3>Helpful Exercises</h3>
            <ul class="exercise-list">
              <li v-for="ex in segmentDetails[selectedSegment.id]?.exercises" :key="ex">
                {{ ex }}
              </li>
            </ul>
          </div>

          <div class="detail-actions">
            <RouterLink
              :to="`/exercises?category=body_segments`"
              class="btn btn-primary"
            >
              Browse Related Exercises
            </RouterLink>
          </div>
        </div>

        <div v-else class="placeholder-card card">
          <div class="placeholder-content">
            <span class="placeholder-icon">👆</span>
            <p>Select a segment to learn more about its functions, common blockages, and exercises.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Introduction section -->
    <section class="intro-section card">
      <h2>Understanding Body Segments</h2>
      <p>
        Wilhelm Reich discovered that chronic muscular tension forms in horizontal "rings" or
        segments across the body. These segments act as "armor" that blocks the natural flow
        of energy and emotion.
      </p>
      <p>
        Each segment is associated with specific emotional themes. When we experience
        difficult emotions, we often unconsciously tense certain areas of our body.
        Over time, this becomes chronic tension that restricts breathing, movement,
        and emotional expression.
      </p>
      <p>
        By bringing awareness to these segments and practicing specific exercises,
        we can gradually release this armor and reconnect with our natural aliveness.
      </p>
    </section>
  </div>
</template>

<style scoped>
.body-segments-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.subtitle {
  color: var(--color-text-secondary);
  max-width: 600px;
}

.segments-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

@media (max-width: 768px) {
  .segments-container {
    grid-template-columns: 1fr;
  }
}

.body-visual {
  display: flex;
  justify-content: center;
}

.segment-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
  max-width: 250px;
}

.segment-block {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 2px solid var(--segment-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.segment-block:hover {
  background: color-mix(in srgb, var(--segment-color) 10%, white);
  transform: translateX(4px);
}

.segment-block.selected {
  background: color-mix(in srgb, var(--segment-color) 20%, white);
  box-shadow: var(--shadow-md);
}

.segment-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--segment-color);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
}

.segment-name {
  font-weight: 500;
}

.detail-card {
  animation: slideUp var(--transition-normal);
}

.detail-header {
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-md);
  border-bottom: 3px solid;
}

.detail-header h2 {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0;
}

.segment-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.segment-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.detail-section {
  margin-bottom: var(--space-lg);
}

.detail-section h3 {
  font-size: 1rem;
  margin-bottom: var(--space-sm);
}

.detail-section ul {
  list-style: none;
  padding: 0;
}

.detail-section li {
  padding: var(--space-xs) 0;
  padding-left: var(--space-lg);
  position: relative;
}

.detail-section li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.blockage-list li::before {
  content: "⚠";
  color: var(--color-warning);
}

.exercise-list li::before {
  content: "→";
  color: var(--color-success);
}

.detail-actions {
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.placeholder-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.placeholder-content {
  text-align: center;
  color: var(--color-text-secondary);
}

.placeholder-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-md);
}

.intro-section {
  margin-top: var(--space-xl);
}

.intro-section h2 {
  margin-bottom: var(--space-lg);
}

.intro-section p {
  color: var(--color-text-secondary);
  line-height: 1.8;
}
</style>
