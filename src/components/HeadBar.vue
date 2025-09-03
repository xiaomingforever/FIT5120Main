<template>
  <header class="headbar">
    <div class="brand" @click="$router.push('/')">
      <img class="logo" src="/src/assets/logo/Brainlogo.png" alt="BrainBuilder" />
    </div>

    <nav class="nav">
      <!-- The only live action today -->
      <RouterLink class="btn primary" to="/today" aria-label="Go to Today"> Today </RouterLink>

      <!-- Reserved for future features -->
      <button class="btn ghost" disabled aria-disabled="true" title="Coming soon">
        Features 2
      </button>
      <button class="btn ghost" disabled aria-disabled="true" title="Coming soon">
        Features 3
      </button>
      <button class="btn ghost" disabled aria-disabled="true" title="Coming soon">
        Features 4
      </button>
    </nav>
  </header>
</template>

<script>
export default { name: 'HeadBar' }
</script>

<style scoped>
.headbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e9e9e9;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.logo {
  height: 130px;
  width: auto;
  flex: 0 0;
  margin-right: 200px;
  margin-left: 0;
}
.name {
  font-weight: 700;
  letter-spacing: 0.2px;
  color: #117a7a;
}
.nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid transparent;
  transition: transform 0.05s ease;
}
.btn:active {
  transform: translateY(1px);
}

/* live primary button to Today */
.primary {
  background: #117a7a;
  color: white;
}
.primary:hover {
  filter: brightness(0.98);
}

/* reserved placeholders */
.ghost {
  background: #ffffff;
  color: #9aa4ad;
  border-color: #e3e6ea;
  cursor: not-allowed;
  opacity: 0.65;
}
@media (max-width: 640px) {
  .name {
    display: none;
  }
}
</style>
