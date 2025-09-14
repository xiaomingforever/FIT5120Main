
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  open: boolean
  activityName: string
  activityId: string | number
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
const router = useRouter()

function goActivities() {
  router.push({ name: 'Activities' })
  emit('close')
}
function goProgress() {
  router.push({ name: 'Progress' })
  emit('close')
}
function onBackdrop(e: MouseEvent) {
  // close when clicking outsife the window
  if ((e.target as HTMLElement)?.classList?.contains('congrats-backdrop')) emit('close')
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="congrats-backdrop" @click="onBackdrop">
      <div class="congrats-modal" role="dialog" aria-modal="true" aria-label="Congratulations">
        <button class="close-x" aria-label="Close" @click="emit('close')">×</button>


        <header class="hero">
          <h1 class="hero-title">Congratulations!</h1>
          <p class="hero-sub">
            You just finished a <span class="chip">{{ activityName }}</span> tip. Every small step
            helps your child grow.
          </p>

          <div class="hero-actions">
            <button class="btn btn-primary" @click="goActivities">Back to Activities</button>
            <button class="btn" @click="goProgress">View Progress</button>
          </div>
        </header>
      </div>
    </div>
  </teleport>
</template>

<style scoped>

.congrats-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: grid; place-items: center;
  z-index: 1000;
}
.congrats-modal {
  width: min(680px, 92vw);
  background: #eef2fe;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0,0,0,.24);
  overflow: hidden;
  position: relative;
  padding: 28px 24px 24px;
}

.close-x {
  position: absolute; top: 8px; right: 12px;
  border: 0;
  background: transparent;
  font-size: 28px;
  line-height: 1;
  cursor: pointer; color: #6b7280;
}

.hero {
  border-radius: 12px;
  padding: 22px 16px;
  text-align: center;
}
.hero-title {
  margin: 0 0 6px;
  font-size: 28px; font-weight: 800;
  color: #1f2937;
}
.hero-sub {
  margin: 0 auto;
  max-width: 46ch;
  color: #374151;
  line-height: 1.5; }
.chip {
  display: inline-block;
  background: #d1fae5;
  color: #065f46;
  border-radius: 999px;
  padding: 2px 10px;
  font-weight: 700;
}
.hero-actions {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}


.btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary {
  background: #22c55e;
  color: #fff; border-color: #16a34a;
}
.btn:focus { outline: 3px solid #a7f3d0; outline-offset: 1px; }
</style>
