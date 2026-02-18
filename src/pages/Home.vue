<template>
  <main>
    <div class="hero py-5 bg-light">
      <div class="container text-center">
        <h1 class="mb-0 mt-0">Dashboard</h1>
      </div>
    </div>

    <div class="list-form py-5">
      <div class="container">
        <div class="alert alert-info">
          <h5>Welcome, {{ auth.user?.username }}.</h5>
          <p class="mb-0">Role: <span class="badge bg-primary">{{ auth.user?.role }}</span></p>
          <p class="mb-0">Last login: {{ auth.user?.last_login_at || 'Never' }}</p>
          <hr />
          Don't forget to sign out when you are finished using this page
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>
