<template>
    <div class="container py-5" style="max-width:600px">
        <h3 class="mb-4">Create Game</h3>

        <form @submit.prevent="saveGame">

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
                    <input type="file" class="form-control" @change="onThumbnailChange" />
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <label class="form-label">Game File (ZIP)</label>
                    <input type="file" class="form-control" @change="onFileChange" />
                </div>
            </div>

            <button class="btn btn-primary w-100" :disabled="saving">
                {{ saving ? 'Saving...' : 'Create Game' }}
            </button>

        </form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
import api from '@/api'

const router = useRouter()

const saving = ref(false)
const violations = ref(null)

const game = reactive({
    title: '',
    description: ''
})

const uploadFile = ref(null)
const thumbnail = ref(null)

const onFileChange = (e) => {
    uploadFile.value = e.target.files[0]
}

const onThumbnailChange = (e) => {
    thumbnail.value = e.target.files[0]
}

const saveGame = async () => {
    saving.value = true
    violations.value = null

    try {
        // 1️⃣ CREATE GAME
        const res = await api.post('/v1/games', game)
        const slug = res.data.data   // pastikan backend return slug

        // 2️⃣ UPLOAD FILE & THUMBNAIL (jika ada)
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

        router.push('/manage-games')

    } catch (error) {
        if (error.response?.status === 400) {
            violations.value = error.response.data.violations
        } else {
            alert(error.response?.data?.message || 'Create failed')
        }
    } finally {
        saving.value = false
    }

     // Refresh list after creation
}
</script>