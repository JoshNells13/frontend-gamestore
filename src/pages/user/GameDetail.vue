<template>
  <main v-if="game">
    <div class="hero py-5 bg-light">
      <div class="container text-center">
        <h2 class="mb-1">{{ game.title }}</h2>
        <router-link :to="`/profile/${game.author}`" class="btn btn-success">By {{ game.author }}</router-link>
        <div class="text-muted mt-2">{{ game.description }}</div>
        <h5 v-if="game.version" class="mt-2">Last Version {{ game.version }} ({{ game.last_updated_at }})</h5>
      </div>
    </div>

    <div class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-8">
            <!-- Game Iframe -->
            <div class="ratio ratio-16x9 shadow rounded mb-4 overflow-hidden">
              <iframe :src="game.gamePath" frameborder="0" allowfullscreen></iframe>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card mb-3 shadow-sm">
              <div class="card-body">
                <h5 class="card-title mb-3">Top 10 Leaderboard</h5>
                <ol v-if="scores.length > 0" class="list-group list-group-numbered">
                  <li 
                    v-for="(score, index) in topScores" 
                    :key="index"
                    class="list-group-item d-flex justify-content-between align-items-start border-0 ps-0"
                  >
                    <div class="ms-2 me-auto">
                      <span :class="{ 'fw-bold': score.username === auth.user?.username }">
                        {{ score.username }}
                        <span v-if="score.username === auth.user?.username" class="badge bg-info text-dark ms-1">(You)</span>
                      </span>
                    </div>
                    <span class="badge bg-primary rounded-pill">{{ score.score }}</span>
                  </li>
                </ol>
                
                <!-- User score if not in top 10 -->
                <template v-if="userScoreOutsideTop10">
                  <hr />
                  <div class="ps-4">
                    <span class="fw-bold">
                      {{ userScoreOutsideTop10.username }}
                      <span class="badge bg-info text-dark ms-1">(You)</span>
                    </span>
                    <span class="badge bg-primary rounded-pill float-end">{{ userScoreOutsideTop10.score }}</span>
                  </div>
                </template>
                
                <div v-if="scores.length === 0" class="text-muted text-center py-3">
                  No scores submitted yet
                </div>
              </div>
            </div>

            <div class="text-center">
              <img :src="game.thumbnail || '/example_game/v1/thumbnail.png'" alt="Thumbnail" class="img-fluid rounded shadow-sm mb-3">
              <a v-if="game.downloadPath" :href="game.downloadPath" class="btn btn-primary w-100 mb-2">Download Game</a>
              <router-link to="/discover" class="btn btn-danger w-100">Back</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <div v-else-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const route = useRoute()
const auth = useAuthStore()
const game = ref(null)
const scores = ref([])
const loading = ref(true)
let pollInterval = null

const slug = route.params.slug

const fetchGameData = async () => {
  try {
    const response = await api.get(`/v1/games/${slug}`)
    game.value = response.data.game
  } catch (error) {
    console.error('Failed to fetch game', error)
  } finally {
    loading.value = false
  }
}

const fetchScores = async () => {
  try {
    const response = await api.get(`/v1/games/${slug}/scores`)
    scores.value = response.data.scores || []
  } catch (error) {
    console.error('Failed to fetch scores', error)
  }
}

const topScores = computed(() => scores.value.slice(0, 10))

const userScoreOutsideTop10 = computed(() => {
  if (!auth.user) return null
  const userRankIndex = scores.value.findIndex(s => s.username === auth.user.username)
  if (userRankIndex >= 10) {
    return scores.value[userRankIndex]
  }
  return null
})

// Listen for message from game iframe for score submission
const handleMessage = async (event) => {
  // Assuming the game sends a message like { type: 'score', value: 100 }
  if (event.data && event.data.type === 'score') {
    try {
      await api.post(`/v1/games/${slug}/scores`, { score: event.data.value })
      fetchScores() // Refresh immediately
    } catch (error) {
      console.error('Failed to post score', error)
    }
  }
}

onMounted(() => {
  fetchGameData()
  fetchScores()
  pollInterval = setInterval(fetchScores, 5000)
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  window.removeEventListener('message', handleMessage)
})
</script>
