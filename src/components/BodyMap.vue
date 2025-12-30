<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSegmentsStore } from '../stores/segments'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const segmentsStore = useSegmentsStore()
const selectedSegment = ref(null)
const showSensationPicker = ref(false)

onMounted(async () => {
  if (segmentsStore.segments.length === 0) {
    await segmentsStore.fetchSegments()
  }
})

// Get sensation data for a segment
function getSensationForSegment(segmentId) {
  return props.modelValue.find((s) => s.segment_id === segmentId)
}

// Check if segment has data
function hasData(segmentId) {
  return !!getSensationForSegment(segmentId)
}

// Get intensity for segment (for color intensity)
function getIntensity(segmentId) {
  const sensation = getSensationForSegment(segmentId)
  return sensation?.intensity || 0
}

// Handle segment click
function handleSegmentClick(segment) {
  if (props.readonly) return
  selectedSegment.value = segment
  showSensationPicker.value = true
}

// Update sensation for segment
function updateSensation(segmentId, sensationType, intensity, notes = '') {
  const newValue = [...props.modelValue]
  const existingIndex = newValue.findIndex((s) => s.segment_id === segmentId)

  const sensationData = {
    segment_id: segmentId,
    sensation_type: sensationType,
    intensity,
    notes,
  }

  if (existingIndex !== -1) {
    newValue[existingIndex] = sensationData
  } else {
    newValue.push(sensationData)
  }

  emit('update:modelValue', newValue)
  closePicker()
}

// Remove sensation from segment
function removeSensation(segmentId) {
  const newValue = props.modelValue.filter((s) => s.segment_id !== segmentId)
  emit('update:modelValue', newValue)
  closePicker()
}

function closePicker() {
  showSensationPicker.value = false
  selectedSegment.value = null
}

// Current sensation data for picker
const currentSensation = computed(() => {
  if (!selectedSegment.value) return null
  return getSensationForSegment(selectedSegment.value.id)
})

// Picker state
const pickerSensationType = ref('')
const pickerIntensity = ref(5)
const pickerNotes = ref('')

// Reset picker when segment changes
function openPicker(segment) {
  selectedSegment.value = segment
  const existing = getSensationForSegment(segment.id)
  if (existing) {
    pickerSensationType.value = existing.sensation_type || ''
    pickerIntensity.value = existing.intensity || 5
    pickerNotes.value = existing.notes || ''
  } else {
    pickerSensationType.value = ''
    pickerIntensity.value = 5
    pickerNotes.value = ''
  }
  showSensationPicker.value = true
}

function saveSensation() {
  if (!selectedSegment.value || !pickerSensationType.value) return
  updateSensation(
    selectedSegment.value.id,
    pickerSensationType.value,
    pickerIntensity.value,
    pickerNotes.value
  )
}
</script>

<template>
  <div class="body-map">
    <div class="body-figure">
      <!-- SVG body outline with clickable segments -->
      <svg viewBox="0 0 200 400" class="body-svg">
        <!-- Background body silhouette -->
        <path
          class="body-silhouette"
          d="M100 20 C70 20 60 40 60 60 L60 80 C40 85 35 100 35 120 L35 200 C35 220 45 240 60 250 L60 280 C60 300 55 340 50 380 L70 380 C75 340 80 300 85 280 L100 280 L115 280 C120 300 125 340 130 380 L150 380 C145 340 140 300 140 280 L140 250 C155 240 165 220 165 200 L165 120 C165 100 160 85 140 80 L140 60 C140 40 130 20 100 20"
          fill="none"
          stroke="var(--color-border)"
          stroke-width="2"
        />

        <!-- Ocular segment (head) -->
        <ellipse
          :class="['segment', { active: hasData('ocular') }]"
          :style="{ '--segment-color': 'var(--segment-ocular)', '--intensity': getIntensity('ocular') / 10 }"
          cx="100"
          cy="35"
          rx="25"
          ry="20"
          @click="openPicker(segmentsStore.getSegmentById('ocular'))"
        />

        <!-- Oral segment (jaw/mouth) -->
        <ellipse
          :class="['segment', { active: hasData('oral') }]"
          :style="{ '--segment-color': 'var(--segment-oral)', '--intensity': getIntensity('oral') / 10 }"
          cx="100"
          cy="62"
          rx="18"
          ry="12"
          @click="openPicker(segmentsStore.getSegmentById('oral'))"
        />

        <!-- Cervical segment (neck) -->
        <rect
          :class="['segment', { active: hasData('cervical') }]"
          :style="{ '--segment-color': 'var(--segment-cervical)', '--intensity': getIntensity('cervical') / 10 }"
          x="85"
          y="75"
          width="30"
          height="25"
          rx="5"
          @click="openPicker(segmentsStore.getSegmentById('cervical'))"
        />

        <!-- Thoracic segment (chest) -->
        <ellipse
          :class="['segment', { active: hasData('thoracic') }]"
          :style="{ '--segment-color': 'var(--segment-thoracic)', '--intensity': getIntensity('thoracic') / 10 }"
          cx="100"
          cy="130"
          rx="40"
          ry="35"
          @click="openPicker(segmentsStore.getSegmentById('thoracic'))"
        />

        <!-- Diaphragmatic segment -->
        <ellipse
          :class="['segment', { active: hasData('diaphragmatic') }]"
          :style="{ '--segment-color': 'var(--segment-diaphragmatic)', '--intensity': getIntensity('diaphragmatic') / 10 }"
          cx="100"
          cy="175"
          rx="35"
          ry="15"
          @click="openPicker(segmentsStore.getSegmentById('diaphragmatic'))"
        />

        <!-- Abdominal segment -->
        <ellipse
          :class="['segment', { active: hasData('abdominal') }]"
          :style="{ '--segment-color': 'var(--segment-abdominal)', '--intensity': getIntensity('abdominal') / 10 }"
          cx="100"
          cy="210"
          rx="35"
          ry="25"
          @click="openPicker(segmentsStore.getSegmentById('abdominal'))"
        />

        <!-- Pelvic segment -->
        <ellipse
          :class="['segment', { active: hasData('pelvic') }]"
          :style="{ '--segment-color': 'var(--segment-pelvic)', '--intensity': getIntensity('pelvic') / 10 }"
          cx="100"
          cy="260"
          rx="40"
          ry="30"
          @click="openPicker(segmentsStore.getSegmentById('pelvic'))"
        />
      </svg>
    </div>

    <!-- Segment legend -->
    <div class="segment-legend">
      <div
        v-for="segment in segmentsStore.segments"
        :key="segment.id"
        class="legend-item"
        :class="{ active: hasData(segment.id) }"
        @click="openPicker(segment)"
      >
        <span class="legend-color" :style="{ backgroundColor: segment.color }"></span>
        <span class="legend-name">{{ segment.name }}</span>
        <span v-if="hasData(segment.id)" class="legend-indicator">
          {{ getSensationForSegment(segment.id)?.sensation_type }}
        </span>
      </div>
    </div>

    <!-- Sensation picker modal -->
    <Teleport to="body">
      <div v-if="showSensationPicker && selectedSegment" class="modal-overlay" @click.self="closePicker">
        <div class="modal sensation-picker">
          <div class="modal-header">
            <h3>
              <span class="segment-dot" :style="{ backgroundColor: selectedSegment.color }"></span>
              {{ selectedSegment.name }}
            </h3>
            <button class="close-btn" @click="closePicker">✕</button>
          </div>

          <div class="modal-body">
            <p class="segment-description">{{ selectedSegment.description }}</p>

            <div class="form-group">
              <label class="form-label">What do you feel?</label>
              <div class="sensation-grid">
                <button
                  v-for="sensation in segmentsStore.sensationTypes"
                  :key="sensation.id"
                  class="sensation-btn"
                  :class="{ selected: pickerSensationType === sensation.id }"
                  @click="pickerSensationType = sensation.id"
                >
                  <span class="sensation-icon">{{ sensation.icon }}</span>
                  <span class="sensation-label">{{ sensation.label }}</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Intensity: {{ pickerIntensity }}/10</label>
              <input
                v-model="pickerIntensity"
                type="range"
                min="1"
                max="10"
                class="rating-slider"
              />
              <div class="slider-labels">
                <span>Subtle</span>
                <span>Intense</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes (optional)</label>
              <textarea
                v-model="pickerNotes"
                class="form-textarea"
                rows="2"
                placeholder="Any additional observations..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button
              v-if="currentSensation"
              class="btn btn-secondary"
              @click="removeSensation(selectedSegment.id)"
            >
              Clear
            </button>
            <button
              class="btn btn-primary"
              :disabled="!pickerSensationType"
              @click="saveSensation"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.body-map {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

.body-figure {
  width: 100%;
  max-width: 250px;
}

.body-svg {
  width: 100%;
  height: auto;
}

.body-silhouette {
  fill: var(--color-bg-secondary);
}

.segment {
  fill: var(--color-bg-secondary);
  stroke: var(--segment-color);
  stroke-width: 2;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.segment:hover {
  fill: color-mix(in srgb, var(--segment-color) 20%, transparent);
}

.segment.active {
  fill: color-mix(in srgb, var(--segment-color) calc(var(--intensity) * 100%), transparent);
}

.segment-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-sm);
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.legend-item:hover {
  background-color: var(--color-border-light);
}

.legend-item.active {
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  font-size: 0.875rem;
  flex: 1;
}

.legend-indicator {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: capitalize;
}

/* Sensation picker modal */
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

.segment-description {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--space-lg);
}

.sensation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: var(--space-sm);
}

.sensation-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background-color: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sensation-btn:hover {
  background-color: var(--color-border-light);
}

.sensation-btn.selected {
  border-color: var(--color-primary);
  background-color: var(--color-bg);
}

.sensation-icon {
  font-size: 1.5rem;
}

.sensation-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}
</style>
