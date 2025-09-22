<template>
  <div class="story-page">
    <HeadBar />

    <div class="back-row">
      <RouterLink class="back-btn" :to="{ path: '/Stories' }">Go back</RouterLink>
    </div>
    <!-- article container -->
    <main class="article-wrap" aria-labelledby="article-title">
      <header class="article-head">
        <h1 id="article-title" class="title">The crucial brain foods all children need</h1>

        <p class="byline">
          <span class="author">By Claire McCarthy, MD.</span>
          <span class="divider" aria-hidden="true">|</span>
          <time class="date" datetime="2018-01-23">January 23, 2018</time>
        </p>
      </header>

      <figure class="hero">
        <img class="hero-img" src="/Stories/Related3.png" alt="Close up parents with kid eating" />
        <figcaption class="hero-cap">Photo: Close up parents with kid eating</figcaption>
      </figure>

      <article class="copy">
        <p>
          The first 1,000 days of life are crucial for brain development — and food plays an
          important role.
        </p>
        <P>
          The ways that the brain develops during pregnancy and during the first two years of life
          are like scaffolding: they literally define how the brain will work for the rest of a
          person’s life. Nerves grow and connect and get covered with myelin, creating the systems
          that decide how a child — and the adult she becomes — thinks and feels. Those connections
          and changes affect sensory systems, learning, memory, attention, processing speed, the
          ability to control impulses and mood, and even the ability to multitask or plan.
        </P>
        <P>
          Those connections and changes cannot be undone, either. How the brain begins is how it
          stays. The environment a child lives in, and how they are loved and nurtured, is crucial
          for these connections and changes. Breastfeeding can also make a big difference, not just
          because breast milk is the perfect first food but also because of the close contact with
          the mother that is part of breastfeeding.
        </P>
        <P>
          There are also certain nutrients that are necessary for healthy brain development. These
          nutrients include:
        </P>
        <ul>
          <li>
            Protein. Protein can be found in meat, poultry, seafood, beans and peas, eggs, soy
            products, nuts and seeds, as well as dairy.
          </li>
          <li>
            Zinc. The food that has the most zinc, interestingly, is oysters — but it’s also found
            in many meats, fish, dairy products, and nuts.
          </li>
          <li>
            Iron. Meats, beans and lentils, fortified cereals and breads, dark leafy vegetables, and
            baked potatoes are among the best sources of iron.
          </li>
          <li>
            Choline. Meat, dairy, and eggs have lots of choline, but so do many vegetables and other
            foods.
          </li>
          <li>
            Folate. This nutrient, which is especially important for pregnant mothers, can be found
            in liver, spinach, fortified cereals and breads, as well as other foods.
          </li>
          <li>
            Iodine. Seaweed is a great source of iodine, but we also get it from iodized salt,
            seafood, dairy products, and enriched grains.
          </li>
          <li>
            Vitamin A. Along with liver, carrots, sweet potato, and spinach are good sources of this
            vitamin.
          </li>
          <li>
            Vitamin D. This is the “sunshine vitamin,” and the best way to get it is to get outside.
            The flesh of fatty fishes such as salmon have it, as does fish liver oil, and products
            fortified with it, such as fortified milk.
          </li>
          <li>
            Vitamin B6. The best sources of vitamin B6 are liver and other organ meats, fish,
            potatoes and other starchy vegetables, and fruit (not citrus).
          </li>
          <li>
            Vitamin B12. Vitamin B12 is naturally found in animal products, such as meat, fish,
            eggs, and dairy.
          </li>
          <li>
            Long-chain polyunsaturated fatty acids. An example is omega-3 fatty acids. These are
            most easily found in fatty fish and fish oils, but can be found in some other oils, and
            many foods are also fortified with them.
          </li>
        </ul>
        <P>
          For some pregnant women and children, getting all of these nutrients can be a challenge.
          Families who are vegetarian, especially those who are vegan, may find it particularly
          challenging. Meeting with a nutritionist may be helpful. Many families have limited,
          starch-heavy diets without much in the way of vegetables or fish. Pregnant women and small
          children in those families may also have trouble getting all the brain nutrients they
          need.
        </P>
        <p>
          For many families, it’s not that they choose not to eat these foods — it’s that they can’t
          afford them. Meats, fish, and fresh vegetables can be expensive. That’s why the American
          Academy of Pediatrics released a policy statement entitled “Advocacy for Improving
          Nutrition in the First 1,000 Days to Support Childhood Development and Adult Health.”
        </p>
        <P>
          There are many government-funded programs, such as the Special Supplemental Nutrition
          Program for Women, Infants, and Children (also known as WIC), the Supplemental Nutrition
          Assistance Program (or SNAP, formerly “food stamps”), or the Child and Adult Care Food
          Program, that help low-income families get the food they need to be healthy, and support
          breastfeeding. It’s important that these programs continue and be funded to meet the need.
          While community-based food pantries and soup kitchens are important, they can’t always
          provide all the nutritious food pregnant women and children need, let alone provide as
          much or as often as it is needed.As a country and as a world, we need to work together to
          be sure that every child gets the best start possible.
        </P>

        <p class="source">
          Source:
          <a
            href=" https://www.parents.com/baby-brain-development-foods-5287059"
            target="_blank"
            rel="noopener"
            >https://www.parents.com/baby-brain-development-foods-5287059</a
          >
        </p>
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
  font-size: 1.1rem;
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
