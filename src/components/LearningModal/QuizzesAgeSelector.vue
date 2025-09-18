<script setup lang="ts">
import { ref, withDefaults, defineProps, defineEmits } from 'vue'

type Props = {
  open: boolean
  closeOnOverlay?: boolean
  infantImg?: string
  toddlerImg?: string
  preschoolerImg?: string
}
const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: false,
  infantImg: '',
  toddlerImg: '',
  preschoolerImg: '',
})

// emit event
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start', age: '0-1' | '1-2' | '3-5'): void
}>()

// selection
const selected = ref<'0-1' | '1-2' | '3-5' | null>(null)
const pick = (age: '0-1' | '1-2' | '3-5') => { selected.value = age }
const start = () => { if (selected.value) emit('start', selected.value) }

function bgImageStyle(url?: string) {
  return url ? { backgroundImage: `url(${url})` } : {}
}
function onOverlay() {
  if (props.closeOnOverlay) emit('close')
}
</script>


<template>
  <teleport to="body">
    <div
      v-if="open"
      class="overlay"
      @click="onOverlay"
    >
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qas-title"
        @click.stop
      >
        <!-- Close button -->
        <button class="close" aria-label="Close" @click="$emit('close')">×</button>

        <h2 id="qas-title" class="title">Choose an age group</h2>

        <div class="grid">
          <!-- Infant -->
          <button class="age-card" type="button" :class="{ selected: selected === '0-1' }"
  @click="pick('0-1')">
            <div
              class="thumb"
              :style="bgImageStyle(infantImg)"
              aria-hidden="true"
            />
            <div class="label">
              <strong>Infant</strong>
              <span>(0-1)</span>
            </div>
          </button>

          <!-- Toddler -->
          <button class="age-card" type="button" :class="{ selected: selected === '1-2' }"
  @click="pick('1-2')">
            <div
              class="thumb"
              :style="bgImageStyle(toddlerImg)"
              aria-hidden="true"
            />
            <div class="label">
              <strong>Toddler</strong>
              <span>(1-2)</span>
            </div>
          </button>

          <!-- Preschooler -->
          <button class="age-card" type="button" :class="{ selected: selected === '3-5' }"
  @click="pick('3-5')">
            <div
              class="thumb"
              :style="bgImageStyle(preschoolerImg)"
              aria-hidden="true"
            />
            <div class="label">
              <strong>Preschooler</strong>
              <span>(3-5)</span>
            </div>
          </button>
        </div>

        <div class="actions">
          <button class="cta" type="button" :disabled="!selected" @click="start">Start Quiz</button>
        </div>
      </div>
    </div>
  </teleport>
</template>



<style scoped>
/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: #00000059;
  z-index: 60;
  padding: 24px;
}

/* Modal */
.modal {
  position: relative;
  width: min(960px, 100%);
  background: var(--surface, #fff);
  border-radius: 18px;
  box-shadow: 0 24px 60px #00000040;
  padding: 28px 28px 24px;
  border: 1px solid #0000000d;
}

.close {
  position: absolute;
  margin-bottom: 10px;
  top: 25px;
  right: 25px;
  z-index: 200;
  border: 0;
  background: #dfdfe0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 22px;
  font-weight: 600;
}
.close:hover { background: #eaeaea; }

.title {
  margin: 8px 0 22px;
  text-align: center;
  font-weight: 800;
  font-size: clamp(1.6rem, 2.2vw, 2rem);
  line-height: 1.2;
  color: var(--text, #1d1d1f);
}

/* Cards grid */
.grid {
  display: grid;
  gap: 22px;
  grid-template-columns: 1fr;
}
@media (min-width: 820px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* Age card */
.age-card {
  appearance: none;
  background: #fff;
  border: 0;
  border-radius: 16px;
  box-shadow: 0 2px 0 #00000005, 0 10px 22px #0000001a;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .2s ease;
  text-align: center;
  padding: 0;
  overflow: hidden;
}
.age-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px #00000029; }
.age-card:focus-visible { outline: 3px solid #f59e0b73; outline-offset: 2px; }
.age-card.selected { box-shadow: inset 0 0 0 2px #f59e0b; }
.cta:disabled { opacity: .5; cursor: not-allowed; }


/* Image area */
.thumb {
  height: 140px;
  background-size: cover;
  background-position: center;
}

/* Label area */
.label {
  padding: 14px 12px 16px;
  background: #fff4e0;
  border-top: 1px solid #0000000f;
  color: #1a1a1a;
  font-size: 0.98rem;
  display: grid;
  gap: 2px;
}
.label strong { font-weight: 700; }
.label span { opacity: .85; }

/* Footer actions */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.cta {
  appearance: none;
  border: 0;
  background: #f59e0b;
  color: #fff;
  font-weight: 700;
  border-radius: 999px;
  padding: 10px 18px;
  box-shadow: 0 6px 14px #f59e0b4d;
  cursor: pointer;
}
.cta:hover { filter: brightness(1.02); transform: translateY(-1px); }
.cta:active { transform: translateY(0); }
</style>
