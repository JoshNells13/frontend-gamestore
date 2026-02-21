<template>
    <div v-if="loading" class="text-center py-5">
        Loading...
    </div>

    <div v-else class="container py-5" style="max-width:600px">

        <h3 class="mb-4">Update Game</h3>

        <form @submit.prevent="handleSubmit">

            <div class="card mb-4">
                <div class="card-body">
                    <label class="form-label">Title</label>
                    <input v-model="game.title" class="form-control" required />
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <label class="form-label">Description</label>
                    <textarea v-model="game.description" class="form-control" rows="4" required></textarea>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <label class="form-label">Thumbnail</label>
                    <input type="file" class="form-control mb-2" @change="e => newThumbnail = e.target.files[0]" />

                    <img v-if="game.thumbnail" :src="`${baseURLStorage}/storage/${game.thumbnail}`" width="80" />
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <label class="form-label">File Game</label>
                    <input type="file" class="form-control mb-2" @change="e => newZip = e.target.files[0]" />

                    <b>Versions:</b>
                    <ul>
                        <li v-for="v in versions" :key="v.version">
                            v{{ v.version }} - {{ v.created_at }}
                        </li>
                    </ul>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <button class="btn btn-primary w-100" :disabled="saving">
                        {{ saving ? 'Saving...' : 'Submit' }}
                    </button>
                </div>
                <div class="col">
                    <router-link to="/manage-games" class="btn btn-danger w-100">
                        Back
                    </router-link>
                </div>
            </div>

        </form>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const baseURL = import.meta.env.VITE_API_URL
const baseURLStorage = import.meta.env.VITE_API_URL_STORAGE
const slug = route.params.slug

const loading = ref(true)
const saving = ref(false)

const game = reactive({
    title: '',
    description: '',
    thumbnail: ''
})

const versions = ref([])
const newThumbnail = ref(null)
const newZip = ref(null)

const fetchGame = async () => {
    try {
        const res = await api.get(`/v1/games/${slug}`)

        const data = res.data.game

        console.log('Game detail:', data)

        game.title = data.title
        game.description = data.description
        game.thumbnail = data.thumbnail
        versions.value = data.versions || []

    } finally {
        loading.value = false
    }
}

const handleSubmit = async () => {
    saving.value = true
    try {
        await api.put(`/v1/games/${slug}`, {
            title: game.title,
            description: game.description
        })

        if (newThumbnail.value || newZip.value) {
            const formData = new FormData()
            if (newThumbnail.value)
                formData.append('thumbnail', newThumbnail.value)
            if (newZip.value)
                formData.append('zipfile', newZip.value)

            await api.post(`/v1/games/${slug}/upload`, formData)
        }

        router.push('/manage-games')
    } finally {
        saving.value = false
    }
}

onMounted(fetchGame)
</script>