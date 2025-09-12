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
        <ul :class="['nav-links', { 'active': isOpen }]">
          <li><router-link to="/"><font-awesome-icon icon="house" style="color: yellowgreen;"/>Home</router-link></li>
          <router-link to="/today" class="btn">
            <font-awesome-icon icon="lightbulb" style="color: orange;"/> Today's Tips
          </router-link>
          <router-link to="/activities" class="btn">
            <font-awesome-icon icon="clipboard-list" style="color: green;"/> All Activities
          </router-link>
          <router-link to="/favorites" class="btn">
            <font-awesome-icon icon="star" style="color: palevioletred;"/> Favorite Tips
          </router-link>
          <router-link to="/progress" class="btn">
            <font-awesome-icon icon="chart-line" style="color: skyblue;"/> Activity Progress
          </router-link>
          <!-- Dropdown -->
          <li class="dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
            <a href="#"><font-awesome-icon icon="book" style="color: brown;"/> Why Brain Builder ▾</a>
            <ul v-if="showDropdown" class="dropdown-menu">
              <li><router-link to="/research">Research</router-link></li>
              <li><router-link to="/resources">Resources</router-link></li>
            </ul>
          </li>
        </ul>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDropdown = ref(false)

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
  padding: 0 2rem;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  z-index: 50;
  height: 80px;
  width: 100%;
  box-sizing: border-box;
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
  margin-top: 10px;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 22px;
  align-items: center;
}
.nav-links li {
  display: inline-block;
}
.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 20px;
}
.nav-links a:hover {
  color: #14b8a6;
}
.dropdown {
  position: relative;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  list-style: none;
  padding: 0.5rem 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.dropdown-menu li {
  padding: 0.5rem 1rem;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
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
.router-link-exact-active {
  background-color: #e0eff7; 
  border-radius: 6px;       
  padding: 6px 10px;        
  color: #14b8a6 !important; 
  font-weight: bold;
}
</style>
