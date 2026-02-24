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

         
            {
                path: 'admins',
                name: 'AdminList',
                component: () => import('@/pages/admin/AdminList.vue'),
                meta: { roles: ['admin'] }
            },
            {
                path: 'users',
                name: 'UserList',
                component: () => import('@/pages/admin/UserList.vue'),
                meta: { roles: ['admin'] }
            },
            {
                path: 'users/add',
                name: 'UserAdd',
                component: () => import('@/pages/admin/UserAdd.vue'),
                meta: { roles: ['admin'] }
            },
            {
                path: 'users/:username',
                name: 'UserEdit',
                component: () => import('@/pages/admin/UserEdit.vue'),
                meta: { roles: ['admin'] }
            },

            {
                path: 'manage-games',
                name: 'ManageGames',
                component: () => import('@/pages/user/ManageGames.vue'),
                meta: { roles: ['developer'] }
            },
            {
                path: 'manage-games/create',
                name: 'CreateGame',
                component: () => import('@/pages/user/CreateGame.vue'),
                meta: { roles: ['developer'] }
            },
            {
                path: 'manage-games/:slug/edit',
                name: 'EditGame',
                component: () => import('@/pages/user/EditGame.vue'),
                meta: { roles: ['developer'] }
            },


            {
                path: 'discover',
                name: 'DiscoverGames',
                component: () => import('@/pages/user/DiscoverGames.vue'),
                meta: { roles: ['player', 'developer', 'admin'] }
            },
            {
                path: 'profile/:username',
                name: 'UserProfile',
                component: () => import('@/pages/user/UserProfile.vue'),
                meta: { roles: ['player', 'developer', 'admin'] }
            },
            {
                path: 'game/:slug',
                name: 'GameDetail',
                component: () => import('@/pages/user/GameDetail.vue'),
                meta: { roles: ['player', 'developer', 'admin'] }
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
        return next('/login')
    }

    
    if (to.meta.guest && auth.isAuthenticated) {
        return next('/')
    }

 
    if (to.meta.roles) {
        if (!auth.user || !to.meta.roles.includes(auth.user.role)) {
            return next('/forbidden')
        }
    }

    next()
})

export default router