<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const connectionCounter = ref(0)
let animationFrame: number | null = null

const brainGrowthData = [
  { age: 'Birth', value: 25 },
  { age: '1 Year', value: 50 },
  { age: '2 Years', value: 65 },
  { age: '3 Years', value: 80 },
  { age: '4 Years', value: 87 },
  { age: '5 Years', value: 90 }
]

const wordPowerData = [
  { type: 'Normal Development', words: 500 },
  { type: 'Daily Talk', words: 800 }
]

// Tooltip state
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  content: ''
})

function showTooltip(event: MouseEvent, content: string) {
  const rect = (event.target as SVGElement).getBoundingClientRect()
  tooltip.value = {
    show: true,
    x: event.clientX,
    y: event.clientY - 10,
    content
  }
}

function hideTooltip() {
  tooltip.value.show = false
}

function animateCounter() {
  const target = 1000000
  const duration = 2000
  const startTime = Date.now()
  
  function update() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    connectionCounter.value = Math.floor(target * progress)
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(update)
    } else {
      setTimeout(() => {
        connectionCounter.value = 0
        animateCounter()
      }, 2000)
    }
  }
  
  update()
}

onMounted(() => {
  animateCounter()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>🧠 Data Insights</h1>
      <p>Evidence-based research on why daily engagement matters</p>
    </div>
  </section>

  <section class="insights-container">
    <div class="charts-grid">
      <!-- Chart 1: Brain Growth -->
      <div class="chart-card">
        <div class="chart-title">Brain Growth Race (0-5 years)</div>
        <div class="chart-visual">
          <svg viewBox="0 0 400 250" class="line-chart">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#e74c3c;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#e74c3c;stop-opacity:0.05" />
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            <line 
              v-for="i in 5" 
              :key="i" 
              :x1="50" 
              :x2="380" 
              :y1="30 + (i-1)*45" 
              :y2="30 + (i-1)*45" 
              stroke="#e5e7eb" 
              stroke-width="1"
            />
            <!-- Y-axis labels -->
            <text 
              v-for="(val, i) in [100, 75, 50, 25, 0]" 
              :key="'y'+i"
              x="40" 
              :y="35 + i*45" 
              text-anchor="end" 
              font-size="12" 
              fill="#666"
            >
              {{ val }}%
            </text>
            <!-- Line path -->
            <polyline
              :points="brainGrowthData.map((d, i) => `${70 + i*62},${210 - d.value*1.8}`).join(' ')"
              fill="url(#gradient)"
              stroke="#e74c3c"
              stroke-width="3"
            />
            <!-- Points -->
            <circle 
              v-for="(d, i) in brainGrowthData" 
              :key="i"
              :cx="70 + i*62" 
              :cy="210 - d.value*1.8"
              r="8" 
              fill="#e74c3c" 
              stroke="#fff" 
              stroke-width="2"
              style="cursor: pointer"
              @mouseenter="showTooltip($event, `${d.age}: ${d.value}% of adult brain size`)"
              @mouseleave="hideTooltip"
            />
            <!-- X-axis labels -->
            <text 
              v-for="(d, i) in brainGrowthData" 
              :key="'x'+i"
              :x="70 + i*62" 
              y="235" 
              text-anchor="middle" 
              font-size="11" 
              fill="#666"
            >
              {{ d.age }}
            </text>
          </svg>
        </div>
        <div class="takeaway">
          Your child's brain doubles in size by age 1 - every day counts!
        </div>
        <div class="source-link">
          <a href="https://www.firstthingsfirst.org/early-childhood-matters/brain-development/" target="_blank">
            View Source: First Things First
          </a>
        </div>
      </div>

      <!-- Chart 2: Word Power -->
      <div class="chart-card">
        <div class="chart-title">Daily Talk = Word Power</div>
        <div class="chart-visual">
          <svg viewBox="0 0 400 250" class="bar-chart">
            <!-- Y-axis labels -->
            <text x="40" y="20" text-anchor="end" font-size="12" fill="#666">800</text>
            <text x="40" y="110" text-anchor="end" font-size="12" fill="#666">400</text>
            <text x="40" y="215" text-anchor="end" font-size="12" fill="#666">0</text>
            <!-- Y-axis title -->
            <text 
                x="10" 
                y="120" 
                text-anchor="middle" 
                font-size="12" 
                fill="#374151" 
                font-weight="700" 
                transform="rotate(-90 10 120)"
                >
                Vocabulary Size at Age 2
            </text>
            
            <!-- Bars -->
            <rect 
              x="80" 
              y="70" 
              width="100" 
              height="140" 
              fill="#95a5a6" 
              rx="8"
              style="cursor: pointer"
              @mouseenter="showTooltip($event, 'Normal Development: 500 words at age 2')"
              @mouseleave="hideTooltip"
            />
            <rect 
              x="220" 
              y="10" 
              width="100" 
              height="200" 
              fill="#27ae60" 
              rx="8"
              style="cursor: pointer"
              @mouseenter="showTooltip($event, 'Daily Talk: 800 words at age 2 (+300 more!)')"
              @mouseleave="hideTooltip"
            />
            
            <!-- Value labels on bars -->
            <text x="130" y="60" text-anchor="middle" font-size="16" font-weight="bold" fill="#2c3e50">500</text>
            <text x="270" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#2c3e50">800</text>
            
            <!-- X-axis labels -->
            <text x="130" y="230" text-anchor="middle" font-size="13" fill="#666">Normal</text>
            <text x="270" y="230" text-anchor="middle" font-size="13" fill="#666">Daily Talk</text>
            <text x="200" y="245" text-anchor="middle" font-size="11" fill="#2c3e50" font-weight="bold">Development Type</text>
          </svg>
        </div>
        <div class="takeaway">
          Just talking daily gives your child 300 more words by age 2
        </div>
        <div class="source-link">
          <a href="https://www.zerotothree.org/resource/distillation/22-statistics-you-need-to-know-about-childhood-brain-development/" target="_blank">
            View Source: ZERO TO THREE
          </a>
        </div>
      </div>

      <!-- Chart 3: Neural Connections -->
      <div class="chart-card">
        <div class="chart-title">Neural Connection Speed</div>
        <div class="counter-container">
          <div class="counter">{{ connectionCounter.toLocaleString() }}</div>
          <div class="counter-label">connections per second</div>
        </div>
        <div class="takeaway">
          Your baby's brain creates 1 million connections every second
        </div>
        <div class="source-link">
          <a href="https://developingchild.harvard.edu/resources/inbriefs/inbrief-science-of-ecd/" target="_blank">
            View Source: Harvard Center
          </a>
        </div>
      </div>

      <!-- Chart 4: Energy Allocation -->
      <div class="chart-card">
        <div class="chart-title">Energy Allocation: Baby vs Adult</div>
        <div class="energy-container">
          <div class="energy-column">
            <div class="energy-pie baby-pie">
              <span>60%<br/>Brain</span>
            </div>
            <div class="pie-label">Baby</div>
          </div>
          <div class="energy-column">
            <div class="energy-pie adult-pie">
              <span>20%<br/>Brain</span>
            </div>
            <div class="pie-label">Adult</div>
          </div>
        </div>
        <div class="takeaway">
          60% of your baby's energy goes to building their brain
        </div>
        <div class="source-link">
          <a href="https://www.zerotothree.org/resource/distillation/22-statistics-you-need-to-know-about-childhood-brain-development/" target="_blank">
            View Source: ZERO TO THREE
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Tooltip -->
  <div 
    v-if="tooltip.show" 
    class="tooltip"
    :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
  >
    {{ tooltip.content }}
  </div>
</template>

<style scoped>
/* Hero Section */
.hero {
  position: relative;
  width: 100%;
  height: 320px;
  background: radial-gradient(circle at 20% 30%, #667eea, #764ba2 80%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  overflow: hidden;
}

.hero::after {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  filter: blur(90px);
  animation: float 12s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 20px;
}

.hero h1 {
  font-size: clamp(2.6rem, 5vw, 3.8rem);
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0 0 0.5rem;
}

.hero p {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 500;
  opacity: 0.95;
}

/* Insights Layout */
.insights-container {
  padding: 3rem 1.25rem 4rem;
  max-width: 1250px;
  margin: 0 auto;
  background: linear-gradient(180deg, #fafbfc, #f1f4f9);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}
@media (min-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Chart Cards */
.chart-card {
  background: #fff;
  border-radius: 18px;
  padding: 2rem;
  border: 1px solid #e6e8ee;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: all 0.25s ease;
}

.chart-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: #a78bfa;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
}

.chart-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.chart-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  margin: 0.6rem auto 0;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 9999px;
}

/* Chart Visuals */
.chart-visual {
  margin-bottom: 1.75rem;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-chart,
.bar-chart {
  width: 100%;
  height: auto;
}

circle:hover {
  filter: drop-shadow(0 0 6px #e74c3c);
  transition: 0.2s;
}

/* Counter */
.counter-container {
  text-align: center;
  padding: 2.5rem 1rem;
}

.counter {
  font-size: clamp(3.2rem, 7vw, 5rem);
  font-weight: 800;
  color: #e74c3c;
  margin-bottom: 0.6rem;
  text-shadow: 0 3px 8px rgba(231, 76, 60, 0.3);
}

.counter-label {
  font-size: 1.1rem;
  color: #6b7280;
  font-weight: 500;
}

/* Energy Pies */
.energy-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 250px;
}

.energy-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.energy-pie {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.25s ease;
}

.energy-pie:hover {
  transform: scale(1.08) rotate(6deg);
}

.baby-pie {
  background: conic-gradient(#e74c3c 0% 60%, #ecf0f1 60% 100%);
}

.adult-pie {
  background: conic-gradient(#3498db 0% 20%, #ecf0f1 20% 100%);
}

.pie-label {
  font-weight: 600;
  font-size: 1.1rem;
  color: #374151;
}

/* Takeaway */
.takeaway {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 1.05rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s;
}
.takeaway:hover {
  transform: scale(1.02);
}

/* Source Links */
.source-link {
  text-align: center;
}
.source-link a {
  display: inline-block;
  background: #f59e0b;
  color: white;
  padding: 0.6rem 1.25rem;
  text-decoration: none;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.25s ease;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.35);
}
.source-link a:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(245, 158, 11, 0.45);
}

/* Tooltip */
.tooltip {
  position: fixed;
  background: rgba(31, 41, 55, 0.97);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -100%) scale(0.95);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: fadeTooltip 0.25s ease forwards;
}

@keyframes fadeTooltip {
  from {
    opacity: 0;
    transform: translate(-50%, -80%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
}
</style>