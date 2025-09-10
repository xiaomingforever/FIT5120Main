<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h2 class="title">Have you already selected your child's age and gender?</h2>
      <div class="actions">
        <button class="btn yes-btn" @click="$emit('confirm')">Yes</button>
        <button class="btn no-btn" @click="$emit('cancel')">No</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-card {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.yes-btn {
  background: #4caf50;
  color: white;
}

.yes-btn:hover {
  background: #43a047;
}

.no-btn {
  background: #f44336;
  color: white;
}

.no-btn:hover {
  background: #e53935;
}
</style>
