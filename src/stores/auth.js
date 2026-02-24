import { defineStore } from 'pinia'
import api from '@/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        loading: false,
        errors: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,

        isAdmin: (state) => state.user?.role === 'admin',
        isDeveloper: (state) => state.user?.role === 'developer',
        isPlayer: (state) => state.user?.role === 'player',

        // Bonus: generic role checker (future-proof 🔥)
        hasRole: (state) => (role) => state.user?.role === role,
    },

    actions: {
        async signIn(credentials) {
            this.loading = true
            this.errors = null

            try {
                const response = await api.post('/v1/auth/signin', credentials)

                const { token, user } = response.data
                // asumsi backend kirim:
                // { token: "...", user: { username: "...", role: "admin" } }

                this.token = token
                localStorage.setItem('token', token)

                this.user = user
                localStorage.setItem('user', JSON.stringify(user))

                return response.data

            } catch (error) {
                this.errors =
                    error.response?.data?.violations ||
                    error.response?.data?.message ||
                    'Login failed'

                throw error
            } finally {
                this.loading = false
            }
        },

        async signUp(userData) {
            this.loading = true
            this.errors = null

            try {
                const response = await api.post('/v1/auth/signup', userData)
                return response.data
            } catch (error) {
                this.errors =
                    error.response?.data?.violations ||
                    error.response?.data?.message ||
                    'Signup failed'

                throw error
            } finally {
                this.loading = false
            }
        },

        async signOut() {
            try {
                await api.post('/v1/auth/signout')
            } catch (error) {
                console.error('Sign out error', error)
            } finally {
                this.token = null
                this.user = null
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
        }
    }
})