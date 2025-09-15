
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
          The Most Important Nutrients for Your Baby’s Brain, According to Doctors
        </h1>

        <p class="dek">
          Your child’s nutrition in the first two years is absolutely critical for both brain
          development and future health. Here's what they need.
        </p>

        <p class="byline">
          <span class="author">By Sally Kuzemchak, M.S., R.D.</span>
          <span class="divider" aria-hidden="true">|</span>
          <time class="date" datetime="2022-05-11">May 11, 2022</time>
        </p>
      </header>

      <figure class="hero">
        <img
          class="hero-img"
          src="/Stories/Hero.png"
          alt="Close up parents with kid eating"
        />
        <figcaption class="hero-cap">Photo: Close up parents with kid eating</figcaption>
      </figure>

      <article class="copy">
        <p>
          The first two years of life represent an extraordinary period of growth, and the nutrients your baby receives during this time—along with those during pregnancy—lay the foundation for both body and brain. Pediatric specialists emphasize that missing key nutrients early on can lead to long-lasting effects that are not easily corrected later. Among the most critical for brain development are iron, zinc, copper, choline, and vitamin D.
          Nutrition in early childhood doesn't only influence how the brain develops—it also sets the stage for health far into adulthood. The brain regions responsible for memory, learning, attention, and problem-solving are rapidly forming during this period. Without enough essential nutrients, children may face reduced cognitive function, behavior challenges, and learning difficulties. Studies have linked poor nutrition in these years with lower school performance and even higher risks of chronic illness later in life.

        </p>
        <p>
          Everyday Foods that Support Brain Development
            "Paying attention to what children eat in the first years truly changes their health trajectory,” says pediatrician Dr. Sarah Jane Roberts of the University of Minnesota. She explains that even babies in food-secure homes may still miss vital nutrients. For instance, breastfed infants after six months often require additional sources of zinc, iron, and vitamin D since breast milk alone may not be enough. Introducing solid foods rich in these nutrients is essential.

        </p>

        <h3>Everyday Foods that Support Brain Development</h3>
        <p>Here are some nutrient-rich foods that experts recommend for infants and toddlers:</p>
        <ul>
          <li>Protein: eggs, poultry, beans, fish, yogurt</li>
          <li>Zinc: beef, pork, tofu, milk, peanut butter</li>
          <li>Iron: chicken, fortified cereals, spinach, lentils</li>
        </ul>

        <h3>Expert Tips for Parents</h3>
        <ul>
          <li>During pregnancy, take prenatal supplements as directed.</li>
          <li>When introducing solids, start with iron- and zinc-rich foods.</li>
        </ul>
        <p class="source">
          Source: <a href=" https://www.parents.com/baby-brain-development-foods-5287059" target="_blank" rel="noopener">https://www.parents.com/baby-brain-development-foods-5287059</a>
        </p>
      </article>
    </main>

    <!-- related Articles-->
    <section class="related" aria-labelledby="related-heading">
      <h2 id="related-heading" class="related-title">Related Articles</h2>

      <div class="related-grid">

        <article class="r-card">
          <div class="r-media">
            <img src="/Stories/Related1.png" alt="6 Important Nutrients for Kids: An Age-by-Age Guide" />
          </div>
          <div class="r-label">
            <h3 class="r-h">6 Important Nutrients for Kids: An Age-by-Age Guide</h3>
            <p class="r-by">By Rachel Melrose Warren, M.S., R.D.</p>
          </div>
        </article>

        <article class="r-card">
          <div class="r-media">
            <img src="/Stories/Related2.png" alt="Baby brain food: 7 foods to fuel brain development" />
          </div>
          <div class="r-label">
            <h3 class="r-h">Baby brain food: 7 foods to fuel brain development</h3>
            <p class="r-by">By webhealth</p>
          </div>
        </article>

        <article class="r-card">
          <div class="r-media">
            <img src="/Stories/Related3.png" alt="The crucial brain foods all children need" />
          </div>
          <div class="r-label">
            <h3 class="r-h">The crucial brain foods all children need</h3>
            <p class="r-by">By Claire MacArthur, MD</p>
          </div>
        </article>
      </div>
    </section>

    <!-- footer -->
    <footer class="proto-footer" aria-label="Site footer">
      <nav class="footer-links" aria-label="Footer">
        <a href="#">Behind the Research</a>
        <a href="#">Terms of Uses</a>
        <a href="#">Privacy Policy</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav>
      <p class="footer-copy">
        BrainBuilder is a social-good, non-profit project. It is free for education,
        with no ads, no sales, and no tracking beyond what is needed to run the site.
      </p>
      <p class="copyright">© 2025 BrainBuilder. A student-led project for social good.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
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
}
.back-btn:hover { filter: brightness(0.97); }
.back-btn:active { transform: translateY(1px); box-shadow: 0 1px 0 #0000000f; }
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
  font-size: 1rem;
}
.copy h3 {
  font-size: 1.1rem;
  margin: 1rem 0 0.35rem;
  font-weight: 800;
}
.copy p { margin: 0 0 0.9rem; }
.copy ul {
  padding-left: 1.1rem;
  margin: 0.4rem 0 1rem;
}
.copy li { margin: 0.25rem 0; }
.source {
  text-align: right;
  color: var(--muted);
  margin-top: 1rem;
}
.source a { color: inherit; }

/* related articles */
.related {
  max-width: 1160px;
  margin: 1.25rem auto 2.25rem;
  padding: 0 1rem;
}
.related-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 1rem;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.r-card { position: relative; padding-bottom: 5.25rem}
.r-media {
  aspect-ratio: 4/3;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f1f1;
  border: 1px solid #eee;
}
.r-media img { display: block; width: 100%; height: 100%; object-fit: cover; }


.r-label {
  position: absolute;
  left: var(--inset);
  right: var(--inset);
  bottom: -18px;
  margin: 0;
  min-height: 3.75rem;
}
.r-h {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  line-height: 1.3;
  font-weight: 800;
}
.r-by {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.proto-footer {
  text-align: center;
  border-top: 1px solid var(--hairline);
  padding: 1.75rem 1rem 2rem;
  color: var(--muted);
}
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: center;
  margin-bottom: 1rem;
}
.footer-links a { color: var(--muted); text-decoration: none; }
.footer-links a:hover { text-decoration: underline; }
.footer-copy { max-width: 70ch; margin: 0.5rem auto 0; }
.copyright { margin: 0.25rem 0 0; }

/* responsive */
@media (max-width: 900px) {
  .related-grid { grid-template-columns: 1fr; }
  .article-wrap { margin: 0.5rem 0.75rem 2rem; }
}
</style>
