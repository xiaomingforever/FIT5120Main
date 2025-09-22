<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/Footer.vue'
const router = useRouter()

type Story = {
  id: number
  title: string
  excerpt?: string
  author: string
  image?: string
}

const leadStory: Story = reactive({
  id: 1,
  title: "The Most Important Nutrients for Your Baby's Brain, According to Doctors",
  excerpt:
    "Your child's nutrition in the first two years is absolutely critical for both brain development and future health. Here's what they need. ",
  author: 'Sally Kuzemchak, M.S., R.D',
  image: '/Stories/Hero.png',
})

type RelatedStory = {
  id: number
  title: string
  author: string
  image?: string
}

const related: RelatedStory[] = reactive([
  {
    id: 2,
    title: '6 Key Nutrients Kids Need: A Guide by Age',
    author: 'Rachel Meltzer Warren, M.S., R.D. ',
    image: '/Stories/Related1.png',
  },
  {
    id: 3,
    title: 'Baby brain food: 7 foods to fuel brain development',
    author: 'uclahealth',
    image: '/Stories/Related2.png',
  },
  {
    id: 4,
    title: 'The crucial brain foods all children need',
    author: 'Claire McCarthy, MD.',
    image: '/Stories/Related3.png',
  },
  {
    id: 5,
    title: '7 Brain-Boosting Foods for Children',
    author: 'Jenette Yee Mei En',
    image: '/Stories/Related4.png',
  },
])

const trending: Story[] = reactive([
  {
    id: 6,
    title: '24 Brain Breaks for Kids To Try at Home',
    author: ' Catherine Holecko',
    image: '/Stories/Trending1.png',
  },
  {
    id: 7,
    title: "Study Shows Video Games Can Offer Benefits to Kids' Brains",
    author: 'Beth Ann Mayer',
    image: '/Stories/Trending2.png',
  },
  {
    id: 8,
    title: 'A Morning with Emma: How Simple Routines Shape Connection',
    author: 'Claire Miller',
    image: '/Stories/Trending3.png',
  },
])

function openRelated(r: RelatedStory) {
  const routeById: Record<number, string> = {
    2: 'Related1',
    3: 'Related2',
    4: 'Related3',
    5: 'Related4',
  }
  const name = routeById[r.id]
  if (name) {
    router.push({ name })
  } else {
    console.warn(`No route mapped for related id ${r.id}`)
  }
}
function openTrending(t: Story) {
  const routeById: Record<number, string> = {
    6: 'Trending1',
    7: 'Trending2',
    8: 'Trending3',
  }

  const name = routeById[t.id]
  if (name) {
    router.push({ name })
  } else {
    console.warn(`No route mapped for trending id ${t.id}`)
  }
}
</script>

<template>
  <div class="stories-page">
    <HeadBar />

    <!-- stats bar  -->
    <section class="stats-bar" aria-label="Site statistics">
      <div class="stat">
        <div class="stat-number">99</div>
        <div class="stat-label">Years of Fact-Based Parenting Advice</div>
      </div>
      <div class="stat">
        <div class="stat-number">9MM</div>
        <div class="stat-label">Social Followers</div>
      </div>
      <div class="stat">
        <div class="stat-number">90MM</div>
        <div class="stat-label">Families Supported Annually</div>
      </div>
    </section>

    <!-- 2-column layout -->
    <section class="lead-section" aria-labelledby="lead-heading">
      <div class="lead-grid">
        <div class="lead-main">
          <figure class="lead-media">
            <img
              v-if="leadStory.image"
              :src="leadStory.image"
              :alt="leadStory.title"
              class="lead-img"
            />
            <div v-else class="media-ph"><span>image</span></div>
          </figure>
          <h1 id="lead-heading" class="lead-title">
            <RouterLink
              class="lead-title-link"
              :to="{ name: 'Story1', params: { id: leadStory.id } }"
            >
              {{ leadStory.title }}
            </RouterLink>
          </h1>
          <p class="lead-dek">{{ leadStory.excerpt }}</p>
          <p class="lead-byline">By {{ leadStory.author }}</p>
        </div>

        <!-- right: related list -->
        <aside class="related-panel" aria-labelledby="related-heading">
          <h2 id="related-heading" class="related-heading">Related</h2>
          <ul class="related-list">
            <li v-for="r in related" :key="r.id" class="related-item">
              <div class="thumb">
                <img v-if="r.image" :src="r.image" :alt="r.title" />
                <div v-else class="thumb-ph" aria-hidden="true"></div>
              </div>
              <div class="r-copy">
                <button type="button" class="r-title" @click="openRelated(r)">{{ r.title }}</button>
                <div class="r-author">By {{ r.author }}</div>
              </div>
            </li>
          </ul>
          <hr class="related-rule" />
        </aside>
      </div>
    </section>

    <!-- trending -->
    <section class="trending" aria-labelledby="trending-heading">
      <h2 id="trending-heading" class="section-title"><span>Top Trending</span></h2>
      <div class="trending-grid">
        <article v-for="t in trending" :key="t.id" class="t-card">
          <div class="t-media">
            <img v-if="t.image" :src="t.image" :alt="t.title" />
            <div v-else class="t-ph" aria-hidden="true"></div>
          </div>
          <h3 class="t-title">
            <button class="r-title" type="button" @click="openTrending(t)">
              {{ t.title }}
            </button>
          </h3>
          <p class="t-byline">By {{ t.author }}</p>
        </article>
      </div>
    </section>

    <!-- footer  -->
    <Footer />
  </div>
</template>

<style scoped>
.stories-page {
  --bg: #fff8ef;
  --ink: #3f2f24;
  --muted: #6a625a;
  --accent: #1c9aa6;
  --panel: #eaf5fb;
  --rule: #d7e5ec;
  --hairline: #1c9aa6;
  background: var(--bg);
  color: var(--ink);
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
}

/* stats bar */
.stats-bar {
  max-width: 1160px;
  margin: 1.25rem auto 1.25rem;
  padding: 0.75rem 1rem 0.25rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
}
.stats-bar .stat {
  display: grid;
  justify-items: center;
  text-align: center;
  position: relative;
}
.stats-bar .stat:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -1rem;
  top: 10%;
  bottom: 10%;
  width: 1px;
  background: var(--hairline);
}
.stat-number {
  font-size: clamp(1.5rem, 1.2rem + 1.4vw, 2rem);
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 0.02em;
}
.stat-label {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  color: var(--muted);
}

/* related sidebar */
.lead-section {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 1rem 1.5rem;
}
.lead-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: clamp(1rem, 2vw, 2rem);
}
.lead-media {
  margin: 0 0 1rem;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  background: #f2f2f2;
  border: 1px solid #eee;
}
.lead-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.media-ph {
  display: grid;
  place-items: center;
  height: 100%;
  color: #888;
  font-size: 0.9rem;
}

.lead-title {
  font-size: clamp(1.6rem, 1.1rem + 1.6vw, 2.1rem);
  line-height: 1.25;
  margin: 0 0 0.5rem 0;
  font-weight: 800;
}
.lead-title-link {
  color: inherit;
  text-decoration: none;
  display: inline-block;
}
.lead-title-link:hover,
.lead-title-link:focus {
  text-decoration: underline;
  outline: none;
}
.lead-dek {
  margin: 0 0 0.75rem;
  color: var(--muted);
  max-width: 60ch;
}
.lead-byline {
  margin: 0;
  color: var(--ink);
  font-weight: 600;
  font-size: 0.95rem;
}

.related-panel {
  align-self: start;
  background: var(--panel);
  border: 1px solid var(--rule);
  border-radius: 6px;
  padding: 1rem;
}
.related-heading {
  color: var(--accent);
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
  font-weight: 700;
}
.related-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}
.related-item {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 0.65rem;
  align-items: center;
}
.thumb {
  width: 84px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
  background: #fff;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-ph {
  width: 100%;
  height: 100%;
  background: #eee;
}
.r-copy {
  display: grid;
  align-content: center;
  gap: 0.2rem;
}
.r-title {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  font: inherit;
  color: var(--ink);
  font-weight: 700;
  cursor: pointer;
}
.r-title:hover {
  text-decoration: underline;
}
.r-author {
  color: var(--muted);
  font-size: 0.9rem;
}
.related-rule {
  margin-top: 0.75rem;
  border: 0;
  border-top: 1px solid var(--rule);
}

/* trending */
.trending {
  max-width: 1160px;
  margin: 1.5rem auto 2.5rem;
  padding: 0 1rem;
}
.section-title {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  color: var(--ink);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  margin: 0 0 1.2rem 0;
}
.section-title::before,
.section-title::after {
  content: '';
  height: 1px;
  background: var(--hairline);
}
.section-title span {
  padding: 0 0.25rem;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t-card {
  display: grid;
  gap: 0.5rem;
}
.t-media {
  aspect-ratio: 4/3;
  border-radius: 6px;
  overflow: hidden;
  background: #f0f0f0;
  border: 1px solid #eee;
}
.t-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.t-ph {
  width: 100%;
  height: 100%;
}
.t-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.35;
}
.t-byline {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

/* responsive */
@media (max-width: 1024px) {
  .lead-grid {
    grid-template-columns: 1fr;
  }
  .related-panel {
    order: 2;
  }
}
@media (max-width: 768px) {
  .trending-grid {
    grid-template-columns: 1fr;
  }
  .stats-bar {
    gap: 1rem;
  }
  .stats-bar .stat:not(:last-child)::after {
    display: none;
  }
}
</style>
