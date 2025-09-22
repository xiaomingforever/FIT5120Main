<template>
  <div class="story-page">
    <HeadBar />

    <div class="back-row">
      <RouterLink class="back-btn" :to="{ path: '/Stories' }">Go back</RouterLink>
    </div>
    <!-- article container -->
    <main class="article-wrap" aria-labelledby="article-title">
      <header class="article-head">
        <h1 id="article-title" class="title">7 Brain-Boosting Foods for Children</h1>

        <p class="dek">
          Eating the right foods can contribute to your child's brain development and improve their
          overall health.
        </p>

        <p class="byline">
          <span class="author">By Jenette Yee Mei En</span>
          <span class="divider" aria-hidden="true">|</span>
          <time class="date" datetime="2022-05-11">January 28, 2021</time>
        </p>
      </header>

      <figure class="hero">
        <img class="hero-img" src="/Stories/Related4.png" alt="Close up parents with kid eating" />
        <figcaption class="hero-cap">Photo: Close up parents with kid eating</figcaption>
      </figure>

      <article class="copy">
        <p>
          The evidence of eating specific foods in order to increase brain function is inconclusive.
          However, there are some specific nutrients that help to support a child's brain
          development. Read on to find out what they are, and how you can include them into their
          diets.
        </p>
        <h2>Oily fish</h2>
        <P>
          Fish rich in omega-3 fatty acids such as DHA and EPA are essential foods for healthy brain
          growth and function. Around 60% of the brain is fat, so your body uses omega-3 fatty acids
          to assist in neurological development, and protect the brain from memory loss and
          declining memory function. Research has shown that people who consume a diet rich in these
          fatty acids might have sharper memories and do better in mental skills tests. Salmon,
          trout, mackerel, herring and sardines are all good options.
        </P>
        <h2>Eggs</h2>
        <P>
          Eggs are packed with vitamins and other nutrients that aid brain health. Choline, found in
          egg yolks, is a key component of cell membranes that the body uses to create important
          neurotransmitters and cell membrane signalling. It has been shown to play a significant
          role in the brain development of a foetus or infant. Studies have shown that choline
          improves mental function and memory development. Eggs are also a great source of protein,
          and help keep your child satiated for a longer period of time.
        </P>
        <h2>Lean meat</h2>
        <P>
          Iron in meat protein helps to supply oxygen to the brain, and iron deficiency is sometimes
          associated with cognitive development and attention deficit. Lean meat such as chicken and
          turkey as well as seafood such as tuna and shellfish are good sources of iron. For
          vegetarians, dark green leafy vegetables like spinach and broccoli as well as beans,
          lentils and legumes like chickpeas also provide your child with plenty of iron. Consuming
          iron together with vitamin C will help them to be absorbed efficiently. Lean meats are
          also rich sources of zinc, which helps to regulate communications between nerve cells in
          the brain.
        </P>
        <h2>Nuts and seeds</h2>
        <P>
          Nuts and seeds are an easy addition to your child's diet, and can have a positive effect
          on brain and heart health. They are high in protein, essential fatty acids, iron and zinc.
          They also contain vitamin E, which may improve cognition function and prevent damage
          caused by free radicals that can cause mental decline. Walnuts, in particular, contain
          omega-3 fatty acids that help to promote good brain health. The antioxidants in seeds can
          also help to maintain a healthy brain. Pumpkin seeds contain magnesium (which is essential
          for learning), zinc and copper (which assist in nerve signalling), and iron, of which a
          deficiency can cause impaired brain function. Eating a variety of nuts and seeds means
          your children can reap the various benefits of the different nutrients they contain.
        </P>
        <h2>Fruits</h2>
        <P>
          Fruits especially berries are rich sources of antioxidants. Berries contain anthocyanins
          and other flavonoids, which have been shown to have anti-inflammatory and antioxidant
          properties. Oxidative stress and inflammation can cause adverse effects on neurological
          processes. Eating a diet rich in antioxidant foods can therefore help combat mental
          decline. Fruits that are high in vitamin C, such as oranges, kiwi fruit, guava,
          strawberries and papaya can be a great choice for keeping your kid's brain healthy and
          alert. Studies show that vitamin C in fruits has the potential to protect against mental
          decline and support brain health. It is also another antioxidant that prevents damage
          caused by free radicals, and keep brain cells strong. Vitamin C also has a number of
          non-antioxidant functions. Serving as an enzyme co-factor, a non-protein chemical that
          assists with a biological chemical reaction, it helps facilitate the production of
          neurotransmitters in the brain to aid mental alertness, concentration and memory.
        </P>
        <h2>Vegetables</h2>
        <p>
          Brightly-coloured veggies such as tomatoes, carrots, pumpkins, sweet potatoes and dark
          leafy greens and cruciferous vegetables such as broccoli and cabbage are rich in
          antioxidants. They protect our body and brain against free radical damage. Leafy greens
          like spinach are great sources of folate, which is necessary for cell repair and
          maintenance as well as the development of DNA. Vegetables are also an essential part of an
          overall balanced diet, so make sure your children are getting adequate vegetables each
          day.
        </p>
        <h2>Whole grains and oats</h2>
        <P>
          Oats and whole grains are excellent sources of fibre, and keep kids feeling full and
          energised for longer. They help to regulate the release of glucose into the blood,
          preventing any spikes in blood sugar levels that inevitably result in crashes in energy
          and concentration. Whole grains and oats are also good sources of nutrients including
          vitamin E and B, potassium and zinc, to help your kid's brain work at full capacity.
        </P>
        <P>
          The best way to set your children up for success is to offer a balanced, varied diet.
          Including some of these foods will certainly help with getting through stressful exams or
          tests, but it's also helpful to avoid certain foods that can be detrimental to brain
          health. Anything processed and high in sugar or trans fats can impair memory,
          concentration and focus, so it's best to keep sugary snacks and fast food to a minimum.
          Prepare foods that will provide slow-release energy, including lean meats, fresh fruit,
          vegetable and whole grains. These foods will benefit your child's brain and overall
          health, and help them get through their daily activities with ease.
        </P>

        <p class="source">
          Source:
          <a
            href="https://www.mountelizabeth.com.sg/health-plus/article/brain-foods-kids"
            target="_blank"
            rel="noopener"
            >https://www.mountelizabeth.com.sg/health-plus/article/brain-foods-kids</a
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
  --content-max: 920px; /* match your article/container width */
  --page-padding: 24px; /* outer page padding */
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
  font-size: 1rem;
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
