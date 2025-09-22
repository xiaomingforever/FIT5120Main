<template>
  <div class="story-page">
    <HeadBar />

    <div class="back-row">
      <RouterLink class="back-btn" :to="{ path: '/Stories' }">Go back</RouterLink>
    </div>
    <!-- article container -->
    <main class="article-wrap" aria-labelledby="article-title">
      <header class="article-head">
        <h1 id="article-title" class="title">
          A Morning with Emma: How Simple Routines Shape Connection
        </h1>

        <p class="byline">
          <span class="author">By Claire Miller </span>
          <span class="divider" aria-hidden="true">|</span>
          <time class="date" datetime="2025-09-01">Semptember 1, 2025</time>
        </p>
      </header>

      <figure class="hero">
        <img class="hero-img" src="/Stories/Trending3.png" alt="Family black park outdoor kid " />
        <figcaption class="hero-cap">Photo: Family black park outdoor kid </figcaption>
      </figure>

      <article class="copy">
        <P>
          My name is Claire, and I am the mother of a three-year-old girl named Emma. Every day with
          her feels like a small adventure, but what I have learned is that the little routines
          matter the most. They are not always planned or perfect, but they shape the way we connect
          and grow together.
        </P>
        <P>
          Our mornings begin in the kitchen. While I prepare breakfast, Emma sits on a stool beside
          me. She likes to “help,” even though her help usually means spilling a little flour or
          dropping a spoon. I hand her a banana and ask her to peel it for me. She struggles, then
          beams with pride when she manages to pull the peel all the way down. “Look, Mommy, I did
          it!” she shouts. That joy is real, and I respond with a hug and tell her how proud I am.
        </P>
        <P>
          At the playground she insists on the swings. I push gently, and we count together—“one,
          two, three”—each time she swings forward. Sometimes she laughs so hard she forgets the
          numbers, and sometimes she surprises me by shouting the numbers before I can. It is a
          small game, but in her eyes it is the highlight of the morning.
        </P>
        <P>
          When we come back home, I read to her while she drinks her milk. She chooses the same book
          most days, a story about a rabbit who finds his way home. I used to think reading the same
          story again and again was boring, but now I realize Emma finds comfort in the familiar
          words. She fills in the sentences before I can finish them, smiling as if she is in on a
          secret.
        </P>
        <P>
          By the time she lies down for her nap, I feel tired, but it is a good kind of tired. I
          remind myself that these ordinary moments—peeling bananas, counting on the swings,
          repeating stories—are the ones that build her world. They are simple, yet powerful. I
          don’t need fancy toys or complicated lessons. What Emma needs most is my time, my
          attention, and my willingness to see the world with her. Every day offers a chance to
          connect, to laugh, to share a word or a hug. That is how she learns, and that is how we
          both grow.
        </P>

      </article>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.story {
  position: relative;
}
.story-page {
  --bg: #fff8ef;
  --ink: #3f2f24;
  --muted: #6a625a;
  --accent: #1c9aa6;
  --hairline: #e4ddd6;
  --rule: #d7e5ec;
  --cta: #f5821e;

  background: var(--bg);
  color: var(--ink);
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
}
:root {
  --content-max: 920px;
  --page-padding: 24px;
}

/*  back button*/
.back-row {
  background: transparent;
  top: 80px;
  position: relative;
  z-index: 30;
  width: 100%;
  margin: 0;
  padding: 0.5rem clamp(16px, 4vw, 32px) 0;
}
.back-btn {
  background: #f97316;
  border: none;
  padding: 12px 24px;
  color: white;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  font-size: 24px;
  position: fixed;
  top: 96px;
  left: max(var(--page-padding), calc((100vw - var(--content-max)) / 2 - 8px));
  z-index: 1000;
}
.back-btn:hover {
  filter: brightness(0.97);
}
.back-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #0000000f;
}
.back-link:focus-visible {
  outline: 2px solid #fff;
  box-shadow: 0 0 0 3px #f5821e59;
  text-decoration: none;
}

/* article container */
.article-wrap {
  max-width: 980px;
  margin: 0.5rem auto 2rem;
  padding: 0 1rem 1.5rem;
  background: #fff7ee;
  border: none;
}

.article-head {
  padding: 1.25rem 1.25rem 0.5rem;
}
.title {
  margin: 0;
  font-size: clamp(1.7rem, 1.2rem + 1.6vw, 2.2rem);
  line-height: 1.25;
  font-weight: 800;
}
.dek {
  margin: 0.6rem 0 0.8rem;
  color: var(--muted);
  max-width: 72ch;
}
.byline {
  margin: 0 0 0.75rem;
  color: var(--muted);
  font-weight: 600;
}
.byline .divider {
  opacity: 0.6;
  margin: 0 0.5rem;
}

/* image */
.hero {
  margin: 0 1.25rem 0.75rem;
}
.hero-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  border: 1px solid #eaeaea;
  box-shadow: 0 1px 0 #00000005;
}
.hero-cap {
  margin-top: 0.45rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.copy {
  padding: 0.75rem 1.25rem 1.25rem;
  line-height: 1.7;
  font-size: 1.3rem;
}
.copy h3 {
  font-size: 1.5rem;
  margin: 1rem 0 0.35rem;
  font-weight: 800;
}
.copy p {
  margin: 0 0 0.9rem;
}
.copy ul {
  padding-left: 1.1rem;
  margin: 0.4rem 0 1rem;
}
.copy li {
  margin: 0.25rem 0;
}
.source {
  text-align: right;
  color: var(--muted);
  margin-top: 1rem;
}
.source a {
  color: inherit;
}

/* responsive */
@media (max-width: 900px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
  .article-wrap {
    margin: 0.5rem 0.75rem 2rem;
  }
}
</style>
