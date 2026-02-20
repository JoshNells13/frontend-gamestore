<template>


  <main>
    <div class="hero py-5 bg-light">
      <div class="container">
        <button @click="openCreateModal" class="btn btn-primary">
          Add Game
        </button>
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
              <img :src="game.thumbnail
                ? `${baseURL}/storage/${game.thumbnail}`
                : '/example_game/v1/thumbnail.png'" :alt="game.title" class="img-fluid rounded" />

              <td>{{ game.title }}</td>
              <td>{{ game.description }}</td>
              <td>
                <router-link :to="`/game/${game.slug}`" class="btn btn-sm btn-primary mb-1">Detail</router-link>
                <button @click="openUpdateModal(game)" class="btn btn-sm btn-secondary ms-1 mb-1">Update</button>
                <button @click="confirmDelete(game.slug)" class="btn btn-sm btn-danger ms-1 mb-1">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Game Form Modal (Create/Update) -->
    <!-- Unified Game Modal -->
    <div class="modal fade" id="gameModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">
              <span v-if="modalMode === 'game'">
                {{ editMode ? 'Update Game' : 'Add Game' }}
              </span>
              <span v-else>
                Upload New Version - {{ selectedGame?.title }}
              </span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">

            <!-- CREATE / UPDATE -->
            <div class="modal-body">
              <form @submit.prevent="saveGame">

                <!-- TITLE -->
                <div class="mb-3">
                  <label class="form-label">
                    Title <span class="text-danger">*</span>
                  </label>
                  <input v-model="gameForm.title" type="text" class="form-control"
                    :class="{ 'is-invalid': violations?.title }" required />
                  <div v-if="violations?.title" class="invalid-feedback">
                    {{ violations.title.join(', ') }}
                  </div>
                </div>

                <!-- DESCRIPTION -->
                <div class="mb-3">
                  <label class="form-label">
                    Description <span class="text-danger">*</span>
                  </label>
                  <textarea v-model="gameForm.description" class="form-control" rows="3" required></textarea>
                </div>

                <!-- ZIP FILE -->
                <div class="mb-3">
                  <label class="form-label">
                    Game ZIP File
                  </label>
                  <input type="file" @change="onFileChange" class="form-control" accept=".zip" />
                </div>

                <!-- THUMBNAIL -->
                <div class="mb-3">
                  <label class="form-label">
                    Thumbnail
                  </label>
                  <input type="file" @change="onThumbnailChange" class="form-control" accept=".jpg,.jpeg,.png" />
                </div>

                <div class="text-end">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                    Cancel
                  </button>

                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    {{ saving ? 'Saving...' : (editMode ? 'Update' : 'Create') }}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

  </main>
</template>

<script setup>
const baseURL = import.meta.env.VITE_API_URL
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const auth = useAuthStore()
const router = useRouter()
const authoredGames = ref([])
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const editMode = ref(false)
const violations = ref(null)
const selectedGame = ref(null)

const gameForm = reactive({
  title: '',
  description: ''
})

const uploadFile = ref(null)

const modalMode = ref('game') // 'game' | 'upload'

let gameModal = null

const fetchAuthoredGames = async () => {
  loading.value = true
  try {
    const response = await api.get(`/v1/users/${auth.user.username}/games`)

    authoredGames.value = response.data.games || []
  } catch (error) {
    console.error('Failed to fetch authored games', error)
  } finally {
    loading.value = false
  }
}


const openCreateModal = () => {
  editMode.value = false
  modalMode.value = 'game'
  gameForm.title = ''
  gameForm.description = ''
  violations.value = null

  if (!gameModal) {
    gameModal = new bootstrap.Modal(
      document.getElementById('gameModal')
    )
  }



  gameModal.show()
}


const openUpdateModal = (game) => {
  editMode.value = true
  modalMode.value = 'game'
  selectedGame.value = game
  gameForm.title = game.title
  gameForm.description = game.description
  violations.value = null

  if (!gameModal) {
    gameModal = new bootstrap.Modal(
      document.getElementById('gameModal')
    )
  }



  gameModal.show()
}



const saveGame = async () => {
  saving.value = true
  violations.value = null

  try {
    let slug = null

    // 1️⃣ CREATE / UPDATE GAME DATA
    if (editMode.value) {
      await api.put(`/v1/games/${selectedGame.value.slug}`, gameForm)
      slug = selectedGame.value.slug
    } else {
      const res = await api.post('/v1/games', gameForm)
      slug = res.data.data
    }

    // 2️⃣ UPLOAD FILE JIKA ADA
    if (uploadFile.value || thumbnail.value) {
      const formData = new FormData()
      if (uploadFile.value)
        formData.append('zipfile', uploadFile.value)
      if (thumbnail.value)
        formData.append('thumbnail', thumbnail.value)

      formData.append('token', auth.token)

      await api.post(`/v1/games/${slug}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    gameModal.hide()
    fetchAuthoredGames()

  } catch (error) {
    if (error.response?.status === 400) {
      violations.value = error.response.data.violations
    } else {
      alert(error.response?.data?.message || 'Operation failed')
    }
  } finally {
    saving.value = false
  }
}
const onFileChange = (e) => {
  uploadFile.value = e.target.files[0]
}

const thumbnail = ref(null)

const onThumbnailChange = (e) => {
  thumbnail.value = e.target.files[0]
}

// const handleUpload = async () => {
//   if (!uploadFile.value) return

//   uploading.value = true
//   const formData = new FormData()
//   formData.append('zipfile', uploadFile.value)
//   formData.append('thumbnail', thumbnail.value)
//   formData.append('token', auth.token) // Requirement: token as form parameter

//   try {
//     await api.post(`/v1/games/${selectedGame.value.slug}/upload`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     })
//     gameModal.hide()
//     fetchAuthoredGames()
//   } catch (error) {
//     alert(error.response?.data?.message || 'Upload failed')
//   } finally {
//     uploading.value = false
//   }
// }

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
