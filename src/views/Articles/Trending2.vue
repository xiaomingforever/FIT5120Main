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
          Study Shows Video Games Can Offer Benefits to Kids’ Brains
        </h1>

        <p class="dek">
          According to a new study, kids who played at least three hours of video games per day
          performed better on cognitive tests.
        </p>

        <p class="byline">
          <span class="author">By Beth Ann Mayer</span>
          <span class="divider" aria-hidden="true">|</span>
          <time class="date" datetime="2022-10-27">October 27, 2022</time>
        </p>
      </header>

      <figure class="hero">
        <img class="hero-img" src="/Stories/Trending2.png" alt="Close up parents with kid eating" />
        <figcaption class="hero-cap">Photo: Close up parents with kid eating</figcaption>
      </figure>

      <article class="copy">
        <P>
          It turns out that playing video games could boost cognitive performance, according to a
          new study published on JAMA Network Open. Researchers found that children who played video
          games for three or more hours per day had higher scores on cognitive skills tests and more
          impulse control than those who do not game. The American Academy of Pediatrics (AAP)
          recommends limiting video gaming to 1 to 2 hours per day for older children.
        </P>
        <P>
          The study was based on data pulled from the Adolescent Brain Cognitive Development (ABCD)
          Study, an ongoing, largest-of-its-kind research project on child development and brain
          health. The ABCD study involves 12,000 children, but the University of Vermont, Burlington
          researchers narrowed the participant pool to more than 2,200 children ages 9 and 10. The
          authors divided the children into two groups: Those who self-reported playing video games
          for more than three hours daily and those who said they never gamed. The children took
          tests to measure impulse control and short-term memory and underwent brain imaging.
        </P>
        <P>
          Researchers evaluated the tests and found that children who gamed for at least three hours
          per day completed cognitive tasks faster and more accurately than those who did not play.
          An MRI analysis showed that the kids playing video games had more brain activity in the
          regions linked to attention and memory. They also had less activity in brain regions
          related to vision. Other, similarly-designed studies had smaller data sets of about 80.
        </P>
        <P>
          So, does this mean video games make kids smarter? Not so fast. "While we cannot say
          whether playing video games regularly caused superior neurocognitive performance, it is an
          encouraging finding, and one that we must continue to investigate in these children as
          they transition into adolescence and young adulthood," said Bader Chaarani, Ph.D., an
          assistant professor of psychiatry at the University of Vermont and the lead author on the
          study, in the release. What's more, it may provide some comfort to parents whose kids love
          gaming.
        </P>
        <P>
          "Many parents today are concerned about the effects of video games on their children's
          health and development, and as these games continue to proliferate among young people, it
          is crucial that we better understand both the positive and negative impact that such games
          may have." The researchers did not specify the type of video games, though Chaarani says
          most participants played adventure games and not slower-paced puzzle ones. Ultimately, a
          family's approach to screen time is individual and can be catered to the child. Just like
          Cocomelon may be too stimulating for some kids and fine for others, video gaming will
          likely affect older kids differently. Monitor your child's behavior, mood, and academic
          performance, and work with them to set any necessary limits.
        </P>
        <p class="source">
          Source:
          <a
            href="https://www.parents.com/study-shows-video-games-can-offer-benefits-to-kids-brains-6822498"
            target="_blank"
            rel="noopener"
            >https://www.parents.com/study-shows-video-games-can-offer-benefits-to-kids-brains-6822498</a
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
