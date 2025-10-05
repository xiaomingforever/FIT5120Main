<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

let trendChartInst: Chart | null = null;
let developmentChartInst: Chart | null = null;

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
  // await nextTick();
  initCharts();
  initAnimations();

})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    trendChartInst?.destroy();
    developmentChartInst?.destroy();
  }
})

  function initCharts() {
    // Data for charts
    const years = [2009, 2012, 2015, 2018, 2021, 2024];
    const vulnerableData = [23.6, 22.0, 22.0, 21.7, 22.0, 23.5];
    const languageData = [8.9, 6.8, 6.5, 6.6, 7.3, 7.7];
    const communicationData = [9.2, 9.0, 8.5, 8.2, 8.4, 8.9];



    // Trend Chart
    const trendCanvas = document.getElementById("trendChart") as HTMLCanvasElement | null;

    if (trendCanvas) {
      trendChartInst?.destroy();
      const ctx = trendCanvas.getContext("2d");
      if (ctx) {
      trendChartInst = new Chart(ctx, {
        type: "line",
        data: {
          labels: years,
          datasets: [
            {
              label: "Children Developmentally Vulnerable (%)",
              data: vulnerableData,
              borderColor: "#667eea",
              backgroundColor: "rgba(102, 126, 234, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#667eea",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 6,
            },
            {
              label: "Language Difficulties (%)",
              data: languageData,
              borderColor: "#f093fb",
              backgroundColor: "rgba(240, 147, 251, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#f093fb",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 6,
            },
            {
              label: "Communication Challenges (%)",
              data: communicationData,
              borderColor: "#4facfe",
              backgroundColor: "rgba(79, 172, 254, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#4facfe",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 25,
              grid: {
                color: "rgba(0,0,0,0.1)",
              },
              ticks: {
                callback: function (value) {
                  return value + "%";
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          elements: {
            point: {
              hoverRadius: 8,
            },
          },
        },
      });
    }
    }

    // Development Areas Chart
   const developmentCanvas = document.getElementById("developmentChart") as HTMLCanvasElement | null;

    if (developmentCanvas) {
  developmentChartInst?.destroy();
  const devCtx = developmentCanvas.getContext("2d");
  if (devCtx) {
    developmentChartInst = new Chart(devCtx, {
        type: "doughnut",
        data: {
          labels: [
            "Physical Health",
            "Social Competence",
            "Emotional Maturity",
            "Language & Cognition",
            "Communication & General Knowledge",
          ],
          datasets: [
            {
              data: [10.0, 10.7, 10.0, 7.7, 8.9],
              backgroundColor: [
                "#667eea",
                "#f093fb",
                "#4facfe",
                "#43e97b",
                "#f5576c",
              ],
              borderWidth: 0,
              hoverOffset: 15,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 13,
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.label + ": " + context.parsed + "% vulnerable";
                },
              },
            },
          },
          cutout: "60%",
        },
      });
    }
  }
  }

  function initAnimations() {
  const observerOptions = {
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Narrow to HTMLElement
        const statNumber = entry.target.querySelector(".stat-number, .fact-number");

        if (statNumber instanceof HTMLElement && !statNumber.classList.contains("animated")) {
          setTimeout(() => {
            animateNumber(statNumber); // OK: HTMLElement
          }, Math.random() * 300);

          statNumber.classList.add("animated");
        }
      }
    });
  }, observerOptions);
    document.querySelectorAll(".stat-card, .fact-item").forEach((card) => {
    observer.observe(card);
  });
}

  function animateNumber(element: HTMLElement) {
    const finalValue = (element.textContent || "").trim();

    // Special cases that display as-is
    const specialCases = ["1M", "700", "7x", "0-2"];
    if (specialCases.includes(finalValue)) {
      element.style.transform = "scale(0)";
      element.style.transition =
        "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      setTimeout(() => {
        element.style.transform = "scale(1)";
      }, 200);
      return;
    }

    // Extract numeric value
    const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ""));
    const isPercentage = finalValue.includes("%");

    if (isNaN(numericValue) || numericValue === 0) {
      return;
    }

    let currentValue = 0;
    const increment = numericValue / 60;

    element.textContent = isPercentage ? "0%" : "0";

    const timer = setInterval(() => {
      currentValue += increment;

      if (currentValue >= numericValue) {
        element.textContent = finalValue;
        clearInterval(timer);

        // Bounce effect
        element.style.transform = "scale(1.1)";
        element.style.transition = "transform 0.2s ease";
        setTimeout(() => {
          element.style.transform = "scale(1)";
        }, 200);
      } else {
        const displayValue = Math.floor(currentValue);
        element.textContent = isPercentage
          ? displayValue + "%"
          : displayValue.toString();
      }
    }, 30);
  }

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

<!-- Key Facts About Brain Development -->
      <div class="key-facts">
        <h2>The Science of Early Development</h2>
        <div class="facts-grid">
          <div class="fact-item">
            <span class="fact-number">90%</span>
            <div class="fact-text">
              of brain development occurs in the first 5 years
            </div>
          </div>
          <div class="fact-item">
            <span class="fact-number">1M</span>
            <div class="fact-text">
              neural connections formed per second in early years
            </div>
          </div>
          <div class="fact-item">
            <span class="fact-number">7x</span>
            <div class="fact-text">
              return for every dollar invested in early childhood programs
            </div>
          </div>
          <div class="fact-item">
            <span class="fact-number">700</span>
            <div class="fact-text">
              new neural connections per second at birth
            </div>
          </div>
        </div>
      </div>

      <!-- Key Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">23.5%</span>
          <div class="stat-label">Children Developmentally Vulnerable</div>
          <div class="stat-description">
            In Australia 2024, nearly 1 in 4 children are at risk of
            developmental delays
          </div>
          <div class="trend-indicator trend-down">↓ Down from 23.6% (2009)</div>
        </div>

        <div class="stat-card">
          <span class="stat-number">10.7%</span>
          <div class="stat-label">Language Difficulties</div>
          <div class="stat-description">
            Highest challenges: Communication (8.9%) and Language (7.7%)
          </div>
          <div class="trend-indicator trend-up">↑ Up from 8.9% (2009)</div>
        </div>

        <div class="stat-card">
          <span class="stat-number">40.8%</span>
          <div class="stat-label">Highest Vulnerability Rate</div>
          <div class="stat-description">
            Northern Territory shows the highest rate of vulnerable children
          </div>
          <div class="trend-indicator trend-up">
            ⚠️ Urgent intervention needed
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-number">0-2</span>
          <div class="stat-label">Critical Window</div>
          <div class="stat-description">
            Most important years for brain architecture formation
          </div>
          <div class="trend-indicator trend-down">
            ⚡ Time-sensitive opportunity
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="chart-section">
        <h2 class="chart-title">Why Your Child's Early Years Matter Most</h2>
        <div class="chart-container">
          <canvas id="trendChart"></canvas>
        </div>
        <div
          style="
            background: #f8fafc;
            padding: 25px;
            border-radius: 15px;
            margin-top: 20px;
            border-left: 4px solid #4facfe;
          "
        >
          <h3 style="color: #64748B; margin-bottom: 15px; font-size: 1.2rem">
            💡 What This Means for You as a Parent:
          </h3>
          <p style="color: #64748B; line-height: 1.6; margin-bottom: 10px">
            <strong>Language difficulties are on the rise</strong> - from 8.9%
            to 7.7%. This trend shows that more children are struggling with
            communication skills when they enter school.
          </p>
          <p style="color: #64748B; line-height: 1.6; margin-bottom: 10px">
            <strong>The window of opportunity is closing</strong> - While
            overall vulnerability rates have remained relatively stable, early
            intervention during ages 0-3 can prevent these challenges.
          </p>
          <p style="color: #64748B; font-weight: 600">
            ✨ Good news: Simple daily activities like reading, singing, and
            talking with your child can make a huge difference!
          </p>
        </div>
      </div>

      <!-- Development Areas Chart -->
      <div class="chart-section">
        <h2 class="chart-title">Where Your Child Needs the Most Support</h2>
        <div class="chart-container">
          <canvas id="developmentChart"></canvas>
        </div>
        <div
          style="
            background: #f8fafc;
            padding: 25px;
            border-radius: 15px;
            margin-top: 20px;
            border-left: 4px solid #4facfe;
          "
        >
          <h3 style="color: #4facfe; margin-bottom: 15px; font-size: 1.2rem">
            🎯 Action Plan for Parents:
          </h3>
          <div
            style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 15px;
              margin-top: 15px;
            "
          >
            <div>
              <strong style="color: #43E97B"
                >Social Skills (10.7% at risk):</strong
              >
              <p style="color: #64748b; margin-top: 5px">
                Arrange playdates, practice sharing, teach emotion words
              </p>
            </div>
            <div>
              <strong style="color: #43E97B"
                >Physical Development (10.0% at risk):</strong
              >
              <p style="color: #64748b; margin-top: 5px">
                Encourage active play, fine motor activities like drawing,
                outdoor exploration
              </p>
            </div>
            <div>
              <strong style="color: #43E97B"
                >Language & Communication (8.8% at risk):</strong
              >
              <p style="color: #64748b; margin-top: 5px">
                Read daily, narrate your activities, ask open-ended questions
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="insights-grid">
        <div class="insight-card">
          <h3 class="insight-title">🏠 Start at Home, Start Today</h3>
          <p class="insight-text">
            You don't need expensive programs or special equipment. Simple
            activities like counting toys, describing colors during walks, or
            singing nursery rhymes during bath time build crucial neural
            pathways.
          </p>
        </div>

        <div class="insight-card">
          <h3 class="insight-title">⏰ Every Moment Counts</h3>
          <p class="insight-text">
            Your child's brain forms 1 million neural connections per second in
            early years. Daily routines like mealtime conversations and bedtime
            stories are actually powerful brain-building opportunities.
          </p>
        </div>

        <div class="insight-card">
          <h3 class="insight-title">📈 Small Steps, Big Impact</h3>
          <p class="insight-text">
            Even 15 minutes of focused play daily can significantly improve your
            child's school readiness. The key is consistency and engagement, not
            perfection.
          </p>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="cta-section">
        <h2 class="cta-title">Ready to Give Your Child the Best Start?</h2>
        <p class="cta-text">
          Join thousands of parents who are already using BrainBuilder's simple,
          science-backed activities. Transform everyday moments into powerful
          learning opportunities - starting today.
        </p>
        <button class="cta-button" onclick="window.open('#', '_blank')">
          Get Started Free
        </button>
        <p style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8">
          ✓ Age-appropriate activities ✓ 5-minute daily tips ✓ Track your
          child's progress
        </p>
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
  background: linear-gradient(135deg, #FFC93C 0%, #FF66AA 100%);
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
  background: #00C950;
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

  .hero h1 {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;
  }

  .hero p {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin: 40px 0;
  }

  .stat-card {
    background: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.1),
      transparent
    );
    transition: left 0.5s;
  }

  .stat-card:hover::before {
    left: 100%;
  }

  .stat-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 800;
    color: #43E97B;
    margin-bottom: 10px;
    display: block;
  }

  .stat-label {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 5px;
  }

  .stat-description {
    font-size: 0.9rem;
    color: #888;
    line-height: 1.4;
  }

  .chart-section {
    background: white;
    border-radius: 20px;
    padding: 40px;
    margin: 40px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .chart-title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
  }

  .chart-container {
    position: relative;
    height: 400px;
    margin: 30px 0;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin: 40px 0;
  }

  .insight-card {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .insight-card:nth-child(2) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .insight-card:nth-child(3) {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  .insight-card:hover {
    transform: scale(1.05);
  }

  .insight-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .insight-text {
    font-size: 1.1rem;
    line-height: 1.6;
    opacity: 0.95;
  }

  .cta-section {
    background: linear-gradient(135deg, #FFC93C 0%, #FF66AA 100%);
    color: white;
    text-align: center;
    padding: 60px 40px;
    border-radius: 20px;
    margin: 40px 0;
  }

  .cta-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 20px;
  }

  .cta-text {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .cta-button {
    background: white;
    color: #FF9404;
    padding: 15px 40px;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .insights-grid {
      grid-template-columns: 1fr;
    }
  }

  .trend-indicator {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 10px;
  }

  .trend-up {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  .trend-down {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }

  .key-facts {
    background: linear-gradient(135deg, #FFC93C 0%, #FF66AA 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    margin: 40px 0;
    text-align: center;
  }

  .key-facts h2 {
    font-size: 2.2rem;
    margin-bottom: 30px;
    font-weight: 800;
  }

  .facts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .fact-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  .fact-number {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 10px;
    display: block;
  }

  .fact-text {
    font-size: 1rem;
    opacity: 0.9;
  }
</style>
