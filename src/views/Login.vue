<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">Welcome to BrainBuilder</h1>
      <p class="subtitle">Enter the access password to continue</p>

      <input
        v-model="password"
        type="password"
        placeholder="Enter password"
        class="password-input"
      />

      <button @click="checkPassword" class="login-btn">Enter</button>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>

    <!-- decorative background shapes like home -->
    <span class="shape shape-yellow"></span>
    <span class="shape shape-red"></span>
    <span class="shape shape-green"></span>
    <span class="shape shape-diamond"></span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const password = ref('')
const error = ref('')
const router = useRouter()

const CORRECT_PASSWORD = 'TA34' 

function checkPassword() {
  if (password.value === CORRECT_PASSWORD) {
    localStorage.setItem('auth', 'true')
    router.push('/')
  } else {
    error.value = 'Incorrect password. Please try again.'
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  background-color: #fbf6ef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Nunito', sans-serif;
  position: relative;
  overflow: hidden;
}

.login-card {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 360px;
  z-index: 1;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #f97316;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.password-input {
  width: 90%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 1rem;
  margin-bottom: 1rem;
  outline: none;
  transition: border 0.2s ease;
}

.password-input:focus {
  border-color: #14b8a6;
}

.login-btn {
  width: 100%;
  background: #14b8a6;
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 25px;
  padding: 12px 0;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-btn:hover {
  background: #0d9488;
}

.error-msg {
  color: #ef4444;
  font-size: 0.95rem;
  margin-top: 0.8rem;
}

/* Decorative shapes*/
.shape {
  position: absolute;
  pointer-events: none;
  opacity: 1;
}

.shape-yellow {
  left: 28px;
  top: 80px;
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 22px solid #facc15;
}

.shape-red {
  right: 40px;
  top: 70px;
  width: 22px;
  height: 22px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.08);
}

.shape-green {
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 14px;
  height: 14px;
  background: #10b981;
  border-radius: 3px;
}

.shape-diamond {
  left: 42%;
  bottom: 12%;
  width: 18px;
  height: 18px;
  background: #f59e0b;
  transform: rotate(45deg);
  border-radius: 2px;
}

@media (max-width: 600px) {
  .login-card {
    width: 85%;
    padding: 2rem;
  }
  .title {
    font-size: 1.6rem;
  }
}
</style>
