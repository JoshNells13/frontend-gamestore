<template>
  <main>
    <div class="hero py-5 bg-light">
      <div class="container">
        <router-link to="/users/add" class="btn btn-primary">
          Add User
        </router-link>
      </div>
    </div>

    <div class="list-form py-5">
      <div class="container">
        <h6 class="mb-3">List Users</h6>

        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <table v-else class="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <!-- <th>Created at</th> -->
              <th>Last login</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.username">
              <td>
                <router-link :to="`/profile/${user.username}`" target="_blank">{{ user.username }}</router-link>
              </td>
              <!-- <td>{{ user.created_at }}</td> -->
              <td>{{ user.last_login_at }}</td>
              <td>
                <span :class="[user.is_blocked ? 'bg-danger' : 'bg-success', 'text-white p-1 d-inline-block']">
                  {{ user.is_blocked ? 'Blocked' : 'Active' }}
                </span>
              </td>
              <td>
                <router-link :to="`/users/${user.username}`"
                  class="btn btn-sm btn-secondary ms-1 mb-1">Update</router-link>
                <button @click="confirmDelete(user)" class="btn btn-sm btn-danger ms-1 mb-1">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const users = ref([])
const loading = ref(true)




const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/v1/users')
    users.value = response.data.user
    console.log(users.value)
  } catch (error) {
    console.error('Failed to fetch users', error)
  } finally {
    loading.value = false
  }
}


const confirmDelete = async (user) => {
  if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
    try {
      await api.delete(`/v1/users/${user.id}`)
      fetchUsers()
      alert('Successfully Delete')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user')
    }
  }
}

onMounted(fetchUsers)
</script>
