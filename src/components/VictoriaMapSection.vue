<template>
  <div class="container victoria-section">
    <div class="vic-header">
      <h2>🏠 Victoria Development Map</h2>
      <p>Explore early childhood development across 480 statistical areas (SA2 level) in Victoria</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div style="font-size:64px;margin-bottom:24px;animation:float 3s ease-in-out infinite">📂</div>
      <div style="font-size:22px;font-weight:800;color:#111827;margin-bottom:12px">Loading Victoria Data...</div>
      <div style="font-size:15px;color:#6b7280;line-height:1.6;max-width:400px;text-align:center">
        {{ loadingMessage }}
      </div>
      <div class="loading-bar">
        <div class="loading-progress" :style="{ width: loadingProgress + '%' }"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="loadError" class="error-state">
      <div style="font-size:64px;margin-bottom:20px">⚠️</div>
      <div style="font-size:24px;font-weight:800;color:#856404;margin-bottom:16px">Failed to Load Data</div>
      <div style="font-size:16px;color:#856404;line-height:1.7;max-width:600px;margin-bottom:24px">
        {{ loadError }}
      </div>
      <div class="required-files">
        <div style="font-weight:700;color:#92400e;margin-bottom:12px;font-size:15px">📋 Required Files:</div>
        <ul>
          <li><code>aedc_sa2_VIC_with_SA3_2009_2024.csv</code></li>
          <li><code>sal_sa2_pairs_VIC_2021_allMB.csv</code></li>
          <li><code>SA2_GEN.geojson</code></li>
        </ul>
      </div>
      <button @click="retryLoad" class="retry-btn">🔄 Retry Loading</button>
    </div>

    <!-- Main Content (only show when data is loaded) -->
    <template v-if="!isLoading && !loadError">
      <!-- Search Box -->
      <div class="vic-search-box">
        <div class="vic-search-input-wrapper">
          <input
            v-model="searchQuery"
            @input="filterSuggestions"
            @keypress.enter="searchSuburb"
            class="vic-search-input"
            placeholder="Type a suburb, e.g. Clayton, Carlton, Richmond…"
            autocomplete="off"
          />
          <div class="vic-autocomplete" :class="{ show: showSuggestions }">
            <div
              v-for="(item, index) in filteredSuggestions"
              :key="index"
              class="vic-autocomplete-item"
              @click="selectSuburb(item)"
            >
              <div class="vic-autocomplete-item-name">{{ item.SAL_NAME_2021 }}</div>
              <div class="vic-autocomplete-item-sa2">{{ item.SA2_NAME_2021 }}</div>
            </div>
            <div v-if="searchQuery.length >= 2 && filteredSuggestions.length === 0" 
                 style="padding:12px 18px;color:#999;font-style:italic">
              No suburbs found
            </div>
          </div>
        </div>
        <button class="vic-search-btn" @click="searchSuburb">Search</button>
      </div>

      <!-- Search Result -->
      <div class="vic-result" :class="{ show: searchResult !== null }">
        <div v-if="searchResult" v-html="searchResult"></div>
      </div>

      <!-- Info Boxes -->
      <div class="vic-info-box">
        <h4>ℹ️ Why Statistical Areas (SA2)?</h4>
        <p>
          We show results at SA2 level to protect children's privacy and provide stable statistics.
          Grouping nearby suburbs avoids re-identification and noisy rates.
        </p>
      </div>

      <div class="vic-info-box" style="background:linear-gradient(135deg,#fef3c7,#fff);border-left-color:#fbbf24">
        <h4>⚠️ About Missing Data</h4>
        <p style="margin:0;color:#92400e">
          Some areas may show "No data available" (N/A). This occurs when:
          <br>• Sample size is too small (fewer than 5 children) for privacy protection
          <br>• Data was not collected in that specific year
          <br>• The area boundary changed between survey waves
          <br><strong>Note:</strong> Empty cells ≠ 0%. They mean data was intentionally suppressed or unavailable.
        </p>
      </div>

      <!-- Domain Selection Pills -->
      <div class="explore-title" style="margin-top:24px">
        <h3>Select development domain:</h3>
        <p class="explore-sub">Click on any domain below to explore Victoria's 480 SA2 areas</p>
      </div>

      <div class="pills">
        <button
          v-for="(domain, index) in domains"
          :key="index"
          :class="['pill', { active: domain === selectedDomain }]"
          @click="selectDomain(domain)"
        >
          <span>{{ domainIcons[domain] }}</span> {{ domain }}
        </button>
      </div>

      <!-- Map Container -->
      <div class="vic-map-wrap">
        <div id="vicMap"></div>

        <!-- Legend -->
        <div class="vic-legend">
          <div class="vic-legend-text"><strong>Vulnerability:</strong> Low</div>
          <div class="vic-legend-gradient"></div>
          <div class="vic-legend-text">High</div>
          <div style="width:1px;height:20px;background:#ddd;margin:0 8px"></div>
          <div style="width:40px;height:16px;border-radius:4px;background:#e5e7eb;border:1px solid rgba(0,0,0,.2)"></div>
          <div class="vic-legend-text">No data</div>
        </div>

        <!-- Time Controls -->
        <div class="vic-timebar">
          <div class="vic-time-row">
            <button class="vic-play-btn" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
            <div class="vic-year-pill">{{ waves[0] }}</div>
            <div class="vic-slider-wrap">
              <div class="vic-year-gradient"></div>
              <input 
                type="range" 
                v-model.number="currentYearIndex"
                @input="onYearChange"
                min="0" 
                :max="waves.length - 1" 
                step="1"
                class="vic-year-slider"
              />
              <div class="vic-year-ticks">
                <span v-for="year in waves" :key="year">{{ year }}</span>
              </div>
            </div>
            <div class="vic-year-pill">{{ currentYear }}</div>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="insight" style="margin:32px 0">
        <h3>📊 What Victoria's Data Tells Us</h3>
        <div v-html="insightContent"></div>
      </div>

      <!-- Rankings -->
      <div class="vic-rankings">
        <h3>Top 10 SA2 Areas in Victoria — <span>{{ selectedDomain }}</span> (<span>{{ currentYear }}</span>)</h3>
        <p style="margin:8px 0 20px;color:#6b7280;font-size:15px">
          Comparing 480 statistical areas across Victoria. Left: communities doing well. Right: areas where targeted support can make the biggest difference.
        </p>
        <div class="vic-rankings-grid">
          <div class="vic-ranking-col vic-best">
            <h4>🏆 Top 10 Best</h4>
            <div v-html="bestRankingsHtml"></div>
          </div>
          <div class="vic-ranking-col vic-worst">
            <h4>⚠️ Top 10 Needs Support</h4>
            <div v-html="worstRankingsHtml"></div>
          </div>
        </div>
      </div>

      <!-- Key Takeaway -->
      <div style="margin-top:32px;padding:24px;background:linear-gradient(135deg,#eef2ff,#faf5ff);border-radius:16px;border-left:4px solid #667eea">
        <h4 style="margin:0 0 12px;font-size:18px;color:#1e40af;font-weight:700">🎯 The Bottom Line</h4>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#374151">
          Victoria's data shows that <b>where you live matters</b> — but it doesn't determine your child's future. 
          Communities with the best outcomes aren't necessarily the wealthiest; they're the ones where parents are engaged, 
          informed, and taking simple daily actions. <b>You have more power than you think.</b>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ======= CONFIG =======
const LOCAL_FILES = {
  aedc: 'https://child-health-bucket.s3.ap-southeast-2.amazonaws.com/aedc_sa2_VIC_with_SA3_2009_2024.csv',
  mapping: 'https://child-health-bucket.s3.ap-southeast-2.amazonaws.com/sal_sa2_pairs_VIC_2021_allMB.csv',
  geojson: 'https://child-health-bucket.s3.ap-southeast-2.amazonaws.com/SA2_GEN.geojson'
}

const domains = [
  'Physical health and wellbeing',
  'Social competence',
  'Emotional maturity',
  'Language and cognitive',
  'Communication skills'
]

const domainIcons = {
  'Physical health and wellbeing': '🏃',
  'Social competence': '👥',
  'Emotional maturity': '😊',
  'Language and cognitive': '🧠',
  'Communication skills': '💬'
}

const waves = [2009, 2012, 2015, 2018, 2021, 2024]

const VIC_INSIGHTS = {
  'Physical health and wellbeing': {
    headline: '8.5% of Victorian children show vulnerability in physical development',
    trend: 'This has increased from 7.6% in 2009 — a concerning +0.9% rise over 15 years.',
    why: 'Screen time and reduced outdoor play are likely contributors to declining physical development.',
    action: 'Even 15 minutes of active play daily makes a measurable difference. Outdoor play, dancing, and playground time dramatically boost physical development!',
    range: 'Vulnerability ranges from 0% in some areas to over 20% in others — showing huge community variation.'
  },
  'Social competence': {
    headline: '10.5% of Victorian children struggle with social skills',
    trend: 'This is the biggest increase of all domains: from 8.4% in 2009 to 10.5% in 2024 (+2.1%).',
    why: 'Reduced face-to-face social interaction and fewer playgroup opportunities may be contributing factors.',
    action: 'Simple family games, playdates, and conversations about feelings create strong social foundations. Group play is essential for school readiness!',
    range: 'Some Victorian communities have 0% vulnerability, while others reach 27% — a dramatic 27-point gap showing where support is most needed.'
  },
  'Emotional maturity': {
    headline: '9.9% of Victorian children need support with emotional regulation',
    trend: 'This has risen from 8.2% in 2009 (+1.7%) — the second-largest increase.',
    why: 'Learning to manage big emotions is challenging, and many children need more coaching in emotional skills.',
    action: 'Naming emotions, offering comfort, and staying calm during tantrums builds emotional intelligence day by day. You are your child\'s first and best teacher!',
    range: 'The variation across Victoria shows that community support and parenting resources make a real difference.'
  },
  'Language and cognitive': {
    headline: '7.1% of Victorian children show vulnerability in language and cognitive skills',
    trend: 'This has increased from 6.1% in 2009 (+1.0%).',
    why: '90% of brain development happens before age 5. Rich language exposure in early years has the highest payoff.',
    action: 'Reading together, asking open questions, and describing daily activities supercharge language development. Every conversation counts!',
    range: 'Communities with strong early literacy programs show significantly lower vulnerability rates.'
  },
  'Communication skills': {
    headline: '8.1% of Victorian children need support with communication',
    trend: 'Good news: This has slightly improved from 8.3% in 2009 (-0.2%).',
    why: 'Early intervention and increased awareness of communication development may be helping.',
    action: 'The first 1,000 days are critical. Talking, singing, and responsive conversation builds strong foundations from birth!',
    range: 'Victorian families are increasingly aware of communication milestones, but support remains uneven across regions.'
  }
}

// ======= STATE =======
const selectedDomain = ref(domains[0])
const currentYearIndex = ref(waves.length - 1)
const currentYear = computed(() => waves[currentYearIndex.value])
const isPlaying = ref(false)
const playTimer = ref(null)

const aedcData = ref([])
const suburbMapping = ref([])
const geojsonData = ref(null)

const isLoading = ref(true)
const loadError = ref(null)
const loadingMessage = ref('Initializing...')
const loadingProgress = ref(0)

const searchQuery = ref('')
const showSuggestions = ref(false)
const filteredSuggestions = ref([])
const searchResult = ref(null)

let map = null
let geoLayer = null

// ======= COMPUTED =======
const insightContent = computed(() => {
  const insight = VIC_INSIGHTS[selectedDomain.value]
  if (!insight) return ''
  
  return `
    <p style="font-size:20px;margin:14px 0;line-height:1.75;color:#374151">
      <b style="color:#1e40af">${insight.headline}</b>
    </p>
    <p style="font-size:18px;margin:14px 0;line-height:1.75;color:#374151">
      <b>The trend:</b> ${insight.trend}
    </p>
    <p style="font-size:18px;margin:14px 0;line-height:1.75;color:#374151">
      <b>Why this matters:</b> ${insight.why}
    </p>
    <p style="font-size:18px;margin:14px 0;line-height:1.75;color:#374151">
      <b>Community variation:</b> ${insight.range}
    </p>
    <p class="good" style="font-size:22px;font-weight:800;margin-top:20px">
      💡 What you can do: ${insight.action}
    </p>
  `
})

const bestRankingsHtml = computed(() => generateRankingsHtml(true))
const worstRankingsHtml = computed(() => generateRankingsHtml(false))

// ======= UTILITY FUNCTIONS =======
function parseCSV(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuote = false
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    
    if (inQuote) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuote = false
      } else {
        cell += ch
      }
    } else {
      if (ch === '"') {
        inQuote = true
      } else if (ch === ',') {
        row.push(cell)
        cell = ''
      } else if (ch === '\n') {
        row.push(cell)
        rows.push(row)
        row = []
        cell = ''
      } else if (ch !== '\r') {
        cell += ch
      }
    }
  }
  
  if (cell.length || row.length) {
    row.push(cell)
    rows.push(row)
  }
  
  const headers = rows.shift().map(h => h.trim())
  return rows
    .filter(r => r.length === headers.length)
    .map(r => {
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = (r[i] ?? '').trim()
      })
      return obj
    })
}

function normalizeSA2Code(code) {
  return String(code ?? '').replace(/\D/g, '').padStart(9, '0')
}

function toNum(v) {
  const x = parseFloat(v)
  return Number.isFinite(x) ? x : null
}

function getColor(v) {
  if (v == null) return '#e5e7eb'
  return v >= 25 ? '#b30000'
    : v >= 20 ? '#ff4d4d'
    : v >= 15 ? '#ff8a8a'
    : v >= 10 ? '#ffd6d6'
    : v >= 5 ? '#8fd19e'
    : '#d9f2e6'
}

function getBadge(v) {
  if (v == null) return { text: 'No data', color: '#999', icon: '❓' }
  if (v < 10) return { text: 'Low vulnerability', color: '#10b981', icon: '✓' }
  if (v < 20) return { text: 'Moderate vulnerability', color: '#f59e0b', icon: '⚠️' }
  return { text: 'High vulnerability', color: '#ef4444', icon: '⚠️⚠️' }
}

function createSparkline(sa2Code) {
  const trendData = waves.map(year => {
    const row = aedcData.value.find(d =>
      normalizeSA2Code(d.sa2_code) === normalizeSA2Code(sa2Code) &&
      d.domain === selectedDomain.value &&
      +d.year === year
    )
    return row ? toNum(row.vulnerable_pct) : null
  })

  const validData = trendData.filter(v => v != null)
  if (validData.length < 2) return ''

  const min = Math.min(...validData)
  const max = Math.max(...validData)
  const range = max - min || 1
  const w = 110
  const h = 32
  const pad = 3
  const step = w / (waves.length - 1)

  let path = ''
  trendData.forEach((v, i) => {
    if (v != null) {
      const x = i * step
      const y = h - ((v - min) / range) * (h - 2 * pad) - pad
      path += (path ? 'L' : 'M') + x + ',' + y
    }
  })

  if (!path) return ''

  return `
    <div style="background:#f8f9fa;border-radius:6px;padding:8px 10px;margin-top:8px">
      <svg width="${w}" height="${h}" style="display:block">
        <defs>
          <linearGradient id="lineGrad_${sa2Code}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.8"/>
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1"/>
          </linearGradient>
        </defs>
        <line x1="0" y1="${h/2}" x2="${w}" y2="${h/2}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="1,2" opacity="0.4"/>
        <path d="${path}" fill="none" stroke="url(#lineGrad_${sa2Code})" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
  `
}

function generateRankingsHtml(isBest) {
  const rows = aedcData.value
    .filter(d => d.domain === selectedDomain.value && +d.year === currentYear.value)
    .map(r => ({ ...r, v: toNum(r.vulnerable_pct) }))
    .filter(r => r.v != null)

  const sorted = isBest
    ? rows.sort((a, b) => a.v - b.v).slice(0, 10)
    : rows.sort((a, b) => b.v - a.v).slice(0, 10)

  return sorted.map((r, i) => `
    <div class="vic-ranking-item">
      <div class="vic-ranking-header">
        <span class="vic-ranking-num">#${i + 1}</span>
        <span class="vic-ranking-name">${r.sa2_name}</span>
        <span class="vic-ranking-val">${r.v.toFixed(1)}%</span>
      </div>
      ${createSparkline(r.sa2_code)}
    </div>
  `).join('')
}

// ======= DATA LOADING =======
async function loadLocalFiles() {
  try {
    isLoading.value = true
    loadError.value = null
    loadingProgress.value = 0

    // Step 1: Load AEDC data
    console.log('📁 Step 1/3: Loading AEDC data...')
    loadingMessage.value = 'Loading AEDC statistics...'
    loadingProgress.value = 10

    const aedcResponse = await fetch(LOCAL_FILES.aedc)
    if (!aedcResponse.ok) throw new Error(`AEDC file not found: ${LOCAL_FILES.aedc}`)
    
    const aedcText = await aedcResponse.text()
    loadingProgress.value = 20

    const parsedAedc = parseCSV(aedcText)
    console.log('✓ AEDC parsed, rows:', parsedAedc.length)
    
    if (parsedAedc.length === 0) {
      throw new Error('AEDC file is empty or invalid format')
    }

    aedcData.value = parsedAedc.map(r => ({
      state_name: r.state_name || r.State_name || r.STATE_NAME,
      sa3_code: r.sa3_code || r.SA3_code || r.SA3_CODE,
      sa3_name: r.sa3_name || r.SA3_name || r.SA3_NAME,
      sa2_code: normalizeSA2Code(r.sa2_code || r.SA2_code || r.SA2_CODE),
      sa2_name: r.sa2_name || r.SA2_name || r.SA2_NAME,
      domain: r.domain || r.Domain || r.DOMAIN,
      year: +(r.year || r.Year || r.YEAR),
      valid_n: +(r.valid_n || r.Valid_n || r.VALID_N || 0),
      vulnerable_n: +(r.vulnerable_n || r.Vulnerable_n || r.VULNERABLE_N || 0),
      vulnerable_pct: toNum(r.vulnerable_pct || r.Vulnerable_pct || r.VULNERABLE_PCT)
    }))

    loadingProgress.value = 40
    console.log('✓ AEDC data processed:', aedcData.value.length, 'rows')

    // Step 2: Load mapping data
    console.log('📁 Step 2/3: Loading suburb mapping...')
    loadingMessage.value = 'Loading suburb mappings...'
    
    const mappingResponse = await fetch(LOCAL_FILES.mapping)
    if (!mappingResponse.ok) throw new Error(`Mapping file not found: ${LOCAL_FILES.mapping}`)
    
    const mappingText = await mappingResponse.text()
    loadingProgress.value = 50

    const parsedMapping = parseCSV(mappingText)
    console.log('✓ Mapping parsed, rows:', parsedMapping.length)

    suburbMapping.value = parsedMapping.map(r => ({
      SAL_NAME_2021: r.SAL_NAME_2021,
      SA2_NAME_2021: r.SA2_NAME_2021,
      SA2_CODE_2021: normalizeSA2Code(r.SA2_CODE_2021)
    }))

    loadingProgress.value = 70
    console.log('✓ Mapping data processed:', suburbMapping.value.length, 'rows')

    // Step 3: Load GeoJSON
    console.log('📁 Step 3/3: Loading GeoJSON...')
    loadingMessage.value = 'Loading geographic boundaries...'
    
    const geojsonResponse = await fetch(LOCAL_FILES.geojson)
    if (!geojsonResponse.ok) throw new Error(`GeoJSON file not found: ${LOCAL_FILES.geojson}`)
    
    geojsonData.value = await geojsonResponse.json()
    loadingProgress.value = 90

    console.log('✓ GeoJSON loaded, features:', geojsonData.value.features?.length || 0)

    // Normalize SA2 codes in GeoJSON
    if (geojsonData.value && geojsonData.value.features) {
      geojsonData.value.features.forEach(feature => {
        if (feature.properties) {
          const code = feature.properties.sa2_code_2021 || 
                      feature.properties.SA2_MAINCODE_2021 || 
                      feature.properties.sa2_code
          feature.properties.sa2_code_norm = normalizeSA2Code(code)
        }
      })
    }

    loadingProgress.value = 100
    console.log('✅ All data loaded successfully!')

    // Small delay to show 100% progress
    await new Promise(resolve => setTimeout(resolve, 300))
    
    isLoading.value = false

  } catch (err) {
    console.error('❌ Error loading files:', err)
    loadError.value = err.message
    isLoading.value = false
  }
}

function retryLoad() {
  loadLocalFiles()
}

// ======= MAP FUNCTIONS =======
function renderMap() {
  if (!map || !geojsonData.value || !aedcData.value.length) {
    console.warn('Map not ready:', { map: !!map, geojson: !!geojsonData.value, aedc: aedcData.value.length })
    return
  }

  if (geoLayer) {
    map.removeLayer(geoLayer)
  }

  // Create lookup table for current domain/year
  const lut = {}
  aedcData.value
    .filter(d => d.domain === selectedDomain.value && +d.year === currentYear.value)
    .forEach(d => {
      const v = toNum(d.vulnerable_pct)
      if (v != null) {
        lut[d.sa2_code] = { value: v, ...d }
      }
    })

  console.log(`🗺️ Rendering map: ${Object.keys(lut).length} areas with data`)

  geoLayer = L.geoJSON(geojsonData.value, {
    style: (feature) => {
      const code = feature.properties.sa2_code_norm
      const data = lut[code]
      const v = data?.value

      return {
        fillColor: getColor(v),
        weight: 1,
        color: '#fff',
        opacity: 1,
        fillOpacity: v != null ? 0.8 : 0.15,
        dashArray: v == null ? '3,3' : null
      }
    },
    onEachFeature: (feature, layer) => {
      const code = feature.properties.sa2_code_norm
      const name = feature.properties.sa2_name_2021 || 
                   feature.properties.SA2_NAME_2021 || 
                   feature.properties.sa2_name
      const data = lut[code]
      const v = data?.value
      const badge = getBadge(v)

      const suburbs = suburbMapping.value
        .filter(s => s.SA2_CODE_2021 === code)
        .map(s => s.SAL_NAME_2021)
        .slice(0, 5)

      const suburbText = suburbs.length 
        ? `<div style="margin-top:8px;font-size:12px"><strong>Includes:</strong> ${suburbs.join(', ')}${suburbs.length === 5 ? ', …' : ''}</div>`
        : ''

      const sparkline = v != null ? createSparkline(code) : ''

      const popupContent = `
        <div style="min-width:260px;font-family:Inter,sans-serif">
          <div style="font-size:20px;font-weight:800;margin-bottom:6px;color:#111827;line-height:1.2">${name}</div>
          <div style="font-size:14px;color:#374151;margin-bottom:4px;font-weight:600">${currentYear.value}</div>
          <div style="font-size:13px;color:#6b7280;margin-bottom:16px">${selectedDomain.value}</div>
          ${v != null ? `
            <div style="font-size:48px;font-weight:800;color:${getColor(v)};margin-bottom:14px;line-height:1;letter-spacing:-1px">${v.toFixed(1)}%</div>
            <div style="display:inline-block;padding:10px 16px;background:${badge.color}1a;color:${badge.color};border-radius:20px;font-size:14px;font-weight:700;margin-bottom:16px;border:2px solid ${badge.color}40">
              ${badge.icon} ${badge.text}
            </div>
            ${sparkline}
          ` : `
            <div style="font-size:32px;font-weight:800;color:#9ca3af;margin-bottom:14px;line-height:1">N/A</div>
            <div style="display:inline-block;padding:10px 16px;background:#f3f4f622;color:#6b7280;border-radius:20px;font-size:14px;font-weight:700;margin-bottom:16px;border:2px solid #e5e7eb">
              ℹ️ No data available
            </div>
            <div style="padding:12px;background:#fef3c7;border-left:3px solid #fbbf24;border-radius:8px;font-size:13px;color:#92400e;line-height:1.5">
              <strong>Note:</strong> Data not collected for this area in ${currentYear.value}
            </div>
          `}
          ${suburbText}
        </div>`

      layer.bindPopup(popupContent, { maxWidth: 320 })
      
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({ weight: 3, color: '#667eea' })
        },
        mouseout: (e) => {
          geoLayer.resetStyle(e.target)
        }
      })
    }
  }).addTo(map)

  console.log('✓ Map rendered successfully')
}

// ======= SEARCH FUNCTIONS =======
function filterSuggestions() {
  const q = searchQuery.value.toLowerCase()
  if (q.length < 2) {
    showSuggestions.value = false
    filteredSuggestions.value = []
    return
  }

  // Get unique suburbs
  const uniqueSuburbs = new Map()
  suburbMapping.value.forEach(s => {
    if (!uniqueSuburbs.has(s.SAL_NAME_2021)) {
      uniqueSuburbs.set(s.SAL_NAME_2021, s)
    }
  })

  filteredSuggestions.value = [...uniqueSuburbs.values()]
    .filter(s => s.SAL_NAME_2021?.toLowerCase().includes(q))
    .slice(0, 10)
  
  showSuggestions.value = true
}

function selectSuburb(item) {
  searchQuery.value = item.SAL_NAME_2021
  showSuggestions.value = false
  searchSuburb()
}

function searchSuburb() {
  const q = searchQuery.value.trim()
  if (!q) {
    searchResult.value = null
    return
  }

  const suburb = suburbMapping.value.find(
    s => s.SAL_NAME_2021?.toLowerCase() === q.toLowerCase()
  )

  if (!suburb) {
    // Find similar suburbs
    const suggestions = suburbMapping.value
      .filter(s => s.SAL_NAME_2021?.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5)
      .map(s => s.SAL_NAME_2021)

    searchResult.value = `
      <h3>Suburb not found</h3>
      <p>We couldn't find "<em>${q}</em>". Please check the spelling.</p>
      ${suggestions.length ? `<p><strong>Did you mean:</strong> ${suggestions.join(', ')}</p>` : ''}
    `
    return
  }

  const sa2Code = suburb.SA2_CODE_2021
  const sa2Name = suburb.SA2_NAME_2021

  const row = aedcData.value.find(d =>
    d.sa2_code === sa2Code &&
    d.domain === selectedDomain.value &&
    +d.year === currentYear.value
  )

  const pct = row ? toNum(row.vulnerable_pct) : null
  const badge = getBadge(pct)

  // Get all suburbs in this SA2
  const allSuburbs = suburbMapping.value
    .filter(s => s.SA2_CODE_2021 === sa2Code)
    .map(s => s.SAL_NAME_2021)

  searchResult.value = `
    <h3>✓ Found: ${suburb.SAL_NAME_2021}</h3>
    <p style="font-size:15px"><strong>Statistical Area (SA2):</strong> ${sa2Name}</p>
    ${pct != null ? `
      <div style="font-size:40px;font-weight:800;color:${getColor(pct)};margin:16px 0">${pct.toFixed(1)}%</div>
      <div style="display:inline-block;padding:8px 14px;background:${badge.color}22;color:${badge.color};border-radius:12px;font-size:13px;font-weight:700;margin-bottom:12px">
        ${badge.icon} ${badge.text}
      </div>
    ` : `
      <div style="font-size:32px;font-weight:800;color:#9ca3af;margin:16px 0">N/A</div>
      <div style="display:inline-block;padding:8px 14px;background:#f3f4f622;color:#6b7280;border-radius:12px;font-size:13px;font-weight:700;margin-bottom:12px;border:2px solid #e5e7eb">
        ℹ️ No data available
      </div>
      <div style="padding:10px 14px;background:#fef3c7;border-left:3px solid #fbbf24;border-radius:8px;font-size:13px;color:#92400e;margin-bottom:12px;line-height:1.5">
        <strong>Note:</strong> Data not collected for this area in ${currentYear.value} for this domain.
      </div>
    `}
    <p style="font-size:14px;color:#666;margin:12px 0"><strong>Domain:</strong> ${selectedDomain.value} (${currentYear.value})</p>
    <p style="font-size:14px;margin:12px 0"><strong>This SA2 includes ${allSuburbs.length} suburb(s):</strong><br>${allSuburbs.join(', ')}</p>
  `

  // Zoom to area on map if found
  if (geojsonData.value && map) {
    const feature = geojsonData.value.features.find(f => 
      f.properties.sa2_code_norm === sa2Code
    )
    if (feature) {
      const bounds = L.geoJSON(feature).getBounds()
      map.fitBounds(bounds, { maxZoom: 12 })
    }
  }
}

// ======= TIME CONTROLS =======
function togglePlay() {
  if (isPlaying.value) {
    clearInterval(playTimer.value)
    playTimer.value = null
    isPlaying.value = false
  } else {
    isPlaying.value = true
    playTimer.value = setInterval(() => {
      currentYearIndex.value = (currentYearIndex.value + 1) % waves.length
    }, 1200)
  }
}

function onYearChange() {
  renderMap()
  // Update search result if visible
  if (searchResult.value && searchQuery.value) {
    searchSuburb()
  }
}

// ======= DOMAIN SELECTION =======
function selectDomain(domain) {
  selectedDomain.value = domain
}

function initMapSafely() {
  const el = document.getElementById('vicMap')
  if (!el) {
    console.warn('Waiting for map container...')
    setTimeout(initMapSafely, 300)
    return
  }

  try {
    map = L.map(el, { center: [-37.81, 144.96], zoom: 7 })
    renderMap()
  } catch (err) {
    console.error('❌ Error initializing map:', err)
  }
}

// ======= LIFECYCLE =======
onMounted(async () => {
  console.log('🚀 Victoria Map Section initializing...')

  // Initialize map
//   try {
//     map = L.map('vicMap', { minZoom: 6 }).setView([-37.8136, 144.9631], 8)
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       maxZoom: 12,
//       attribution: '© OpenStreetMap contributors'
//     }).addTo(map)
//     console.log('✓ Map initialized')
//   } catch (err) {
//     console.error('❌ Error initializing map:', err)
//   }

//   // Load local files
//   await loadLocalFiles()

//   // Render initial map
//   if (!loadError.value) {
//     renderMap()
//   }

    loadLocalFiles().then(() => {
        nextTick(() => {
        initMapSafely()
        })
    })

  // Setup click outside handler for autocomplete
  const handleClickOutside = (e) => {
    const wrapper = document.querySelector('.vic-search-input-wrapper')
    if (wrapper && !wrapper.contains(e.target)) {
      showSuggestions.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

onUnmounted(() => {
  if (playTimer.value) {
    clearInterval(playTimer.value)
  }
  if (map) {
    map.remove()
  }
})

// Watch for domain changes
watch(selectedDomain, () => {
  renderMap()
  // Update search result if visible
  if (searchResult.value && searchQuery.value) {
    searchSuburb()
  }
})

// Watch for year changes
watch(currentYear, () => {
  renderMap()
  // Update search result if visible
  if (searchResult.value && searchQuery.value) {
    searchSuburb()
  }
})
</script>

<style scoped>
/* Base styles */
.victoria-section {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.15);
  padding: 40px;
  margin: 32px auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Header */
.vic-header h2 {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px;
}

.vic-header p {
  margin: 0;
  color: #6b7280;
  font-size: 18px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f8f9fa, #fff);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.loading-bar {
  margin-top: 24px;
  width: 240px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 3px;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff3cd;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
}

.required-files {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #fbbf24;
  margin-bottom: 20px;
  max-width: 600px;
}

.required-files ul {
  text-align: left;
  margin: 0;
  padding-left: 24px;
  color: #78350f;
  font-size: 14px;
  line-height: 2;
}

.required-files code {
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.retry-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Search Box */
.vic-search-box {
  display: flex;
  gap: 10px;
  margin: 24px 0 16px;
}

.vic-search-input-wrapper {
  flex: 1;
  position: relative;
}

.vic-search-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
}

.vic-search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.vic-search-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.vic-search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Autocomplete */
.vic-autocomplete {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 2px solid #667eea;
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow: auto;
  display: none;
  z-index: 1000;
  margin-top: -2px;
}

.vic-autocomplete.show {
  display: block;
}

.vic-autocomplete-item {
  padding: 12px 18px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s;
}

.vic-autocomplete-item:hover {
  background: linear-gradient(135deg, #f8f9ff, #faf5ff);
}

.vic-autocomplete-item-name {
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
}

.vic-autocomplete-item-sa2 {
  font-size: 13px;
  color: #6b7280;
}

/* Result Box */
.vic-result {
  display: none;
  margin: 16px 0;
  padding: 20px;
  background: linear-gradient(135deg, #eef2ff, #faf5ff);
  border-left: 4px solid #667eea;
  border-radius: 12px;
}

.vic-result.show {
  display: block;
}

.vic-result h3 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #111827;
}

/* Info Box */
.vic-info-box {
  margin: 16px 0;
  background: linear-gradient(135deg, #fff9e6, #fff);
  border-left: 4px solid #fbbf24;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
}

.vic-info-box h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #92400e;
  font-weight: 700;
}

.vic-info-box p {
  margin: 0;
  color: #78350f;
  font-size: 14px;
  line-height: 1.6;
}

/* Pills */
.explore-title {
  text-align: center;
  margin: 48px 0 24px;
}

.explore-title h3 {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 12px;
}

.explore-sub {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.pills {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 24px 0;
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
}

.pill:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  border-color: #6366f1;
}

.pill.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.pill span {
  font-size: 24px;
}

/* Map */
.vic-map-wrap {
  position: relative;
  margin: 24px 0;
}

#vicMap {
  height: 500px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Legend */
.vic-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.vic-legend-gradient {
  width: 140px;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(
    to right,
    #d9f2e6,
    #8fd19e,
    #ffd6d6,
    #ff8a8a,
    #ff4d4d,
    #b30000
  );
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.vic-legend-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

/* Time Controls */
.vic-timebar {
  margin-top: 20px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #fafbfc, #fff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.vic-time-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.vic-play-btn {
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.vic-play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.vic-year-pill {
  min-width: 80px;
  padding: 12px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8f9fa, #fff);
  text-align: center;
  font-weight: 800;
  color: #2c3e50;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e5e7eb;
}

.vic-slider-wrap {
  position: relative;
  flex: 1;
  padding: 10px 0;
}

.vic-year-gradient {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 14px;
  border-radius: 8px;
  background: linear-gradient(
    to right,
    #d9f2e6 0%,
    #d9f2e6 16.666%,
    #8fd19e 16.666%,
    #8fd19e 33.333%,
    #ffd6d6 33.333%,
    #ffd6d6 50%,
    #ff8a8a 50%,
    #ff8a8a 66.666%,
    #ff4d4d 66.666%,
    #ff4d4d 83.333%,
    #b30000 83.333%,
    #b30000 100%
  );
  pointer-events: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.vic-year-slider {
  position: relative;
  width: 100%;
  appearance: none;
  height: 14px;
  background: transparent;
  outline: none;
  margin: 0;
  cursor: pointer;
  z-index: 1;
}

.vic-year-slider::-webkit-slider-thumb {
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff, #f8f9fa);
  border: 3px solid #667eea;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
  cursor: grab;
  transition: all 0.2s;
}

.vic-year-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.5);
}

.vic-year-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff, #f8f9fa);
  border: 3px solid #667eea;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
  cursor: grab;
  transition: all 0.2s;
}

.vic-year-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding: 0 2px;
}

.vic-year-ticks span {
  font-size: 13px;
  font-weight: 700;
  color: #5a6c7d;
  padding: 6px 10px;
  transition: all 0.2s;
  cursor: default;
}

.vic-year-ticks span:hover {
  color: #667eea;
  transform: translateY(-2px);
}

/* Insight Box */
.insight {
  border-radius: 20px;
  background: linear-gradient(135deg, #eef2ff 0%, #fce7f3 100%);
  border-left: 6px solid #60a5fa;
  padding: 24px 28px;
  position: relative;
  box-shadow: 0 10px 30px rgba(96, 165, 250, 0.2);
  transition: all 0.4s;
  overflow: hidden;
}

.insight::before {
  content: '💡';
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 48px;
  opacity: 0.15;
}

.insight:hover {
  transform: translateX(8px);
  box-shadow: 0 15px 40px rgba(96, 165, 250, 0.3);
  border-left-width: 8px;
}

.insight h3 {
  font-size: 30px;
  margin: 0 0 18px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}

.insight :deep(p) {
  font-size: 18px;
  margin: 14px 0;
  line-height: 1.75;
  color: #374151;
}

.insight :deep(.good) {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Rankings */
.vic-rankings {
  margin-top: 32px;
  padding: 28px;
  background: linear-gradient(135deg, #f8f9fa, #fff);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.vic-rankings h3 {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.vic-rankings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.vic-ranking-col h4 {
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 3px solid #e5e7eb;
  font-size: 18px;
  font-weight: 700;
}

.vic-rankings :deep(.vic-ranking-item) {
  padding: 14px;
  border-left: 4px solid transparent;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.vic-rankings :deep(.vic-ranking-item:hover) {
  transform: translateX(6px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.vic-best :deep(.vic-ranking-item) {
  border-left-color: #10b981;
}

.vic-worst :deep(.vic-ranking-item) {
  border-left-color: #ef4444;
}

.vic-rankings :deep(.vic-ranking-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.vic-rankings :deep(.vic-ranking-num) {
  font-weight: 800;
  color: #d1d5db;
  font-size: 15px;
  min-width: 32px;
}

.vic-rankings :deep(.vic-ranking-name) {
  font-weight: 700;
  flex: 1;
  margin: 0 12px;
  color: #111827;
  font-size: 15px;
}

.vic-rankings :deep(.vic-ranking-val) {
  font-weight: 800;
  font-size: 17px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Responsive */
@media (max-width: 1000px) {
  .vic-rankings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .victoria-section {
    padding: 24px;
  }

  .vic-header h2 {
    font-size: 24px;
  }

  .pills {
    gap: 10px;
  }

  .pill {
    padding: 12px 20px;
    font-size: 15px;
  }

  #vicMap {
    height: 400px;
  }

  .vic-time-row {
    flex-wrap: wrap;
  }
}

/* Leaflet Popup Styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 16px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25) !important;
  padding: 0 !important;
}

:deep(.leaflet-popup-content) {
  margin: 18px !important;
  line-height: 1.5 !important;
  font-size: 14px !important;
}

:deep(.leaflet-popup-tip) {
  display: none !important;
}

:deep(.leaflet-popup-close-button) {
  width: 32px !important;
  height: 32px !important;
  font-size: 24px !important;
  color: #9ca3af !important;
  top: 8px !important;
  right: 8px !important;
  border-radius: 8px !important;
  transition: all 0.2s !important;
}

:deep(.leaflet-popup-close-button:hover) {
  background: #f3f4f6 !important;
  color: #111827 !important;
  transform: scale(1.1) !important;
}
</style>