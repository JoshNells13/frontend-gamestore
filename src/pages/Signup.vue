<template>
  <main>
    <div class="hero py-5 bg-light">
      <div class="container text-center">
        <h2 class="mb-3">Sign Up - Gaming Portal</h2>
        <div class="text-muted">
          Join us today to discover and manage your favorite games.
        </div>
      </div>
    </div>

    <div class="py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 col-md-6">
            <form @submit.prevent="handleSignUp">
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>
              <div v-if="success" class="alert alert-success">
                Registration successful! You can now <router-link to="/login">Sign In</router-link>.
              </div>

              <div class="form-item card card-default my-4">
                <div class="card-body">
                  <div class="form-group">
                    <label for="username" class="mb-1 text-muted">Username <span class="text-danger">*</span></label>
                    <input 
                      id="username" 
                      type="text" 
                      placeholder="Username" 
                      v-model="form.username"
                      class="form-control" 
                      :class="{ 'is-invalid': violations?.username }"
                    />
                    <div v-if="violations?.username" class="invalid-feedback">
                      {{ violations.username.join(', ') }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-item card card-default my-4">
                <div class="card-body">
                  <div class="form-group">
                    <label for="password" class="mb-1 text-muted">Password <span class="text-danger">*</span></label>
                    <input 
                      id="password" 
                      type="password" 
                      placeholder="Password" 
                      v-model="form.password"
                      class="form-control"
                      :class="{ 'is-invalid': violations?.password }"
                    />
                    <div v-if="violations?.password" class="invalid-feedback">
                      {{ violations.password.join(', ') }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 row">
                <div class="col">
                  <button type="submit" class="btn btn-primary w-100" :disabled="auth.loading">
                    {{ auth.loading ? 'Signing Up...' : 'Sign Up' }}
                  </button>
                </div>
                <div class="col">
                  <router-link to="/login" class="btn btn-danger w-100">Sign In</router-link>
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
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const form = reactive({
  username: '',
  password: ''
})

const error = ref('')
const success = ref(false)
const violations = ref(null)

const handleSignUp = async () => {
  error.value = ''
  violations.value = null
  success.value = false
  try {
    await auth.signUp(form)
    success.value = true
    form.username = ''
    form.password = ''
  } catch (err) {
    if (err.response?.status === 400) {
      violations.value = err.response.data.violations
    } else {
      error.value = err.response?.data?.message || 'Registration failed'
    }
  }
}
</script>
