<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const age = ref<string | null>(null)
const gender = ref<string | null>(null)

const selectAge = (a: string) => (age.value = a)
const selectGender = (g: string) => (gender.value = g)

// generate routine
const enter = async () => {
  if (!age.value || ! gender.value) {
    alert('Please select both age and gender.')
    return
  }

  try {
    const res = await fetch('https://qr7uehfaof.execute-api.ap-southeast-2.amazonaws.com/dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age_group: age.value, gender: gender.value })
    })
    const data = await res.json()
    // save to localStorage
    localStorage.setItem('routine', JSON.stringify(data))
    // jump to display routine
    router.push('/')
  } catch (err) {
    console.error(err)
    alert('Failed to generate routine.')
  }
}
</script>

<template>
  <div class="selector-page">
    <div class="card">
      <button class="close" aria-label="Close" @click="router.push('/')">✕</button>

      <div class="header">
        <img src="/src/assets/selector page/baby-1.webp" alt="Baby" class="icon" />
        <h2>Select your child's<br />age and gender</h2>
      </div>

      <div class="section">
        <label class="label">Age:</label>
        <div class="options">
          <button :class="['opt', { active: age === '0-1y' }]" @click="selectAge('0-1y')">0-1</button>
          <button :class="['opt', { active: age === '1-3y' }]" @click="selectAge('1-3y')">1-3</button>
          <button :class="['opt', { active: age === '3-5y' }]" @click="selectAge('3-5y')">3-5</button>
        </div>
      </div>

      <div class="section">
        <label class="label">Gender:</label>
        <div class="options">
          <button :class="['opt', { active: gender === 'Girl' }]" @click="selectGender('girl')">
            <img src="/src/assets/selector page/girl.png" alt="Girl" class="icon" /> Girl
          </button>
          <button :class="['opt', { active: gender === 'Boy' }]" @click="selectGender('boy')">
            <img src="/src/assets/selector page/boy.png" alt="Boy" class="icon" /> Boy
          </button>
        </div>
      </div>

      <div class="footer">
        <button class="enter-btn" @click="enter">Enter</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.selector-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f6f3dc;
}
.card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  width: 360px;
  max-width: 90%;
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.02),
    0 10px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
}
.close {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
}
.header {
  margin-bottom: 22px;
}
.baby-icon {
  width: 54px;
  margin-bottom: 10px;
}
h2 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
}
.section {
  margin: 18px 0;
  text-align: left;
}
.label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}
.options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.opt {
  padding: 8px 16px;
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
.footer {
  margin-top: 22px;
}
.enter-btn {
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  background: #fdfbe6;
  font-weight: 600;
  cursor: pointer;
}
.enter-btn:hover {
  background: #eee7b8;
}
</style>
