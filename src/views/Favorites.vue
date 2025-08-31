<script setup lang="ts">
const total = 1
const countLabel = `${total} ${total === 1 ? 'Practice' : 'Practices'}`
</script>

<template>
  <div class="page-wrap">
    <!-- HERO CARD -->
    <section class="fav-hero">
      <div class="fav-hero_inner">
        <div class="fav-hero_copy">
          <h1 class="fav-hero_title">Your Favorites</h1>
          <p class="fav-hero_sub">(come up with a better desc)</p>
          <span class="fav-hero_pill">{{ countLabel }}</span>
        </div>
        <img
          class="fav-hero_art"
          src="/src/assets/favorite page/favorite page.png"
          alt="brainhearticon"
          aria-hidden="true"
        />
      </div>
    </section>

    <section class="cards">
      <!--  existing favorites list/cards -->
    </section>
  </div>
</template>

<style scoped>
.page-wrap {
  padding: 0 12px 40px;
}
.fav-hero {
  width: min(1100px, 92vw);
  margin: 16px auto 26px;
}
.fav-hero_inner {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  padding: 28px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 16px;
}
.fav-hero_title {
  font-size: clamp(28px, 3vw, 48px);
  line-height: 1.05;
  margin: 0 0 8px;
}
.fav-hero_sub {
  margin: 0 0 16px;
  font-size: 1.125rem;
  color: #1f1f1fb3;
}
.fav-hero_pill {
  display: inline-block;
  padding: 8px 14px;
  background: #fbf6d9;
  border: 1px solid #e7e1b6;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
}
.fav-hero_art {
  width: 220px;
  height: auto;
  justify-self: end;
  object-fit: contain;
}

/* responsive */
@media (max-width: 820px) {
  .fav-hero_inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .fav-hero_art {
    justify-self: center;
    width: 180px;
  }
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  width: min(960px, 88vw);
  margin: 0 auto;
}
</style>
