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
        isAdmin: (state) => state.user?.role === 'administrator',
        isUser: (state) => state.user?.role === 'user',
    },

    actions: {
        async signIn(credentials) {
            this.loading = true
            this.errors = null

            try {
                const response = await api.post('/v1/auth/signin', credentials)

                const { token, role } = response.data

                this.token = token
                localStorage.setItem('token', token)

                // Simpan user minimal info
                this.user = {
                    username: credentials.username,
                    role: role
                }

                localStorage.setItem('user', JSON.stringify(this.user))

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
                this.errors = error.response?.data?.violations || error.response?.data?.message || 'Signup failed'
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
