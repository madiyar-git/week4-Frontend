import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';
import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '@/views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/tasks' },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/views/TasksView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    },
    {
      path: '/dev/base-button',
      name: 'base-button-demo',
      component: () => import('@/views/dev/BaseButtonDemo.vue')
    },
    {
      path: '/dev/base-input',
      name: 'base-input-demo',
      component: () => import('@/views/dev/BaseInputDemo.vue')
    },
    {
      path: '/tasks/stats',
      name: 'use-api-demo',
      component: () => import('@/views/dev/UseApiDemo.vue')
    },
    {
      path: '/tasks/virtual',
      name: 'virtual-list-demo',
      component: () => import('@/views/dev/VirtualListDemo.vue')
    }
  ]
});

router.beforeEach((to) => {
  const loading = useLoadingStore();
  loading.start();

  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login';
  }

  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) {
    return '/tasks';
  }
});

router.afterEach(() => {
  const loading = useLoadingStore();
  loading.finish();
});

router.onError((error, to) => {
  const loading = useLoadingStore();
  loading.finish();

  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  ) {
    window.location.assign(to.fullPath);
  }
});

export default router;
