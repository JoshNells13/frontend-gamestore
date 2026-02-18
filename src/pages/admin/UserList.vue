<template>
  <main>
    <div class="hero py-5 bg-light">
      <div class="container">
        <button @click="openModal()" class="btn btn-primary">
          Add User
        </button>
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
              <th>Created at</th>
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
              <td>{{ user.created_at }}</td>
              <td>{{ user.last_login_at }}</td>
              <td>
                <span :class="[user.is_blocked ? 'bg-danger' : 'bg-success', 'text-white p-1 d-inline-block']">
                  {{ user.is_blocked ? 'Blocked' : 'Active' }}
                </span>
              </td>
              <td>
                <div v-if="!user.is_blocked" class="btn-group" role="group">
                  <button type="button" class="btn btn-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                    Lock
                  </button>
                  <ul class="dropdown-menu">
                    <li><button @click="blockUser(user.username, 'spamming')" class="dropdown-item">Spamming</button></li>
                    <li><button @click="blockUser(user.username, 'cheating')" class="dropdown-item">Cheating</button></li>
                    <li><button @click="blockUser(user.username, 'other')" class="dropdown-item">Other</button></li>
                  </ul>
                </div>
                <button v-else @click="unblockUser(user.username)" class="btn btn-primary btn-sm">Unlock</button>
                
                <button @click="openModal(user)" class="btn btn-sm btn-secondary ms-1">Update</button>
                <button @click="confirmDelete(user.username)" class="btn btn-sm btn-danger ms-1">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Form Modal -->
    <div class="modal fade" id="userModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Update User' : 'Add User' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input v-model="form.username" type="text" class="form-control" :class="{ 'is-invalid': violations?.username }" :disabled="editMode" />
                <div v-if="violations?.username" class="invalid-feedback">{{ violations.username.join(', ') }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="form.password" type="password" class="form-control" :class="{ 'is-invalid': violations?.password }" />
                <div v-if="violations?.password" class="invalid-feedback">{{ violations.password.join(', ') }}</div>
                <small v-if="editMode" class="text-muted">Leave blank to keep current password</small>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const users = ref([])
const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const violations = ref(null)

const form = reactive({
  username: '',
  password: ''
})

let modal = null

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/v1/users')
    users.value = response.data.users
  } catch (error) {
    console.error('Failed to fetch users', error)
  } finally {
    loading.value = false
  }
}

const openModal = (user = null) => {
  violations.value = null
  if (user) {
    editMode.value = true
    form.username = user.username
    form.password = ''
  } else {
    editMode.value = false
    form.username = ''
    form.password = ''
  }
  if (!modal) {
    modal = new bootstrap.Modal(document.getElementById('userModal'))
  }
  modal.show()
}

const saveUser = async () => {
  saving.value = true
  violations.value = null
  try {
    if (editMode.value) {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      await api.put(`/v1/users/${form.username}`, payload)
    } else {
      await api.post('/v1/users', form)
    }
    modal.hide()
    fetchUsers()
  } catch (error) {
    if (error.response?.status === 400) {
      violations.value = error.response.data.violations
    }
  } finally {
    saving.value = false
  }
}

const blockUser = async (username, reason) => {
  try {
    await api.post(`/v1/users/${username}/block`, { reason })
    fetchUsers()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to block user')
  }
}

const unblockUser = async (username) => {
  try {
    await api.post(`/v1/users/${username}/unblock`)
    fetchUsers()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to unblock user')
  }
}

const confirmDelete = async (username) => {
  if (confirm(`Are you sure you want to delete user ${username}?`)) {
    try {
      await api.delete(`/v1/users/${username}`)
      fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user')
    }
  }
}

onMounted(fetchUsers)
</script>
