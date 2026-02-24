<template>
    <main>
        <div class="hero py-5 bg-light">
            <div class="container text-center">
                <h2 class="mb-3">
                    Manage User - Administrator Portal
                </h2>
                <div class="text-muted">
                    Tambah Pengguna Atau Developer Baru
                </div>
            </div>
        </div>

        <div class="py-5">
            <div class="container">

                <div class="row justify-content-center ">
                    <div class="col-lg-5 col-md-6">

                        <form @submit.prevent="saveUser">
                            <div class="form-item card card-default my-4">
                                <div class="card-body">
                                    <div class="form-group">
                                        <label for="username" class="mb-1 text-muted">Username <span
                                                class="text-danger">*</span></label>
                                        <input v-model="form.username" type="text" class="form-control"
                                            :class="{ 'is-invalid': violations?.username }" />
                                        <div v-if="violations?.username" class="invalid-feedback">{{
                                            violations.username.join(', ') }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-item card card-default my-4">
                                <div class="card-body">
                                    <div class="form-group">
                                        <label for="password" class="mb-1 text-muted">Password <span
                                                class="text-danger">*</span></label>
                                        <input v-model="form.password" type="password" class="form-control"
                                            :class="{ 'is-invalid': violations?.password }" />
                                        <div v-if="violations?.password" class="invalid-feedback">{{
                                            violations.password.join(', ') }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 row">
                                <div class="col">
                                    <button type="submit" class="btn btn-primary" :disabled="saving">
                                        {{ saving ? 'Saving...' : 'Save' }}
                                    </button>
                                </div>
                                <div class="col">
                                    <router-link to="/users" class="btn btn-danger w-100">Back</router-link>
                                </div>
                            </div>
                        </form>

                    </div>
                </div>

            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const router = useRouter()
const route = useRoute()

const username = route.params.username
const form = reactive({
    username: '',
    password: ''
})
const loading = ref(true)
const saving = ref(false)
const violations = ref(null)

const fetchUser = async () => {
    try {
        const res = await api.get(`/v1/users/${username}`)

        const data = res.data.Data


        console.log('users', data)

        form.username = data.username || []

    } finally {
        loading.value = false
    }
}


const saveUser = async () => {
    saving.value = true
    violations.value = null

    try {

        const payload = {
            username: form.username
        }


        if (form.password && form.password.trim() !== '') {
            payload.password = form.password
        }

        await api.put(`/v1/users/${route.params.username}`, payload)

        router.push('/users')

    } catch (error) {
        if (error.response?.status === 400) {
            violations.value = error.response.data.violations
        } else {
            alert(error.response?.data?.message || 'Update failed')
        }
    } finally {
        saving.value = false
    }
}

fetchUser()
</script>