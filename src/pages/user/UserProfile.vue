<template>
  <main v-if="profile">
    <div class="hero py-5 bg-light">
      <div class="container text-center">
        <h2 class="mb-1">{{ profile.username }}</h2>
        <h5 class="mt-2 text-muted">Last Login: {{ formatDate(profile.last_login_at) }}</h5>
      </div>
    </div>

    <div class="py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-md-10">
            
            <!-- Highscores Section -->
            <div v-if="profile.highscores?.length > 0" class="mb-5">
              <h5 class="mb-3">Highscores per Game</h5>
              <div class="card card-default shadow-sm mb-4">
                <div class="card-body">
                  <ol class="mb-0">
                    <li v-for="(score, index) in profile.highscores" :key="index" class="py-1">
                      <router-link :to="`/game/${score.game.slug}`">{{ score.game.title }} ({{ score.score }})</router-link>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <!-- Authored Games Section -->
            <div v-if="profile.authored_games?.length > 0">
              <h5 class="mb-3">Authored Games</h5>
              <router-link 
                v-for="game in profile.authored_games" 
                :key="game.slug"
                :to="`/game/${game.slug}`" 
                class="card card-default mb-3 text-decoration-none text-dark shadow-sm"
              >
                <div class="card-body">
                  <div class="row">
                    <div class="col-4 col-sm-3">
                      <img :src="game.thumbnail || '/example_game/v1/thumbnail.png'" :alt="game.title" class="img-fluid rounded">
                    </div>
                    <div class="col">
                      <h5 class="mb-1">{{ game.title }} <small class="text-muted">By {{ profile.username }}</small></h5>
                      <div class="text-truncate-2">{{ game.description }}</div>
                      <hr class="mt-2 mb-2">
                      <div class="text-muted small">#scores submitted : {{ game.scoreCount }}</div>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>

            <div v-if="!profile.highscores?.length && !profile.authored_games?.length" class="text-center py-5">
              <p class="text-muted">This user has no activity yet.</p>
            </div>

            <div class="text-center mt-4">
              <router-link to="/discover" class="btn btn-danger px-5">Back</router-link>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()
const profile = ref(null)
const loading = ref(true)

const fetchProfile = async () => {
  loading.value = true
  try {
    const response = await api.get(`/v1/users/${route.params.username}`)
    profile.value = response.data.Data
    console.log('Fetched profile', profile.value)
  } catch (error) {
    console.error('Failed to fetch profile', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

onMounted(fetchProfile)

// Refetch if route params change
watch(() => route.params.username, fetchProfile)
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
.card-default {
  transition: transform 0.2s;
}
.card-default:hover {
  transform: translateY(-2px);
}
</style>
