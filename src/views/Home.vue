<template>
  <div class="home">
    <HeadBar />

    <!-- HERO -->
    <main class="hero">
      <section class="hero__left">
        <!--  headline -->
        <h1 class="pill pill--xl">Build your child's brains with everyday moments</h1>

        <!-- subhead -->
        <p class="pill pill--lg">Turn every minutes into mind-building fun.</p>

        <!-- pill lines to echo the reference layout -->
        <ul class="hero__list">
          <li class="pill">Personalized ideas</li>
          <li class="pill">zero stress</li>
          <li class="pill">Backed by acadamic source</li>
        </ul>

        <div class="hero__actions">
          <RouterLink class="cta" to="/today" aria-label="Go to Today">Try Brainbuilder</RouterLink>
        </div>
      </section>

      <!-- Right visual area (large translucent card like the mock) -->
      <aside class="hero__right" aria-hidden="true">
        <div class="hero__panel"></div>
      </aside>
    </main>
  </div>
</template>

<script>
import HeadBar from '@/components/HeadBar.vue'
export default {
  name: 'Home',
  components: { HeadBar },
}
</script>

<style scoped>
/* -----------------------------------------------------------
   Page wrapper
----------------------------------------------------------- */
.home {
  background: #2f5bff;
  min-height: 100vh;
}

/* -----------------------------------------------------------
   --hero-bg: url('/src/assets/hero.jpg');
   --hero-bg: url('https://example.com/your-image.jpg');
----------------------------------------------------------- */
.hero {
  --hero-bg: url('/src/assets/Background/Background1.png'); /* <-- put your background image URL here */
  position: relative;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: start;
  gap: 40px;
  min-height: clamp(560px, 84vh, 920px);
  padding: clamp(24px, 4vw, 48px);
  isolation: isolate; /* ensure overlay stacking works */
  color: #0b1b3b;
}

/* Background image layer */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--hero-bg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -2;
}

/* A subtle color overlay for better contrast on top of the photo */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(243, 249, 140, 0.65); /* matches the blue in your reference */
  z-index: -1;
}

/* -----------------------------------------------------------
   Left column: pill lines
----------------------------------------------------------- */
.hero__left {
  display: grid;
  align-content: start;
  gap: 16px;
  max-width: 760px;
}

.pill {
  display: inline-block;
  background: transparent;
  border-radius: 0;
  padding: 0;
  line-height: 1.2;
  box-shadow: none;
  border: 0;
  color: #000;
}

.pill--xl {
  font-size: clamp(20px, 3.2vw, 34px);
  font-weight: 800;
  padding: 18px 22px;
  max-width: 52ch;
  margin-bottom: 8px;
}

.pill--lg {
  font-size: clamp(16px, 2vw, 18px);
  font-weight: 600;
  max-width: 48ch;
  margin-bottom: 8px;
}

.hero__list {
  list-style: none;
  padding: 0;
  margin: 6px 0 2px 0;
  display: grid;
  gap: 12px;
}
.hero__list .pill {
  font-size: 15px;
  font-weight: 600;
  max-width: 40ch;
}

/* CTA */
.hero__actions {
  margin-top: 18px;
}
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  height: 46px;
  padding: 0 22px;
  border-radius: 14px;
  background: #ffffff;
  color: #000000;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition:
    transform 120ms ease,
    filter 120ms ease;
  text-decoration: none;
}
.cta:hover {
  filter: brightness(0.97);
  transform: translateY(-1px);
}

/* Right column: big translucent panel */
/* .hero__right {
  display: grid;
  place-items: center;
  min-height: 380px;
}
.hero__panel {
  width: min(640px, 95%);
  height: min(440px, 56vh);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 12px 40px rgba(15, 40, 160, 0.15);
  backdrop-filter: blur(2px);
} */

/* Responsive */
@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .hero__right {
    order: 2;
  }
  .hero__left {
    order: 1;
  }
  .hero__panel {
    height: 36vh;
  }
}
</style>
