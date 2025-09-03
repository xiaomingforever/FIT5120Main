<template>
  <div class="home">
    <HeadBar />

    <main class="hero">
      <section class="hero__content">
        <h1>Build your child's brains with everyday moments</h1>
        <p>description work in progress</p>
        <div class="hero__actions">
          <RouterLink class="cta" to="/today" aria-label="Go to Today">Go to Today</RouterLink>
        </div>
      </section>

      <aside class="hero__art" aria-hidden="true">
        <!--  decorative blob -->
        <svg viewBox="0 0 300 300" width="100%" height="100%" role="img">
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stop-color="#c9efe4" />
              <stop offset="1" stop-color="#f1edcd" />
            </linearGradient>
          </defs>
          <path
            fill="url(#g)"
            d="M234 60c28 26 45 67 34 103-12 36-52 68-96 79-44 12-93 3-116-25-23-28-20-74 1-105 22-31 60-45 98-53 37-8 72-25 79 1z"
          />
        </svg>
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
.home {
  background: #efe9c8;
  min-height: 100vh;
}
.hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  padding: 48px 24px;
  max-width: 1100px;
  margin: 0 auto;
}
.hero__content {
  background: #ffffff;
  border: 1px solid #e9e6d4;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 8px 24px rgba(17, 122, 122, 0.08);
}
h1 {
  margin: 0 0 12px;
  font-size: 36px;
  line-height: 1.15;
  color: #0c5151;
}
p {
  margin: 0 0 20px;
  color: #334;
  font-size: 16px;
}
.hero__actions {
  display: flex;
  gap: 12px;
}
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: #117a7a;
  color: #fff;
  font-weight: 700;
  border: 1px solid transparent;
}
.cta:hover {
  filter: brightness(0.98);
}

.hero__art {
  align-self: center;
  background: #ffffff;
  border: 1px solid #e9e6d4;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(17, 122, 122, 0.08);
}
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero__art {
    order: -1;
  }
}
</style>
