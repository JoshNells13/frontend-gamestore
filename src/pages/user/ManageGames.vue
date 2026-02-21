<template>


  <main>
    <div class="hero py-5 bg-light">
      <div class="container">
        <router-link to="/manage-games/create" class="btn btn-primary">
          Add Game
        </router-link>
      </div>
    </div>

    <div class="list-form py-5">
      <div class="container">
        <h6 class="mb-3">List Games</h6>

        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <table v-else class="table table-striped">
          <thead>
            <tr>
              <th width="100">Thumbnail</th>
              <th width="200">Title</th>
              <th width="500">Description</th>
              <th width="250">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in authoredGames" :key="game.slug">
              <td>
                <img :src="game.thumbnail
                  ? `${baseURLStorage}/storage/${game.thumbnail}?v=${game.updated_at}`
                  : '/example_game/v1/thumbnail.png'" :alt="game.title" class="img-fluid rounded" style="max-height: 80px;" />
              </td>

              <td>{{ game.title }}</td>
              <td>{{ game.description }}</td>
              <td>
                <router-link :to="`/game/${game.slug}`" class="btn btn-sm btn-primary mb-1">Detail</router-link>
                <router-link :to="`/manage-games/${game.slug}/edit`"
                  class="btn btn-sm btn-secondary ms-1 mb-1">Update</router-link>
                <button @click="confirmDelete(game.slug)" class="btn btn-sm btn-danger ms-1 mb-1">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
const baseURL = import.meta.env.VITE_API_URL
const baseURLStorage = import.meta.env.VITE_API_URL_STORAGE
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const auth = useAuthStore()
const router = useRouter()
const authoredGames = ref([])
const loading = ref(true)


const fetchAuthoredGames = async () => {
  loading.value = true
  try {
    const response = await api.get(`/v1/users/${auth.user.username}/games`)

    authoredGames.value = response.data.games || []
    console.log('Fetched authored games:', authoredGames.value)
  } catch (error) {
    console.error('Failed to fetch authored games', error)
  } finally {
    loading.value = false
  }
}






const confirmDelete = async (slug) => {
  if (confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
    try {
      await api.delete(`/v1/games/${slug}`)
      fetchAuthoredGames()
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed')
    }
  }
}

onMounted(() => {
  if (auth.user) {
    fetchAuthoredGames()
  } else {
    router.push('/login')
  }
})


</script>
