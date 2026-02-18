<template>
  <main>
    <div class="list-form py-5">
      <div class="container">
        <h6 class="mb-3">List Admin Users</h6>

        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <table v-else class="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Last login</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in admins" :key="admin.username">
              <td>{{ admin.username }}</td>
              <td>{{ admin.last_login_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const admins = ref([])
const loading = ref(true)

const fetchAdmins = async () => {
  try {
    const response = await api.get('/v1/admins')
    admins.value = response.data.content 
  } catch (error) {
    console.error('Failed to fetch admins', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAdmins)
</script>
