<template>
  <main>
    <section class="login">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 col-md-6">
            <h1 class="text-center mb-4">Gaming Portal</h1>
            <div class="card card-default">
              <div class="card-body">
                <h3 class="mb-3">Sign In</h3>

                <form @submit.prevent="handleSignIn">
                  <div v-if="error" class="alert alert-danger">
                    {{ error }}
                  </div>

                  <!-- s: input -->
                  <div class="form-group my-3">
                    <label for="username" class="mb-1 text-muted">Username</label>
                    <input 
                      type="text" 
                      id="username" 
                      v-model="form.username" 
                      class="form-control" 
                      :class="{ 'is-invalid': violations?.username }"
                      autofocus 
                    />
                    <div v-if="violations?.username" class="invalid-feedback">
                      {{ violations.username.join(', ') }}
                    </div>
                  </div>

                  <!-- s: input -->
                  <div class="form-group my-3">
                    <label for="password" class="mb-1 text-muted">Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      v-model="form.password" 
                      class="form-control"
                      :class="{ 'is-invalid': violations?.password }"
                    />
                    <div v-if="violations?.password" class="invalid-feedback">
                      {{ violations.password.join(', ') }}
                    </div>
                  </div>

                  <div class="mt-4 row">
                    <div class="col">
                      <button type="submit" class="btn btn-primary w-100" :disabled="auth.loading">
                        {{ auth.loading ? 'Signing In...' : 'Sign In' }}
                      </button>
                    </div>
                    <div class="col">
                      <router-link to="/signup" class="btn btn-danger w-100">Sign up</router-link>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const error = ref('')
const violations = ref(null)

const handleSignIn = async () => {
  error.value = ''
  violations.value = null
  try {
    await auth.signIn(form)
    router.push('/')
  } catch (err) {
    if (err.response?.status === 400) {
      violations.value = err.response.data.violations
    } else {
      error.value = err.response?.data?.message || 'Login failed'
    }
  }
}
</script>
