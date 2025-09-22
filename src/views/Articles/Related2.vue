<template>
  <div class="story-page">
    <HeadBar />

    <div class="back-row">
      <RouterLink class="back-btn" :to="{ path: '/Stories' }">Go back</RouterLink>
    </div>
    <!-- article container -->
    <main class="article-wrap" aria-labelledby="article-title">
      <header class="article-head">
        <h1 id="article-title" class="title">Baby brain food: 7 foods to fuel brain development</h1>

        <p class="byline">
          <span class="author">By uclahealth</span>
          <span class="divider" aria-hidden="true">|</span>
          <time class="date" datetime="2022-05-05">May 5, 2022 </time>
        </p>
      </header>

      <figure class="hero">
        <img class="hero-img" src="/Stories/Related2.png" alt="Close up parents with kid eating" />
        <figcaption class="hero-cap">Photo: Close up parents with kid eating</figcaption>
      </figure>

      <article class="copy">
        <p>
          If you’ve ever spent time with a toddler, you probably know they learn quickly and absorb
          new information like a sponge. But brain development begins long before a child can walk
          and talk. Brain cells multiply at an astonishing rate as a baby develops in the womb. The
          brain continues to grow during infancy as motor functions such as balance and coordination
          develop. During the toddler years (ages 1 to 3), the brain increases cognitive ability —
          how quickly a child can interpret and relay information to perform complex tasks. During
          these periods of peak growth, nutrition plays an important role. For toddlers, not getting
          the right nutrients can have a detrimental impact on cognitive development — affecting
          memory, attention and academic ability later in life.
        </p>
        <h2>Key nutrients for baby brain development</h2>
        <P>
          While all nutrients are important for brain growth and functioning, some play a bigger
          role in early brain development than others. The American Academy of Pediatrics Committee
          on Nutrition recommends certain nutrients for healthy brain development in toddlers:
        </P>
        <ul>
          <li>Choline</li>
          <li>Folate</li>
          <li>Iodine</li>
          <li>Iron</li>
          <li>Long-chain polyunsaturated fatty acids, such as omega-3 fatty acids</li>
          <li>Protein</li>
          <li>Vitamins A, D, B6 and B12</li>
          <li>Zinc</li>
        </ul>
        <h2>Best foods for baby and toddler brain development</h2>
        <P>
          No one food or “superfood” can ensure optimal brain development for toddlers. But some
          foods are packed with a variety of the necessary nutrients. Just be sure to monitor all
          new foods to ensure there’s no potential allergy.
        </P>
        <h2>1. Eggs</h2>
        <P>
          Eggs are nutritious and typically a crowd-pleaser for young children. Brain-boosting
          nutrients in eggs include choline, vitamin B12 and protein. Choline is especially
          important for normal brain development and can improve cognitive functioning. Two whole
          eggs a day provide the choline that children age 8 and younger need.
        </P>
        <h2>2. Seafood</h2>
        <P>
          Oily fish and other seafood provide a lot of bang for the buck when it comes to brain
          development —protein, zinc, iron, choline, iodine and omega-3 fats. But avoid feeding your
          toddler seafood that is high in mercury such as tuna and swordfish. Too much mercury can
          have harmful effects on a child’s developing nervous system. Instead, opt for low-mercury
          options such as shrimp, salmon, tilapia, crab or cod. Children under age 3 can have a
          1-ounce serving two to three times a week.
        </P>
        <h2>3. Leafy green vegetables</h2>
        <P>
          There’s a reason that parents try to hide extra leafy greens, such as spinach and kale, in
          their children’s smoothies and pasta sauce: They’re a great source of iron and folate.
          Research shows that children who get enough folate tend to have better cognition than kids
          who don’t get enough. Iron plays an important role in the development of the hippocampus —
          the part of the brain responsible for learning and memory.
        </P>
        <h2>4. Lean beef (or meat alternative)</h2>
        <P>
          Lean beef qualifies as brain food because it is an excellent source of zinc and iron. Iron
          is especially vital for young children because they are more likely to experience anemia
          (low iron levels). Nearly one in 10 American children age 3 and younger has an iron
          deficiency, which can contribute to learning difficulties and attention deficit
          hyperactivity disorder (ADHD). Black bean or soy burgers work as great iron-containing
          burger substitutes.
        </P>
        <h2>5. Yogurt</h2>
        <P>
          Unsweetened yogurt is an easy, kid-friendly way to support brain growth. It contains
          nutrients such as protein, zinc, choline and iodine. Children need iodine to produce
          thyroid hormones, which are vital to brain development and neurological processes. Even
          mild iodine deficiency may affect a child’s overall cognitive function and ability to
          reason.
        </P>
        <h2>6. Nuts & seeds</h2>
        <P>
          Food such as nuts, seeds and nut butters make a protein- and zinc-packed snack. Protein
          contributes to healthy brain growth and the development of long-term memory. Zinc also
          plays an important role during the toddler years, when the brain is growing rapidly.
          Insufficient amounts of zinc may affect your child’s cognitive development, impairing
          their memory and ability to learn. Whole nuts and seeds can be a choking hazard, so try
          adding water to small amounts of peanut butter, or giving peanut-flavored “puff” snacks
          instead. Just make sure to choose puffs made from real peanuts with no artificial
          flavoring.
        </P>
        <h2>7. Beans</h2>
        <P>
          Beans offer several beneficial nutrients for a developing brain including zinc, protein, iron, folate and choline. Some types of beans, such as kidney, pinto and soybeans, also contain high amounts of omega-3 fatty acids. For vegetarian children, the iron and protein in beans make them an excellent substitute for meat.
        </P>
        <p class="source">
          Source:
          <a
            href="https://www.uclahealth.org/news/article/baby-brain-food-7-foods-to-fuel-brain-development"
            target="_blank"
            rel="noopener"
            >https://www.uclahealth.org/news/article/baby-brain-food-7-foods-to-fuel-brain-development</a
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
