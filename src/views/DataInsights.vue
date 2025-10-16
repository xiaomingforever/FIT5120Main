<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
import VictoriaMapSection from '@/components/VictoriaMapSection.vue'

// Load Leaflet dynamically
const loadLeaflet = () => {
  return new Promise((resolve) => {
    if ((window as any).L) {
      resolve(true)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(true)
    document.head.appendChild(script)
  })
}

let trendChartInst: Chart | null = null;
let developmentChartInst: Chart | null = null;
let stateVulnChartInst: Chart | null = null;

const connectionCounter = ref(0)
let animationFrame: number | null = null

// Domain data for pills
const DOMAINS = [
  {
    name: 'Physical development', icon: '\u{1F3C3}', key: 'Physical health and wellbeing',
    insight: [
      'Physical development challenges are increasing from 9.3% to 10.0% nationally, showing declining active play opportunities.',
      'Screen time impact is evident - Children need more physical activity and motor skill development in early years.',
      '\u{1F4A1} Good news: Simple outdoor play, dancing and playground time dramatically help physical development.'
    ]
  },
  {
    name: 'Social competence', icon: '\u{1F465}', key: 'Social competence',
    insight: [
      'Social competence vulnerabilities are rising from 9.5% to 10.7%, indicating social-emotional challenges.',
      'Early socialisation is crucial - Children need guided social interactions and emotional regulation support from birth.',
      '\u{1F91D} Good news: Playgroups, family interactions and emotional coaching can significantly boost social skills.'
    ]
  },
  {
    name: 'Emotional maturity', icon: '\u{1F60A}', key: 'Emotional maturity',
    insight: [
      'Emotional maturity challenges are significant from 8.9% to 10.0%, showing increased need for emotional support.',
      'Emotion skills are learnable - Early coaching in naming feelings & calm responses has lasting impact.',
      '\u{1F60A} Good news: Simple emotional coaching during daily routines transforms development.'
    ]
  },
  {
    name: 'Language & cognitive', icon: '\u{1F9E0}', key: 'Language and cognitive',
    insight: [
      'Language difficulties show mixed trends from 8.8% to 7.7% nationally; some states show increases.',
      'The window of opportunity is critical - Early language during ages 0-3 has the highest payoff.',
      '\u{1F4A1} Good news: Daily reading, singing and talking make a huge difference.'
    ]
  },
  {
    name: 'Communication skills', icon: '\u{1F4AC}', key: 'Communication skills',
    insight: [
      'Communication skills show concerning patterns - fluctuating from 9.2% to 8.9%, with state variations.',
      'Early communication is foundational - The first 1,000 days are critical for communication skill development.',
      '\u{1F4A1} Good news: Talking, singing & responsive conversation builds strong foundations!'
    ]
  }
]

let currentDomain = ref('Communication skills')
let csvData: any[] = []
let geoData: any = null
let map: any = null
let geoJsonLayer: any = null
let currentYearIndex = ref(0)
let playTimer: any = null

const YEARS = [2009, 2012, 2015, 2018, 2021, 2024]
const API_BASE = 'https://i247jgjan0.execute-api.ap-southeast-2.amazonaws.com'
const API_URL = API_BASE + '/states'
// const GEOJSON_URL = 'vic_map_all_years_domains.geojson'
const GEOJSON_URL = 'https://child-health-bucket.s3.ap-southeast-2.amazonaws.com/vic_map_all_years_domains.geojson'

const STATE_COLORS: Record<string, string> = {
  'Australia': '#3b82f6',
  'New South Wales': '#f59e0b',
  'Victoria': '#10b981',
  'Queensland': '#ef4444',
  'Western Australia': '#8b5cf6',
  'South Australia': '#ec4899'
}
const DISPLAY_STATES = ['Australia', 'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia']

// Tooltip state
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  content: ''
})

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

onMounted(async () => {
  animateCounter()
  buildDomainPills()
  await loadLeaflet()
  await loadData()
  initCharts()
  initAnimations()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  if (playTimer) {
    clearInterval(playTimer)
  }
  trendChartInst?.destroy()
  developmentChartInst?.destroy()
  stateVulnChartInst?.destroy()
  if (map) {
    map.remove()
  }
})

async function loadData() {
  try {
    const resp = await fetch(API_URL)
    if (!resp.ok) throw new Error('Failed to fetch API data: ' + resp.status)
    const apiRows = await resp.json()

    csvData = apiRows.map((d: any) => ({
      Domain: d.Domain ?? d.domain ?? d.domain_name,
      State: d.State ?? d.state ?? d.state_name,
      Year: d.Year != null ? +d.Year : (d.year != null ? +d.year : null),
      Vulnerable_pct: (d.Vulnerable_pct != null ? +d.Vulnerable_pct : (d.vulnerable_pct != null ? +d.vulnerable_pct : (d.Vulnerable_pct_1dp ? parseFloat(d.Vulnerable_pct_1dp) : null)))
    }))

    updateStateVulnChart()

    try {
      const geoResp = await fetch(GEOJSON_URL)
      if (geoResp.ok) {
        geoData = await geoResp.json()
        setTimeout(() => initMap(), 100)
      } else {
        showMapPlaceholder()
      }
    } catch (geoErr) {
      console.warn('GeoJSON not available:', geoErr)
      showMapPlaceholder()
    }
  } catch (err) {
    console.error('loadData error', err)
    alert('Failed to load data. Please check your API connection.')
  }
}

function showMapPlaceholder() {
  const mapEl = document.getElementById('vicMap')
  if (mapEl) {
    mapEl.innerHTML = `
      <div style="
        height: 100%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
      ">
        <div>
          <div style="font-size: 48px; margin-bottom: 20px;">&#x1F5FA;&#xFE0F;</div>
          <h3 style="color: #374151; margin-bottom: 12px;">Victoria Map Coming Soon</h3>
          <p style="color: #6b7280;">The interactive map requires the GeoJSON data file.<br/>
          Please ensure <code>vic_map_all_years_domains.geojson</code> is available.</p>
        </div>
      </div>
    `
  }
}

function buildDomainPills() {
  const wrap = document.getElementById('domainPills')
  if (!wrap) return

  wrap.innerHTML = ''
  DOMAINS.forEach(d => {
    const btn = document.createElement('button')
    btn.className = 'pill' + (d.key === currentDomain.value ? ' active' : '')
    btn.setAttribute('data-key', d.key)
    btn.innerHTML = `<span>${d.icon}</span> ${d.name}`
    btn.onclick = () => {
      currentDomain.value = d.key
      updateDomainPills()
      updateStateVulnChart()
      updateInsightText()
      if (map) updateMap()
    }
    wrap.appendChild(btn)
  })
}

function updateDomainPills() {
  const btns = document.querySelectorAll('.pill')
  btns.forEach((el) => {
    const key = (el as HTMLElement).dataset.key
    if (key === currentDomain.value) {
      el.classList.add('active')
    } else {
      el.classList.remove('active')
    }
  })
}

function updateInsightText() {
  const domain = DOMAINS.find(d => d.key === currentDomain.value)
  if (!domain) return

  const p1 = document.getElementById('insight-1')
  const p2 = document.getElementById('insight-2')
  const p3 = document.getElementById('insight-3')

  if (p1) p1.innerHTML = `<strong>${domain.insight[0]}</strong>`
  if (p2) p2.innerHTML = `<strong>${domain.insight[1]}</strong>`
  if (p3) p3.textContent = domain.insight[2]
}

function updateStateVulnChart() {
  if (!csvData || csvData.length === 0) return

  const filtered = csvData.filter((d: any) =>
    d.Domain === currentDomain.value && DISPLAY_STATES.includes(d.State)
  )

  const byState = new Map()
  filtered.forEach((d: any) => {
    if (!byState.has(d.State)) {
      byState.set(d.State, [])
    }
    byState.get(d.State).push(d)
  })

  const datasets: any[] = []
  byState.forEach((arr: any[], state: string) => {
    const mapYear = new Map(arr.map((d: any) => [d.Year, d.Vulnerable_pct]))
    const values = YEARS.map(y => mapYear.get(y) ?? null)

    datasets.push({
      label: state,
      data: values,
      borderColor: STATE_COLORS[state] || '#999',
      backgroundColor: (STATE_COLORS[state] || '#999') + '22',
      borderWidth: state === 'Australia' ? 4 : 2.5,
      tension: 0.35,
      pointRadius: state === 'Australia' ? 6 : 4,
      pointBackgroundColor: STATE_COLORS[state] || '#999',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      fill: true
    })
  })

  datasets.sort((a, b) =>
    a.label === 'Australia' ? -1 : b.label === 'Australia' ? 1 : a.label.localeCompare(b.label)
  )

  const canvas = document.getElementById('stateVulnChart') as HTMLCanvasElement | null
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (stateVulnChartInst) {
    stateVulnChartInst.destroy()
  }

  stateVulnChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: YEARS,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 40
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 18,
            font: { size: 13 }
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.dataset.label}: ${context.parsed.y?.toFixed(1)}%`
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'Vulnerability (%)' },
          min: 0,
          suggestedMax: 20,
          grid: { color: 'rgba(0,0,0,0.07)' },
          ticks: {
            callback: (value: any) => value + '%'
          }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  })
}

function initCharts() {
  const years = [2009, 2012, 2015, 2018, 2021, 2024]
  const vulnerableData = [23.6, 22.0, 22.0, 21.7, 22.0, 23.5]
  const languageData = [8.9, 6.8, 6.5, 6.6, 7.3, 7.7]
  const communicationData = [9.2, 9.0, 8.5, 8.2, 8.4, 8.9]

  const trendCanvas = document.getElementById("trendChart") as HTMLCanvasElement | null

  if (trendCanvas) {
    trendChartInst?.destroy()
    const ctx = trendCanvas.getContext("2d")
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
                  return value + "%"
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
      })
    }
  }

  const developmentCanvas = document.getElementById("developmentChart") as HTMLCanvasElement | null

  if (developmentCanvas) {
    developmentChartInst?.destroy()
    const devCtx = developmentCanvas.getContext("2d")
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
                  size: 16,
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.label + ": " + context.parsed + "% vulnerable"
                },
              },
            },
          },
          cutout: "60%",
        },
      })
    }
  }
}

function initAnimations() {
  const observerOptions = {
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const statNumber = entry.target.querySelector(".stat-number, .fact-number")

        if (statNumber instanceof HTMLElement && !statNumber.classList.contains("animated")) {
          setTimeout(() => {
            animateNumber(statNumber)
          }, Math.random() * 300)

          statNumber.classList.add("animated")
        }
      }
    })
  }, observerOptions)

  document.querySelectorAll(".stat-card, .fact-item").forEach((card) => {
    observer.observe(card)
  })
}

function animateNumber(element: HTMLElement) {
  const finalValue = (element.textContent || "").trim()

  const specialCases = ["1M", "700", "7x", "0-2"]
  if (specialCases.includes(finalValue)) {
    element.style.transform = "scale(0)"
    element.style.transition = "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    setTimeout(() => {
      element.style.transform = "scale(1)"
    }, 200)
    return
  }

  const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ""))
  const isPercentage = finalValue.includes("%")

  if (isNaN(numericValue) || numericValue === 0) {
    return
  }

  let currentValue = 0
  const increment = numericValue / 60

  element.textContent = isPercentage ? "0%" : "0"

  const timer = setInterval(() => {
    currentValue += increment

    if (currentValue >= numericValue) {
      element.textContent = finalValue
      clearInterval(timer)

      element.style.transform = "scale(1.1)"
      element.style.transition = "transform 0.2s ease"
      setTimeout(() => {
        element.style.transform = "scale(1)"
      }, 200)
    } else {
      const displayValue = Math.floor(currentValue)
      element.textContent = isPercentage
        ? displayValue + "%"
        : displayValue.toString()
    }
  }, 30)
}

function initMap() {
  if (!geoData || typeof (window as any).L === 'undefined') {
    console.warn('Leaflet not available or no geo data')
    return
  }

  const L = (window as any).L
  const mapEl = document.getElementById('vicMap')
  if (!mapEl) return

  map = L.map('vicMap', { center: [-37.4713, 144.7852], zoom: 7, scrollWheelZoom: true })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap · © CARTO',
    maxZoom: 19,
    minZoom: 6
  }).addTo(map)

  const legend = L.control({ position: 'bottomleft' })
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'map-legend')
    div.innerHTML = `
      <div class="legend-title">Vulnerability %</div>
      <div class="legend-gradient"></div>
      <div class="legend-labels"><span>Low</span><span>High</span></div>
    `
    return div
  }
  legend.addTo(map)

  updateMap()
}

function updateMap() {
  if (!map || !geoData || typeof (window as any).L === 'undefined') return

  const L = (window as any).L
  const year = YEARS[currentYearIndex.value]

  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer)
  }

  function getValue(f: any) {
    const yd = f.properties?.metrics?.[String(year)]
    const dd = yd?.[currentDomain.value]
    return dd?.pct ?? null
  }

  function getMetrics(f: any) {
    const yd = f.properties?.metrics?.[String(year)]
    return yd?.[currentDomain.value] ?? null
  }

  let min = Infinity, max = -Infinity
  geoData.features.forEach((ft: any) => {
    const v = getValue(ft)
    if (v !== null && !isNaN(v)) {
      min = Math.min(min, v)
      max = Math.max(max, v)
    }
  })

  if (min === Infinity) { min = 0; max = 20 }

  const colorScale = (v: number) => {
    const normalized = (v - min) / (max - min)
    if (normalized < 0.5) {
      const t = normalized * 2
      return `rgb(${Math.round(16 + (251 - 16) * t)}, ${Math.round(185 + (203 - 185) * t)}, ${Math.round(129 + (64 - 129) * t)})`
    } else {
      const t = (normalized - 0.5) * 2
      return `rgb(${Math.round(251 - (251 - 239) * t)}, ${Math.round(203 - (203 - 68) * t)}, ${Math.round(64 - (64 - 68) * t)})`
    }
  }

  geoJsonLayer = L.geoJSON(geoData, {
    style: (ft: any) => {
      const v = getValue(ft)
      return {
        fillColor: v === null || isNaN(v) ? '#ddd' : colorScale(v),
        color: '#fff',
        weight: 1,
        fillOpacity: v === null ? 0.3 : 0.9,
        opacity: 1
      }
    },
    onEachFeature: (ft: any, layer: any) => {
      const v = getValue(ft)
      const m = getMetrics(ft) || {}
      const name = ft.properties.LGA_Name || 'LGA'
      const code = ft.properties.LGA_Code || ''

      layer.bindPopup(`
        <div style="font-size:13px;line-height:1.6">
          <div style="font-weight:800;color:#111">${name}</div>
          <div><b>LGA Code:</b> ${code}</div>
          <div><b>Year:</b> ${year}</div>
          <div><b>Domain:</b> ${currentDomain.value}</div>
          <div><b>Vulnerability:</b> ${v !== null && !isNaN(v) ? v.toFixed(1) + '%' : 'No data'}</div>
          ${m.valid_n ? `
            <hr style="border:none;border-top:1px solid #eee"/>
            <div><b>Sample size:</b> ${Math.round(m.valid_n).toLocaleString()}</div>
            <div><b>Vulnerable count:</b> ${Math.round(m.vuln_n).toLocaleString()}</div>
          ` : ''}
        </div>
      `)

      layer.on({
        mouseover: (e: any) => {
          e.target.setStyle({ weight: 3, color: '#6b7280' })
          e.target.bringToFront()
        },
        mouseout: (e: any) => geoJsonLayer.resetStyle(e.target)
      })
    }
  }).addTo(map)

  if (!map._fitted) {
    try {
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] })
      map._fitted = true
    } catch (e) {
      console.warn('fitBounds failed', e)
    }
  }
}

function playAnimation() {
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
    return
  }

  playTimer = setInterval(() => {
    currentYearIndex.value = (currentYearIndex.value + 1) % YEARS.length
    updateMap()
  }, 1300)
}

function setYear(i: number) {
  currentYearIndex.value = i
  updateMap()
}

function goToLink(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <!-- Hero Section -->
  <section class="data-hero">
    <div class="hero-content">
      <h1>Data Insights</h1>
      <p>Discover how children across Australia are developing by age 5 and why everyday moments shape their future.</p>
    </div>
  </section>

  <section class="insights-container">
    <div class="kicker">Why the First 5 Years Are So Critical</div>
    <div class="kicker-sub">Decades of neuroscience show early childhood is the most important time for brain
      development.</div>

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
          <span class="fact-number">7:1</span>
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

    <!-- TRANSITION TO TRENDS -->
    <div class="container">
      <div class="transition-boxes">
        <div class="transition-box box-question">
          <div class="box-icon">🤔</div>
          <h3>The Big Question</h3>
          <p>
            These numbers reveal where children need support right now, but there's a bigger question: 
            <span class="question-highlight">Is childhood development improving or declining across Australia?</span>
          </p>
        </div>
        
        <div class="transition-box box-explore">
          <div class="box-icon">🔍</div>
          <h3>Let's Explore the Data</h3>
          <p>
            We'll examine 15 years of <span class="data-highlight">AEDC data (2009-2024) from children around age 5</span> 
            to see where many struggle when starting school and why the experiences in the first five years truly shape their future.
          </p>
        </div>
      </div>
    </div>

    <!-- Australian Reality Section -->
    <!-- NATIONAL HOOK + PILLS -->
    <div class="container section">
      <div class="title-xl">The Australian Reality: What the Data Shows</div>
      
      <div class="stats">
        <div class="stat">
          <div class="big">23.5%</div>
          <div style="font-weight:600; margin-bottom:8px;">Children Developmentally Vulnerable</div>
          <div style="font-size:14px; line-height:1.5;">In Australia 2024, nearly 1 in 4 children are at risk of developmental delays</div>
          <div style="margin-top:12px; color:#10b981; font-weight:600; font-size:14px;">↓ Down from 23.6% (2009)</div>
        </div>
        <div class="stat">
          <div class="big">10.7%</div>
          <div style="font-weight:600; margin-bottom:8px;">Social Competence Challenges</div>
          <div style="font-size:14px; line-height:1.5;">Highest vulnerability area: Social skills (10.7%) and Physical health (10.0%)</div>
          <div style="margin-top:12px; color:#ef4444; font-weight:600; font-size:14px;">↑ Up from 9.4% (2009)</div>
        </div>
        <div class="stat">
          <div class="big">21.9%</div>
          <div style="font-weight:600; margin-bottom:8px;">Highest Vulnerability Rate</div>
          <div style="font-size:14px; line-height:1.5;">Northern Territory shows the highest rate of vulnerable children</div>
          <div style="margin-top:12px; color:#f59e0b; font-weight:600; font-size:14px;">⚠ Urgent intervention needed</div>
        </div>
        <div class="stat">
          <div class="big">0-3</div>
          <div style="font-weight:600; margin-bottom:8px;">Critical Window</div>
          <div style="font-size:14px; line-height:1.5;">Most important years for brain architecture formation</div>
          <div style="margin-top:12px; color:#8b5cf6; font-weight:600; font-size:14px;">⚡ Time-sensitive opportunity</div>
        </div>
      </div>
    </div>

    <div class="container section">
      <div class="explore-title">
        <h3>Explore the developmental challenges by area: </h3> 
        <h3 class="explore-data-source">Data source: Australian Early Development Census, surveying <span style="color: #f97316;">children aged around 5 years</span> in their first year of school</h3>
        <p class="explore-sub">Click on any domain below to see 15 years of trends and what they mean for your family
        </p>
      </div>
      <div class="pills" id="domainPills"></div>

      <!-- State Vulnerability Chart -->
      <div class="chart-container">
        <h3 style="font-size: 26px; margin-left: 30px; padding-left: 10px; border-left: #8b5cf6 4px solid; font-weight: 800;">State Vulnerability Trends</h3>
        <canvas id="stateVulnChart"></canvas>
      </div>

      <!-- Insights -->
      <div class="insight">
        <h3>&#128161; What This Means for You as a Parent:</h3>
        <p id="insight-1"><strong>Communication skills show concerning patterns fluctuating nationally, with state
            variations.</strong></p>
        <p id="insight-2"><strong>Early communication is foundational. The first 1,000 days are critical for
            communication skill development.</strong></p>
        <p class="good" id="insight-3">&#x2728; Good news: Talking, singing & responsive conversation builds strong
          foundations!</p>
      </div>

      <!-- <div class="next">&#128071; Now let's see where support is needed most inside Victoria.</div> -->
    </div>

    <!-- Victoria Map Section -->
    <!-- TRANSITION TO VICTORIA -->
    <div class="container">
      <div class="insight transition-insight">
        <h3 style="font-size:28px">🗺️ From National Trends to Your Neighborhood</h3>
        <p style="font-size:19px;margin:16px 0;line-height:1.75;color:#374151">
          You've seen the big picture across Australia. But here's what really matters: <b>your local community</b>.
        </p>
        <p style="font-size:19px;margin:16px 0;line-height:1.75;color:#374151">
          In Victoria alone, we track <b>480 statistical areas (SA2 level)</b> and the variation is dramatic. 
          Some neighborhoods have <b>0% vulnerability</b> in certain domains, while others reach <b>27%</b>. 
        </p>
        <p class="good" style="font-size:21px;margin-top:24px">
          ✨ Understanding your area helps you know where to focus your efforts and what support might be available nearby.
        </p>
      </div>
    </div>

    <VictoriaMapSection />

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
        Based on AEDC data from children aged around 5, these insights show where many little ones struggle when they start school 
        and why what happens in the first five years truly matters. 
        BrainBuilder turns this data into practical, everyday tips for parents.
      </p>
      <button class="cta-button" onclick="window.location.href='/activities'">
        Get Started
      </button>
      <p style="margin-top: 15px; font-size: 1.2rem; opacity: 0.8">
        &#10003; Age-appropriate activities &#10003; 5-minute daily tips &#10003; Track your
        child's progress
      </p>
    </div>

  </section>

  <!-- Tooltip -->
  <div v-if="tooltip.show" class="tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
    {{ tooltip.content }}
  </div>
</template>

<style>
/* Hero Section */
.data-hero {
  position: relative;
  width: 100%;
  height: 320px;
  /* background: linear-gradient(135deg, #FFC93C 0%, #FF66AA 100%); */
  background: url('../assets/dataInsightHero.jpg');
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  overflow: hidden;
  font-family: 'Nunito', sans-serif;
}

.data-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3); 
  z-index: 1;
}

.data-hero::after {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(237, 182, 129, 0.07);
  filter: blur(90px);
  animation: float 12s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 20px;
}

.data-hero h1 {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0 0 0.5rem;
}

.data-hero p {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  font-weight: 500;
  opacity: 0.95;
}

/* Container & sections */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.hero-container {
  padding-top: 40px;
}

.transition-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 48px 0;
}

.transition-box {
  position: relative;
  padding: 32px 28px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.transition-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  transition: height 0.3s;
}

.transition-box:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.18);
}

.transition-box:hover::before {
  height: 8px;
}

.box-question {
  background: linear-gradient(135deg, #fef3c7 0%, #fff9e6 100%);
  border-left: 5px solid #fbbf24;
}

.box-question::before {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.box-explore {
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
  border-left: 5px solid #0ea5e9;
}

.box-explore::before {
  background: linear-gradient(90deg, #0ea5e9, #0284c7);
}

.box-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.transition-box h3 {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.box-question h3 {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.box-explore h3 {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.transition-box p {
  margin: 0;
  font-size: 18px;
  line-height: 1.8;
  color: #374151;
}

.box-question .question-highlight {
  font-weight: 800;
  color: #d97706;
  background: rgba(251, 191, 36, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.box-explore .data-highlight {
  font-weight: 800;
  color: #0284c7;
  background: rgba(14, 165, 233, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .transition-boxes {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .box-icon {
    font-size: 40px;
  }
  
  .transition-box h3 {
    font-size: 20px;
  }
  
  .transition-box p {
    font-size: 16px;
  }
}

.section {
  background: var(--card);
  border-radius: 24px;
  box-shadow: 0 12px 50px rgba(0, 0, 0, .15);
  padding: 40px;
  margin: 32px auto;
  animation: fadeInUp .8s ease-out;
  position: relative;
  overflow: hidden;
  transition: all .4s cubic-bezier(.4, 0, .2, 1);
}

.section::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 24px;
  background: white;
  opacity: 0;
  transition: opacity .5s;
  z-index: -1;
}

.section:hover::before {
  opacity: 1;
}

.section:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
}

.transition-text {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.transition-text p {
  font-size: 26px;
  line-height: 1.7;
  color: #232323;
  font-weight: 700;
}

.highlight {
  background: #f97316;;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.transition-insight {
  margin: 48px auto;
  max-width: 1110px;
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.stat {
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, .1);
  transition: all .4s cubic-bezier(.4, 0, .2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.stat::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(241, 158, 99, 0.15), transparent);
  transition: left .6s;
}

.stat:hover {
  transform: translateY(-12px) scale(1.05);
  box-shadow: 0 20px 50px rgba(241, 135, 99, 0.3);
  border-color: #f39755;
}

.stat:hover::before {
  left: 100%;
}

.stat .big {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #f39755, #eb7fae);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  animation: pulse 2.5s ease-in-out infinite;
}

/* Titles */
.title-xl {
  font-size: 52px;
  font-weight: 800;
  margin-bottom: 20px;
  color: #111827;
  position: relative;
  display: inline-block;
  line-height: 1.2;
}

.title-xl::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #f39755, #eb7fae);
  border-radius: 2px;
}

/* Pills */
.explore-title {
  text-align: center;
  margin: 48px 0 24px;
  animation: fadeInUp .8s ease-out;
}

.explore-title h3:first-child {
  font-size: 36px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #111827, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}
.explore-title .explore-data-source {
  font-size: 21px;
  color: #2b2d33;
  margin: 0 0 12px;
  font-weight: 600;
}
.explore-sub {
  font-size: 20px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

/* Insights Layout */
.insights-container {
  padding: 3rem 1.25rem 4rem;
  max-width: 1250px;
  margin: 0 auto;
  background: #fcfaf6;
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
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

.cards3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 24px;
  width: 100%;
}

.note {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.note::after {
  content: "→";
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 24px;
  color: #6366f1;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.note:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
  border-color: #6366f1;
}

.note:hover::after {
  opacity: 1;
  transform: translateX(0);
}

.note h4 {
  margin: 0 0 12px;
  font-size: 22px;
  color: #111827;
  transition: color 0.3s;
  font-weight: 700;
}

.note:hover h4 {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.foot {
  margin-top: 16px;
  color: #9ca3af;
  font-size: 13px;
  font-style: italic;
}

/* Australian Reality Section */
.australian-section {
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin: 40px 0;
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.15);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #111827;
}

.lead {
  font-size: 1.3rem;
  line-height: 1.75;
  color: #1f2937;
  margin-bottom: 2rem;
}

.lead b {
  font-weight: 800;
  color: #111827;
}

.lead .hl {
  background: linear-gradient(135deg, #fef3c7, #fecaca);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.explore-title {
  text-align: center;
  margin: 48px 0 24px;
}

.explore-title h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 12px;
}

.explore-sub {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* Pills */
.pills {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 32px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid #e5e7eb;
  background: #fff;
  padding: 16px 28px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 17px;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.pill::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 999px;
  z-index: 0;
}

.pill>* {
  position: relative;
  z-index: 1;
}

.pill:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  border-color: #219d97;
}

.pill.active {
  background: linear-gradient(90deg, #35ccba, #219d97);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  animation: glow 2s infinite;
}

.pill.active::before {
  opacity: 0;
}

.pill span {
  font-size: 24px;
  animation: bounce 2s infinite;
}

/* Chart Container */
.chart-container {
  position: relative;
  height: 400px;
  margin: 30px 0;
}

/* Insight Box */
.insight {
  border-radius: 20px;
  background: linear-gradient(135deg, #fff9e6, #fff);
  border-left: 6px solid #d47e7b;
  padding: 24px 28px;
  position: relative;
  animation: fadeInUp 0.8s ease-out;
  box-shadow: 0 10px 30px rgba(250, 129, 96, 0.2);
  transition: all 0.4s;
  overflow: hidden;
}

.insight::before {
  content: "\01F4A1";
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 48px;
  opacity: 0.15;
  animation: float 3s infinite;
}

.insight:hover {
  transform: translateX(8px);
  box-shadow: 0 15px 40px rgba(250, 129, 96, 0.2);
  border-left-width: 8px;
}

.insight h3 {
  font-size: 30px;
  margin: 0 0 18px;
  background: linear-gradient(135deg, #f39755, #d55a90);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}

.insight p {
  font-size: 20px;
  margin: 14px 0;
  line-height: 1.75;
  color: #374151;
}

.insight .good {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #f39755, #ac5ad5);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 3s linear infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    text-shadow: 0 0 8px rgba(240, 129, 55, 0.3);
    background-position: 0% 50%;
  }

  50% {
    transform: scale(1.05);
    text-shadow: 0 0 20px rgba(236, 146, 90, 0.5);
    background-position: 100% 50%;
  }

  100% {
    transform: scale(1);
    text-shadow: 0 0 8px rgba(235, 182, 37, 0.3);
    background-position: 0% 50%;
  }
}


.next {
  margin: 20px 0 8px;
  color: #374151;
  font-weight: 600;
  font-size: 20px;
  text-align: center;
  animation: bounce 2s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

/* Map Section */
#vicMap {
  height: 600px;
  width: 100%;
  border-radius: 20px;
  margin-bottom: 24px;
  background: #f1f5f9;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  border: 3px solid transparent;
}

#vicMap:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
  border-color: #6366f1;
}

.map-controls {
  background: linear-gradient(135deg, #fff 0%, #f9fafb 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.map-controls:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border-color: #e0e7ff;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.year-badge {
  font-weight: 800;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.play-btn {
  width: 50px;
  height: 50px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  cursor: pointer;
  font-size: 20px;
  color: #fff;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: scale(1.15);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.6);
}

.year-marks {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.year-marks button {
  padding: 10px 20px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.year-marks button:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  transform: scale(1.1);
  border-color: transparent;
}

.year-marks button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.year-slider {
  width: 100%;
  height: 8px;
  background: linear-gradient(to right, #e5e7eb, #d1d5db);
  border-radius: 10px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  margin: 20px 0;
}

.year-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  cursor: pointer;
  transition: all 0.3s;
}

.year-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

.map-insight {
  border-radius: 20px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.4s;
  border: 2px solid transparent;
  margin-top: 20px;
}

.map-insight:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
  border-color: #6366f1;
  transform: translateY(-4px);
}

.map-insight h4 {
  margin: 0 0 12px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
}

.map-insight ul {
  margin: 12px 0 0 24px;
  line-height: 1.9;
  color: #374151;
  font-size: 1rem;
}

.map-legend {
  background: #fff;
  padding: 14px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

.legend-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}

.legend-gradient {
  height: 16px;
  width: 200px;
  border-radius: 8px;
  background: linear-gradient(to right, #10b981, #34d399, #fbbf24, #fb923c, #f87171, #dc2626);
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #374151;
  margin-top: 4px;
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
  background: linear-gradient(90deg,
      transparent,
      rgba(102, 126, 234, 0.1),
      transparent);
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
  background: linear-gradient(135deg, #36b761 0%, #38f9d7 100%);
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
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0.95;
}

.cta-section {
  background: linear-gradient(135deg, #e1b035 0%, #FF66AA 100%);
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
  font-size: 1.3rem;
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

.kicker {
  /* color: #333; */
  color: #f97316;
  font-size: 52px;
  font-weight: 800;
  text-align: center;
  margin: 24px auto;
  animation: slideInLeft 1s ease-out;
  /* text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2); */
  max-width: 1200px;
  line-height: 1.2;
}

.kicker-sub {
  color: #3e3e3e;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  max-width: 980px;
  margin: 0 auto 32px;
  animation: slideInRight 1s ease-out;
  line-height: 1.7;
}

.key-facts {
  /* background: linear-gradient(135deg, #FFC93C 0%, #FF66AA 100%); */
  background: linear-gradient(90deg, #f39755, #d55a90);
  color: white;
  padding: 40px;
  border-radius: 20px;
  margin: 10px 0;
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
  animation: bounce 2s infinite;
}

.fact-text {
  font-size: 1rem;
  opacity: 0.9;
}
</style>
