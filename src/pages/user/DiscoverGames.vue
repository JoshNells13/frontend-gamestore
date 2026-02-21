<template>
  <main>
    <div class="hero py-5 bg-light">
      <div class="container text-center">
        <h1>Discover Games</h1>
      </div>
    </div>

    <div class="list-form py-5">
      <div class="container">
        <div class="row align-items-center mb-4">
          <div class="col">
            <h2 class="mb-0">{{ totalGames }} Game Available</h2>
          </div>

          <div class="col-lg-8 text-lg-end mt-3 mt-lg-0">
            <div class="btn-group me-2" role="group">
              <button type="button" class="btn"
                :class="params.sortBy === 'popularity' ? 'btn-secondary' : 'btn-outline-primary'"
                @click="setSortBy('popularity')">Popularity</button>
              <button type="button" class="btn"
                :class="params.sortBy === 'uploaddate' ? 'btn-secondary' : 'btn-outline-primary'"
                @click="setSortBy('uploaddate')">Recently Updated</button>
              <button type="button" class="btn"
                :class="params.sortBy === 'title' ? 'btn-secondary' : 'btn-outline-primary'"
                @click="setSortBy('title')">Alphabetically</button>
            </div>

            <div class="btn-group" role="group">
              <button type="button" class="btn"
                :class="params.sortDir === 'asc' ? 'btn-secondary' : 'btn-outline-primary'"
                @click="setSortDir('asc')">ASC</button>
              <button type="button" class="btn"
                :class="params.sortDir === 'desc' ? 'btn-secondary' : 'btn-outline-primary'"
                @click="setSortDir('desc')">DESC</button>
            </div>
          </div>
        </div>

        <div class="row">
          <div v-for="game in games" :key="game.slug" class="col-md-6 mb-3">
            <router-link :to="`/game/${game.slug}`" class="card card-default h-100 text-decoration-none text-dark">
              <div class="card-body">
                <div class="row">
                  <div class="col-4">
                    <img :src="game.thumbnail
                      ? `${baseURLStorage}/storage/${game.thumbnail}`
                      : '/example_game/v1/thumbnail.png'" :alt="game.title" class="img-fluid rounded">
                  </div>
                  <div class="col">
                    <h5 class="mb-1">{{ game.title }} <small class="text-muted">By {{ game.author }}</small></h5>
                    <div class="text-truncate-2">{{ game.description }}</div>
                    <hr class="mt-2 mb-2">
                    <div class="text-muted small">#scores submitted : {{ game.scoreCount }}</div>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Loading / Sentinel for Infinite Scroll -->
        <div ref="sentinel" class="text-center py-4">
          <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div v-else-if="noMoreData" class="text-muted">No more games to show</div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const baseURL = import.meta.env.VITE_API_URL
const baseURLStorage = import.meta.env.VITE_API_URL_STORAGE
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import api from '@/api'

const games = ref([])
const totalGames = ref(0)
const loading = ref(false)
const noMoreData = ref(false)
const sentinel = ref(null)

const params = reactive({
  page: 0,
  size: 10,
  sortBy: 'title',
  sortDir: 'asc'
})

let observer = null

const fetchGames = async (reset = false) => {
  if (loading.value || (noMoreData.value && !reset)) return

  loading.value = true
  if (reset) {
    games.value = []
    params.page = 0
    noMoreData.value = false
  }

  try {
    const response = await api.get('/v1/games', { params })
    const newGames = response.data.content

    if (newGames.length < params.size) {
      noMoreData.value = true
    }

    games.value = [...games.value, ...newGames]
    totalGames.value = response.data.totalElements
    params.page++
  } catch (error) {
    console.error('Failed to fetch games', error)
  } finally {
    loading.value = false
  }
}

const setSortBy = (val) => {
  params.sortBy = val
  fetchGames(true)
}

const setSortDir = (val) => {
  params.sortDir = val
  fetchGames(true)
}

onMounted(() => {
  fetchGames()

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading.value && !noMoreData.value) {
      fetchGames()
    }
  }, { threshold: 0.1 })

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-default {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-default:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
