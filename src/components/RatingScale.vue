<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 5,
  },
  label: {
    type: String,
    required: true,
  },
  lowLabel: {
    type: String,
    default: 'Low',
  },
  highLabel: {
    type: String,
    default: 'High',
  },
  color: {
    type: String,
    default: 'var(--color-primary)',
  },
  icon: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const percentage = computed(() => ((props.modelValue - 1) / 9) * 100)
</script>

<template>
  <div class="rating-scale">
    <div class="rating-header">
      <label class="rating-label">
        <span v-if="icon" class="rating-icon">{{ icon }}</span>
        {{ label }}
      </label>
      <span class="rating-value">{{ modelValue }}/10</span>
    </div>

    <div class="slider-container">
      <input
        v-model.number="value"
        type="range"
        min="1"
        max="10"
        class="rating-slider"
        :style="{ '--slider-color': color, '--fill-percent': percentage + '%' }"
      />
      <div class="slider-track" :style="{ '--fill-percent': percentage + '%', '--track-color': color }"></div>
    </div>

    <div class="slider-labels">
      <span>{{ lowLabel }}</span>
      <span>{{ highLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.rating-scale {
  margin-bottom: var(--space-lg);
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.rating-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 500;
}

.rating-icon {
  font-size: 1.25rem;
}

.rating-value {
  font-weight: 600;
  color: var(--color-primary);
}

.slider-container {
  position: relative;
  height: 8px;
}

.rating-slider {
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  background: transparent;
  appearance: none;
  cursor: pointer;
  z-index: 2;
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    to right,
    var(--track-color) 0%,
    var(--track-color) var(--fill-percent),
    var(--color-border) var(--fill-percent),
    var(--color-border) 100%
  );
  z-index: 1;
  pointer-events: none;
}

.rating-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: grab;
  box-shadow: var(--shadow-md);
  border: 3px solid white;
}

.rating-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.1);
}

.rating-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: grab;
  box-shadow: var(--shadow-md);
  border: 3px solid white;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}
</style>
