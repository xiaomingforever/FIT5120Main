<template>
  <div class="home-page">
    <!-- Navbar -->
    <header class="navbar">
      <!-- <div class="logo">Brain<span>Builder</span></div> -->
      <router-link to="/Home" aria-label="Go to Today">
        <img class="logo" src="/src/assets/logo/Brainlogo.png" alt="BrainBuilder" />
      </router-link>

      <!-- hambuger button -->
      <div class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- Nav menu -->
      <div class="nav-container">
        <ul :class="['nav-links', { active: isOpen }]">
          <li><router-link to="Home">Home</router-link></li>
          <li><a href="#about">About This Project</a></li>
          <li><a href="#research">Research</a></li>
          <li><a href="#resources">Resources</a></li>
        </ul>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.home-page {
  font-family: Arial, sans-serif;
  color: #333;
  line-height: 1.6;
  background-color: #fbf6ef;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
  height: 100px;
}
.nav-container {
  display: flex;
  align-items: center;
  gap: 20px;
}
.logo {
  height: 130px;
  width: auto;
  flex: 0 0;
  margin-right: 200px;
  margin-left: 0;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 20px;
  align-items: center;
}
.nav-links li {
  display: inline-block;
}
.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 16px;
}
.nav-links a:hover {
  color: #14b8a6;
}
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}
.hamburger span {
  width: 25px;
  height: 3px;
  background: #333;
  border-radius: 2px;
}
/* small screen */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  .nav-links {
    position: absolute;
    top: 60px;
    right: 0;
    width: 200px;
    background: white;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: none;
  }
  .nav-links.active {
    display: flex;
  }
}
</style>
