<template>
  <div class="home-page">
    <HeadBar />

    <!-- Hero Section -->
    <section class="hero">
      <div class="overlay"></div>
      <div class="hero-content">
        <h1>Give your child the best start for a healthy brain</h1>
        <p>
          Early experiences shape the brain for life. We're here to support parents
          and teachers with knowledge and tools that nurture children's development.
        </p>
        <!-- <button>Learn More</button> -->
        <router-link to="/today" class="btn">Start Brain Builder</router-link>
      </div>
    </section>

    <!-- What BrainBuilder does -->
    <section class="features">
      <h2 class="section-title">What BrainBuilder does</h2>
      <p style="font-size: 24px;">Turn science into simple daily actions.</p>
      <div class="feature-cards">
        <div class="card">
          <img src="/public/browse-activity.png" alt="browse-activity">
          <h3>Explore Activities</h3>
          <p>Search 80+ tips. Filter by age, place, and time.</p>
          <!-- <button>Open library</button> -->
          <router-link to="/activities" class="card-btn">Open library</router-link>
        </div>
        <div class="card">
          <img src="/public/today-pick.png" alt="today-pick">
          <h3>Today's Tips</h3>
          <p>Discover fun activities to boost child's brain development.</p>
          <!-- <button>Explore</button> -->
          <router-link to="/today" class="card-btn">Explore</router-link>
        </div>
        <div class="card">
          <img src="/public/process.png" alt="browse-activity">
          <h3>Tips Progress</h3>
          <p>Monitor your child's progress and celebrate achievements.</p>
          <!-- <button>View Progress</button> -->
          <router-link to="/progress" class="card-btn">View Progress</router-link>
        </div>
      </div>
    </section>

    <!-- What is BrainBuilder -->
    <section class="two-col">
      <div>
        <h2 class="section-title">What is BrainBuilder?</h2>
        <p>
          BrainBuilder is a non-profit education project. We're here to help parents and
          teachers create a bright future for children. Our free, science-based resources
          turn knowledge into simple daily exercise.
        </p>
        <!-- <a href="#">See resources →</a> -->
         <router-link to="/DataInsights" class="research-link">See resources &rarr;</router-link>
      </div>
      <div class="image-col">
        <img src="/brain-illustration.png" alt="Brain Illustration" />
      </div>
    </section>

    <!-- Why everyday moments -->
    <section class="why" id="moments" aria-label="Why everyday moments build strong brains">
      <div class="why-inner">
        <h2 class="why-title">Why everyday moments build strong brains</h2>
        <p class="why-sub">
          Simple daily routines help your child's brain grow. Small actions today prepare them
          for school, relationships, and lifelong learning.
        </p>

        <div class="why-grid" role="list">
          <!-- first line -->
          <div class="why-text left" role="listitem">
            <p>
              Spending time with your child makes a difference. Reading a story, setting the table,
              or playing outside all help their brain develop. Even a few minutes each day create lasting impact.
            </p>
          </div>

          <div class="why-image top-right" role="listitem">
            <div class="circle-img">
              <img src="/family1.png" alt="Parent and child playing" />
            </div>
          </div>

          <!-- second line -->
          <div class="why-image bottom-left" role="listitem">
            <div class="circle-img small">
              <img src="/family2.png" alt="Parent and child exercise" />
            </div>
          </div>

          <div class="why-text right" role="listitem">
            <p>
              Children learn best from people they trust. Your attention and care give them confidence
              and skills to thrive, turning ordinary moments into powerful brain-building experiences.
            </p>
          </div>
        </div>

        <div class="research-link-wrap">
          <!-- <a href="#research" class="research-link">See more relevant research &rarr;</a> -->
          <router-link to="/DataInsights" class="research-link">See more relevant research &rarr;</router-link>
        </div>

        <!-- decorate shape -->
        <span class="shape shape-yellow"></span>
        <span class="shape shape-red"></span>
        <span class="shape shape-green"></span>
        <span class="shape shape-diamond"></span>
      </div>
    </section>

    <!-- FAQ -->
    <div class="faq-div">
      <section class="faq">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <details>
          <summary>Is BrainBuilder medical advice?</summary>
          <p>No. BrainBuilder gives education and guidance. For diagnosis or treatment, see a clinician.</p>
        </details>
        <details>
          <summary>Which ages does BrainBuilder support?</summary>
          <p> Three stages now, 0-1, 1-3, and 3-5. Daily tips match the stage you pick.</p>
        </details>
        <details>
          <summary>How long does a daily exercise tip take?</summary>
          <p>Most tips take 3-10 minutes. They fit into real moments like mealtime, bath time, or bedtime.</p>
        </details>
        <details>
          <summary>Where do the exercise tips come from?</summary>
          <p>From child development research and expert guidance. Each card includes a short "why it helps" note.</p>
        </details>
        <details>
          <summary>What data do you store?</summary>
          <p>Age and sex selection, favorites, history, and progress. Data stays in your browser in this version. No
            account needed.</p>
        </details>
      </section>
    </div>

    <!-- Call to Action -->
    <section class="cta">
      <hr>
      <h2>Ready to begin?</h2>
      <p style="font-size: 24px;">Turn science into simply daily actions.</p>
      <!-- <button class="start-btn">Start Brain Builder</button> -->
      <router-link to="/today" class="start-btn">Start Brain Builder</router-link>
      <hr>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <!-- <nav>
        <a href="#">Behind the Research</a>
        <a href="#">Terms of Use</a>
        <a href="#">Privacy Policy</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav> -->
      <p>
        BrainBuilder is a social good, non-profit project. It is free for education,
        with no ads, no sales, and no tracking beyond what is needed to run the site.
      </p>
      <p>© 2025 BrainBuilder. A student-led project for social good.</p>
    </footer>
  </div>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import ConfirmModal from '@/components/ConfirmModal.vue'
import HeadBar from '@/components/HeadBar.vue';

const router = useRouter()
const showConfirm = ref(false)
const showDropdown = ref(false)

const isOpen = ref(false)
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleGetStarted = () => {
  showConfirm.value = true
}

const goToday = () => {
  showConfirm.value = false
  router.push('/today')
}

const goSelector = () => {
  showConfirm.value = false
  router.push('/selector')
}
</script>

<style scoped>
.home-page {
  font-family: 'Nunito', sans-serif;
  color: #333;
  line-height: 1.6;
  background-color: #fbf6ef;
}

/* Hero Section */
.hero {
  position: relative;
  height: 90vh;
  background: url("/hero.png") center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero .overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.hero-content {
  position: relative;
  color: white;
  max-width: 700px;
  padding: 20px;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  margin-bottom: 1.5rem;
  font-size: 24px;
  font-weight: 500;
}

.hero .btn {
  background: #14b8a6;
  border: none;
  padding: 12px 24px;
  color: white;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  font-size: 20px;
}

.hero .btn:hover {
  background: #0d9488;
}

/* Sections */
.section-title {
  color: #f97316;
  font-size: 3rem;
  margin-bottom: 1rem;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 100%;
  margin: 0 auto;
  padding: 30px 200px;
  font-size: 24px;
  background-color: #fbf6ef;
}

.two-col a {
  display: inline-block;
  margin-top: 1rem;
  background: #14b8a6;
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.25s ease;
}

.two-col a:hover {
  background: #0d9488;
}

.two-col img {
  max-width: 100%;
  border-radius: 8px;
  width: 400px;
}

.image-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-text {
  text-align: center;
  margin-bottom: 2rem;
}

.image-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.image-grid img {
  border-radius: 8px;
  width: 100%;
}

.why {
  background: #fbf6ef;
  position: relative;
  padding: 72px 20px;
  overflow: visible;
}

.why-inner {
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
}

.why-title {
  color: #f97316;
  font-size: 40px;
  line-height: 1.05;
  margin: 0 0 8px 0;
  text-align: center;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.why-sub {
  max-width: 760px;
  margin: 0 auto 42px auto;
  text-align: center;
  color: #6b6b6b;
  font-size: 22px;
  padding-top: 10px;
}

.why-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 36px 40px;
  align-items: center;
}

.why-text {
  font-size: 24px;
  color: #4a4a4a;
  line-height: 1.7;
  max-width: 420px;
}

.why-text.left {
  text-align: left;
  justify-self: start;
}

.why-text.right {
  text-align: left;
  justify-self: end;
}

.why-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.why-image .circle-img {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.08);
  display: inline-block;
}

.why-image .circle-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.why-image.small .circle-img,
.why-image.bottom-left .circle-img {
  width: 300px;
  height: 300px;
}

.research-link-wrap {
  text-align: center;
  margin-top: 32px;
}

.research-link {
  display: inline-block;
  margin-top: 1rem;
  background: #14b8a6;
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.25s ease;
}

.research-link:hover {
  background: #0d9488;
}

/* decorate shape */
.shape {
  position: absolute;
  pointer-events: none;
  opacity: 1;
}

.shape-yellow {
  left: 28px;
  top: 80px;
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 22px solid #facc15;
  /* yellow */
  transform: rotate(0deg);
}

.shape-red {
  right: 40px;
  top: 70px;
  width: 22px;
  height: 22px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.08);
}

.shape-green {
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: #10b981;
  border-radius: 3px;
  transform: translate(-50%, -50%) rotate(45deg);
}

.shape-diamond {
  left: 42%;
  bottom: 12%;
  width: 18px;
  height: 18px;
  background: #f59e0b;
  transform: rotate(45deg);
  border-radius: 2px;
}

/* small screen */
@media (max-width: 768px) {
  .why {
    padding: 40px 16px;
  }

  .why-sub {
    margin-bottom: 24px;
    padding: 0 8px;
  }

  .why-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 18px;
  }

  .why-text.left {
    order: 1;
    text-align: left;
    justify-self: stretch;
  }

  .why-image.top-right {
    order: 2;
    justify-self: center;
  }

  .why-image.bottom-left {
    order: 3;
    justify-self: center;
  }

  .why-text.right {
    order: 4;
    text-align: left;
    justify-self: stretch;
  }

  .why-image .circle-img,
  .why-image.small .circle-img {
    width: 180px;
    height: 180px;
  }

  /* hide decorate shape */
  .shape-yellow,
  .shape-red,
  .shape-green,
  .shape-diamond {
    display: none;
  }
}

/* Features */
.features {
  padding: 1rem 20px;
  text-align: center;
  background-color: #fbf6ef;
}

.features img {
  width: 120px;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1000px;
  margin: 2rem auto;
}

.card {
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: white;
  font-size: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card .card-btn {
  margin-top: 1rem;
  background: #14b8a6;
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  text-decoration: none;
}

.card .card-btn:hover {
  background: #0d9488;
}

/* FAQ */
.faq {
  max-width: 700px;
  margin: 1rem auto;
  padding: 0 20px;
}

.faq details {
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 15px;
  background-color: white;
  font-size: 20px;
}

.faq summary {
  font-weight: bold;
  cursor: pointer;
}

/* CTA */
.cta {
  text-align: center;
  padding: 3rem 20px;
  padding-top: 1rem;
  /* margin-top: 30px; */
  background-color: #fbf6ef;
}

.cta h2 {
  font-size: 40px;
}

.cta p {
  padding-bottom: 20px;
  font-size: 18px;
}

.cta .start-btn {
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

.cta .start-btn:hover {
  background: #ea580c;
}

hr {
  width: 700px;
  margin-top: 50px;
}

/* Footer */
.footer {
  background: #f9f9f9;
  padding: 2rem 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.footer nav {
  margin-bottom: 1rem;
}

.footer nav a {
  margin: 0 10px;
  color: #666;
  text-decoration: none;
}

.footer nav a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {

  .two-col,
  .feature-cards {
    grid-template-columns: 1fr;
  }
}
</style>
