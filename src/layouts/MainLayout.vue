<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-primary navbar-dark">
    <div class="container">
      <router-link class="navbar-brand" to="/">Gaming Portal</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
          <!-- Administrator Menu -->
          <template v-if="auth.user?.role === 'administrator'">
            <li class="nav-item">
              <router-link to="/admins" class="nav-link px-2 text-white">List Admin</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/users" class="nav-link px-2 text-white">List User</router-link>
            </li>
          </template>

          <!-- User Menu -->
          <template v-if="auth.user?.role === 'user'">
            <li class="nav-item">
              <router-link to="/discover" class="nav-link px-2 text-white">Discover Games</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/manage-games" class="nav-link px-2 text-white">Manage Games</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="`/profile/${auth.user.username}`" class="nav-link px-2 text-white">User Profile</router-link>
            </li>
          </template>

          <li class="nav-item">
            <span class="nav-link active bg-dark rounded px-3 ms-lg-2">Welcome, {{ auth.user?.username }}</span>
          </li>
          <li class="nav-item">
            <button @click="auth.signOut" class="btn bg-white text-primary ms-lg-4 mt-2 mt-lg-0">Sign Out</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <router-view />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.navbar-nav .nav-link {
  transition: opacity 0.2s;
}
.navbar-nav .nav-link:hover {
  opacity: 0.8;
}
</style>
