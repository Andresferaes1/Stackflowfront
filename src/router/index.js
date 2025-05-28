import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import DashboardView from '@/views/DashboardView.vue';
import UserView from '@/views/UserView.vue';

// Creamos el router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    }, // Página principal

    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    }, // Acerca de la aplicación

    {
      path: '/register',
      name: 'register',
      component: RegisterView, // Asegúrate de que este componente exista
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Protegida por autenticación
      children: [
        {
          path: 'user',
          name: 'user-profile',
          component: () => import('@/views/UserView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '', // Ruta por defecto al acceder a /dashboard
          name: 'user-dashboard',
          component: UserView, // Vista de usuario
        },
        {
          path: 'clientes/nuevo',
          name: 'client-create',
          component: () => import('../views/clients/ClientCreateView.vue'),
        },
        {
          path: 'products/manage-stock',
          name: 'stock-management',
          component: () => import('../views/products/StockManagementView.vue'),
        },
        {
          path: 'products/upload',
          name: 'csv-upload',
          component: () => import('../views/products/CsvUploadView.vue'),
        },
        {
          path: 'products/read',
          name: 'product-read',
          component: () => import('../views/products/ProductReadView.vue'),
        },
        {
          path: 'products/detail/:id',
          name: 'product-detail',
          component: () => import('../views/products/ProductDetailView.vue'),
        },
        {
          path: 'cotizacion/nueva',
          name: 'quotation-create',
          component: () => import('../views/quotations/QuotationCreateView.vue'),
        },
      ],
    },
  ],
});

// Middleware para proteger rutas que requieren autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Cambiado a 'token'
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard'); // Evita volver al login si ya está autenticado
  } else {
    next();
  }
});

export default router;