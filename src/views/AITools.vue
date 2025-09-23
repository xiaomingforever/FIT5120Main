<template>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>BrainBuilder AI</h1>
      <p>Ask quick questions, get simple answers for your child's brain development.</p>
    </div>
  </section>
<!-- This is a mock up -->
  <section class="container grid-main" id="ai-chat">
    <div class="col-left">
      <div class="card ai">
        <header class="ai-head">

          <h2>BrainBuilder AI</h2>
          <!-- <span class="mini-logo" aria-hidden="true">logo</span> -->
          <span class="mini-logo"><font-awesome-icon icon="robot" style="color: gray; height: 30px; width: 30px;" /></span>
          <p class="lead">Hi there! How can I support you in your parenting journey today?</p>
          <p class="muted">Empowering parents with AI guidance</p>
        </header>

        <div class="chips">
          <button
            type="button"
            class="chip"
            @click="prefill(`What's a good bedtime routine for toddlers?`)"
            title="Prefill prompt"
          >
            What's a good bedtime routine for toddlers?
          </button>
          <button
            type="button"
            class="chip"
            @click="prefill('How can I help my child learn numbers at home?')"
          >
            How can I help my child learn numbers at home?
          </button>
          <button
            type="button"
            class="chip"
            @click="prefill('What are simple games that support brain development?')"
          >
            What are simple games that support brain development?
          </button>
        </div>

        <div class="conversation">
          <div v-if="messages.length === 0" class="placeholder">
            <p>AI chat will appear here. Start by asking a question!</p>
          </div>
          <div v-for="(msg, index) in messages" :key="index" :class="msg.role" class="message">
            <strong>{{ msg.role === 'user' ? 'You' : 'AI' }}:</strong>
            <span>{{ msg.text }}</span>
          </div>
        </div>

        <form class="composer" @submit.prevent="sendMessage">
          <input
            v-model="draft"
            class="input"
            type="text"
            placeholder="Ask me anything..."
            aria-label="Ask BrainBuilder AI"
            
          />
          <button class="send" type="submit" title="Send">Send</button>
        </form>
        <p class="coming-soon" role="note">AI function is active - try sending a message!</p>
      </div>
    </div>

    <aside class="col-right">
      <div class="card side">
        <div class="side-ph">RIGHT SIDEBAR placeholder</div>
      </div>
    </aside>
  </section>

  <section class="container section-overview">
    <div class="two-col">
      <div class="copy">
        <h3 class="section-title">Overview of BrainBuilder AI</h3>
        <p>
          BrainBuilder AI is designed to guide parents through the crucial early years of child
          development, from birth to age five. These years lay the foundation for learning, memory,
          and emotional growth. The system uses AI to give parents clear and practical advice
          tailored to their child's age and daily routines. Parents can ask short questions and
          receive quick, reliable answers that fit their family context. Whether it's sleep,
          language, play, or managing emotions, BrainBuilder AI offers simple guidance to help
          families build healthy habits and support their child's growth with confidence.
        </p>
      </div>
      <div class="media">
<img class="overview-img" src="/AITools/illustration-overview.jpg" alt="..." />
      </div>
    </div>
  </section>

  <section class="container section-targets">
    <h3 class="section-title center">Target User Groups for BrainBuilder AI</h3>
    <div class="cards">
      <article class="card tile">
        <h4>First-Time Parents</h4>
        <p>
          Individuals who are new to parenting and seeking guidance on fundamental aspects of brain
          health of child, from basic care to understanding developmental milestones.
        </p>
      </article>
      <article class="card tile">
        <h4>Experienced Parents</h4>
        <p>
          Parents with multiple children who want advanced strategies and guidance for managing
          complex family dynamics and specific behavior challenges.
        </p>
      </article>
      <article class="card tile">
        <h4>Caregivers and Guardians</h4>
        <p>
          Caregivers such as grandparents, aunts, uncles, or foster parents who are raising children
          and need guidance tailored to their unique situations.
        </p>
      </article>
      <article class="card tile">
        <h4>Educators Providers</h4>
        <p>
          Childcare and education professionals looking for guidance on child's brain development
          and behavior management to strengthen their practice.
        </p>
      </article>
    </div>
  </section>

  <section class="container section-guide">
    <h3 class="section-title center">Using BrainBuilder AI: A Step-by-Step Guide</h3>

    <ol class="steps">
      <li class="step">
        <div class="step-head">
          <span class="bullet">1</span>
          <h5>Start Your Journey</h5>
        </div>
        <p class="step-body">
          Start using BrainBuilder AI with a free trial, no login or ChatGPT Plus subscription
          required.
        </p>
      </li>
      <li class="step">
        <div class="step-head">
          <span class="bullet">2</span>
          <h5>Identify Your Parenting Needs</h5>
        </div>
        <p class="step-body">
          Reflect on your specific parenting challenges or questions, whether they concern toddlers,
          preschoolers or infants.
        </p>
      </li>
      <li class="step">
        <div class="step-head">
          <span class="bullet">3</span>
          <h5>Engage with BrainBuilder</h5>
        </div>
        <p class="step-body">
          Type in your questions or concerns to interact with BrainBuilder AI, and use the probing
          questions feature for tailored advice.
        </p>
      </li>
      <li class="step">
        <div class="step-head">
          <span class="bullet">4</span>
          <h5>Apply Insights</h5>
        </div>
        <p class="step-body">
          Apply the advice in your parenting, and return to BrainBuilder AI anytime for continued
          support and fresh questions.
        </p>
      </li>
    </ol>

    <div class="center back-wrap">
      <a class="btn back" href="#ai-chat">Back to AI Chat</a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const draft = ref('')
const messages = ref<{ role: string, text: string }[]>([])

const API_URL = 'https://4pzfuisbuj.execute-api.ap-southeast-2.amazonaws.com/generate'

function prefill(text: string) {
  draft.value = text
}

async function sendMessage() {
  const prompt = draft.value.trim()
  if (!prompt) return

  console.log("Sending:", prompt)

  // Add user message
  messages.value.push({ role: 'user', text: prompt })
  draft.value = ''

  // Add loading message
  messages.value.push({ role: 'ai', text: 'Thinking...' })

  try {
    console.log("API URL:", API_URL)
    console.log("Request payload:", { prompt })
    
    const res = await axios.post(API_URL, JSON.stringify({ prompt }), {
      headers: { 'Content-Type': 'application/json' },
      // timeout: 30000 // 30 seconds timeout
    })
    
    console.log("Response:", res.data)
    
    // Remove loading message
    messages.value.pop()
    
    const aiReply = res.data.output || res.data.response || res.data.message || 'Sorry, no response received.'
    messages.value.push({ role: 'ai', text: aiReply })
  } catch (err) {
    console.error("Full error:", err)
    
    // Remove loading message
    messages.value.pop()
    
    let errorMessage = 'Error connecting to AI.'
    
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const error = err as { response: any }
      // Server responded with error status
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      console.error("Response headers:", error.response.headers)
      
      if (error.response.status === 500) {
        errorMessage = 'Server error (500). The AI service might be temporarily unavailable.'
      } else if (error.response.status === 404) {
        errorMessage = 'API endpoint not found (404). Please check the API URL.'
      } else if (error.response.status === 403) {
        errorMessage = 'Access denied (403). Check API permissions.'
      } else {
        errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`
      }
    } else if (typeof err === 'object' && err !== null && 'request' in err) {
      // Request was made but no response received
      errorMessage = 'Network error: No response from server. Check your internet connection.'
    } else {
      // Something else happened
      errorMessage = `Request error: ${(err as Error).message}`
    }
    
    messages.value.push({ role: 'ai', text: errorMessage })
  }
}
</script>

<style scoped>
:global(:root) {
  --amber: #f59e0b;
  --amber-700: #b45309;
  --ink: #0f172a;
  --muted: #6b7280;
}

.container {
  width: min(1200px, 92%);
  margin: 0 auto;
}
.center {
  text-align: center;
}

/* HERO CARD */
.hero {
  position: relative;
  width: 100%;
  height: 300px;
  background: url('../assets/AITools-hero.jpg') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Nunito', sans-serif;
  color: #333;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #24242466;
  z-index: 0;
}
.hero > * {
  position: relative;
  z-index: 1;
}
.hero-content {
  position: relative;
  color: white;
  max-width: 700px;
  margin: 20px;
}
.hero h1 {
  font-size: 3.5rem;
}
.hero p {
  margin-bottom: 1.5rem;
  font-size: 26px;
  font-weight: 500;
}

.overview-img {
  width: 100%;
  max-width: 520px;
  max-height: 340px;
  height: auto;
  object-fit: contain;
  margin-inline: auto;
}
.hero-copy {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  padding: 0 2rem;
}
.hero-title {
  font-size: clamp(28px, 4.5vw, 54px);
  color: white;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  margin: 0;
}
.hero::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 240px;
  background: linear-gradient(90deg, #d9a657 0%, #f3c55a 25%, #ffd48b 55%, #d2b48c 100%);
  opacity: 0.35;
}

.grid-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 22px;
  margin-top: 36px;
}
.col-left,
.col-right {
  min-width: 0;
}

.card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #eee;
}
.card.ai {
  padding: 20px;
}
.card.side {
  padding: 16px;
  min-height: 360px;
}
.side-ph {
  height: 100%;
  min-height: 320px;
  display: grid;
  place-items: center;
  color: #999;
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 12px;
}

.ai-head h2 {
  font-size: 24px;
  margin: 0 0 0.25rem;
}
.mini-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 35px;
  background: #eef2ff;
  border-radius: 6px;
  font-size: 10px;
  margin-left: 0.5rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.lead {
  margin: 0.5rem 0 0;
  font-weight: 500;
}
.muted {
  color: var(--muted);
  font-size: 13px;
  margin-top: 0.25rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}
.chip {
  text-align: left;
  background: #f6f7f9;
  border: 1px solid #eceff3;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.35;
  cursor: pointer;
}
.chip:focus-visible {
  outline: 2px solid var(--amber);
  outline-offset: 2px;
}

.conversation {
  min-height: 120px;
  background: #fcfcfd;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}
.placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: #94a3b8;
  text-align: center;
}
.placeholder p {
  margin: 18px;
}

.message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
}
.message.user {
  background: #f0f9ff;
  margin-left: 20px;
}
.message.ai {
  background: #f9fafb;
  margin-right: 20px;
}

.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}
.input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 14px;
}
.send {
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: var(--amber);
  color: white;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.send:hover {
  background: var(--amber-700);
}
.coming-soon {
  margin-top: 6px;
  color: #16a34a;
  font-size: 12px;
}

.section-overview {
  padding: 38px 0 8px;
}
.two-col {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  align-items: center;
}
.section-title {
  color: var(--amber);
  font-size: clamp(22px, 3.2vw, 36px);
  margin: 8px 0 12px;
  font-weight: 800;
}
.copy p {
  color: #374151;
  line-height: 1.8;
  font-size: 26px;
}
.media {
  display: grid;
}

.section-targets {
  padding: 18px 0 8px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.card.tile {
  padding: 20px;
}
.card.tile h4 {
  margin: 0 0 6px;
  font-size: 26px;
}
.card.tile p {
  color: #4b5563;
  font-size: 20px;
}

.section-guide {
  padding: 24px 0 40px;
}
.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}
.step {
  border: 1px solid #e5e7eb;
  border-left: 6px solid var(--amber);
  border-radius: 10px;
  background: #fff;
  padding: 14px 16px;
}
.step-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bullet {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  background: #fff7ed;
  color: var(--amber-700);
  border: 1px solid #fde68a;
  border-radius: 999px;
  font-weight: 700;
}
.step h5 {
  margin: 0;
  font-size: 16px;
}
.step-body {
  margin: 6px 0 0;
  color: #4b5563;
}

.back-wrap {
  margin-top: 22px;
}
.btn.back {
  display: inline-block;
  background: var(--amber);
  color: white;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 700;
  border: none;
}
.btn.back:hover {
  background: #f59e0bcc;
}

@media (max-width: 1024px) {
  .grid-main {
    grid-template-columns: 1fr;
  }
  .col-right {
    order: 2;
  }
}
@media (max-width: 860px) {
  .chips {
    grid-template-columns: unset;
  }
  .two-col {
    grid-template-columns: 1fr;
  }
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 560px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .hero-media,
  .hero::before {
    height: 180px;
  }
}
</style>