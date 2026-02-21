import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/Login.vue'),
        meta: { guest: true }
    },
    {
        path: '/signup',
        name: 'Signup',
        component: () => import('@/pages/Signup.vue'),
        meta: { guest: true }
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('@/pages/Home.vue')
            },
            // Admin Routes
            {
                path: 'admins',
                name: 'AdminList',
                component: () => import('@/pages/admin/AdminList.vue'),
                meta: { role: 'administrator' }
            },
            {
                path: 'users',
                name: 'UserList',
                component: () => import('@/pages/admin/UserList.vue'),
                meta: { role: 'administrator' }
            },
            // User Routes
            {
                path: 'discover',
                name: 'DiscoverGames',
                component: () => import('@/pages/user/DiscoverGames.vue')
            },
            {
                path: 'manage-games',
                name: 'ManageGames',
                component: () => import('@/pages/user/ManageGames.vue')
            },
            {
                path: '/manage-games/:slug/edit',
                component: () => import('@/pages/user/EditGame.vue'),
            },
            {
                path: 'manage-games/create',
                component: () => import('@/pages/user/CreateGame.vue'),
            },
            {
                path: 'profile/:username',
                name: 'UserProfile',
                component: () => import('@/pages/user/UserProfile.vue')
            },
            {
                path: 'game/:slug',
                name: 'GameDetail',
                component: () => import('@/pages/user/GameDetail.vue')
            },

        ]
    },
    {
        path: '/forbidden',
        name: 'Forbidden',
        component: () => import('@/pages/Forbidden.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next('/login')
    } else if (to.meta.guest && auth.isAuthenticated) {
        next('/')
    } else if (to.meta.role && auth.user?.role !== to.meta.role) {
        next('/forbidden')
    } else {
        next()
    }
})

export default router
