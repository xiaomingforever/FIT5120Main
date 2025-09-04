<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'submit', payload: { age: string | null; gender: string | null }): void
  (e: 'close'): void
}>()

const age = ref<string | null>(null)
const gender = ref<string | null>(null)

const selectAge = (a: string) => (age.value = a)
const selectGender = (g: string) => (gender.value = g)

const close = () => {
  emit('update:open', false)
  emit('close')
}
const submit = () => emit('submit', { age: age.value, gender: gender.value })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="close">
      <div class="modal">
        <!-- selector card content -->
        <button class="close" aria-label="Close" @click="close">✕</button>
        <img src="/src/selector page/baby-1.webp" alt="Baby" class="icon" />
        <h2 class="title">Select your child's<br />age and gender</h2>

        <!-- Age -->
        <div class="row">
          <label class="label">Age:</label>
          <div class="options">
            <button :class="['opt', { active: age === '0-1' }]" @click="selectAge('0-1')">
              0-1
            </button>
            <button :class="['opt', { active: age === '1-2' }]" @click="selectAge('1-2')">
              1-2
            </button>
            <button :class="['opt', { active: age === '3-5' }]" @click="selectAge('3-5')">
              3-5
            </button>
          </div>
        </div>

        <!-- Gender -->
        <div class="row">
          <label class="label">Gender:</label>
          <div class="options">
            <button :class="['opt', { active: gender === 'Girl' }]" @click="selectGender('Girl')">
              <img src="/src/assets/selector page/girl.png" alt="Girl" class="icon" /> Girl Girl
            </button>
            <button :class="['opt', { active: gender === 'Boy' }]" @click="selectGender('Boy')">
              <img src="/src/assets/selector page/boy.png" alt="Boy" class="icon" /> Boy
            </button>
          </div>
        </div>

        <div class="footer">
          <button class="enter" @click="submit">Enter</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
}
.modal {
  width: min(680px, 92vw);
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.close {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
}
.title {
  text-align: center;
  margin: 4px 0 20px;
}
.row {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 14px;
  margin: 14px 0;
}
.label {
  font-weight: 700;
}
.options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.opt {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fdfbe6;
  cursor: pointer;
}
.opt.active {
  background: #a9cbd0;
  color: #fff;
  border-color: #a9cbd0;
}
.icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.footer {
  text-align: center;
  margin-top: 16px;
}
.enter {
  padding: 10px 24px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fdfbe6;
  font-weight: 600;
  cursor: pointer;
}
</style>
