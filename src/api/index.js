import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Changed to root /api to access /user and /v1 routes
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response

            if (status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }

            if (status === 403) {
                // Handle blocked/forbidden
                alert(data.reason || 'Access Forbidden')
            }
        }
        return Promise.reject(error)
    }
)

export default api
