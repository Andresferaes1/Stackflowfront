import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import DashboardView from '@/views/DashboardView.vue';


// Creamos el router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }, // Página principal

    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    }, // Acerca de la aplicación

    {
      path: '/register',
      name: 'register',
      component: RegisterView // Asegúrate de que este componente exista
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      children: [
        {     
          path: 'clientes/nuevo',
          name: 'client-create',
          component: () => import('../views/clients/ClientCreateView.vue')
          }, 
          {
            path: 'products/manage-stock',
            name: 'stock-management',
            component: () => import('../views/products/StockManagementView.vue')
          },
          {
            path: 'products/upload',
            name: 'csv-upload',
            component: () => import('../views/products/CsvUploadView.vue')
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
                    
          ]
        
        },

        
        
    // NOTA: Las rutas hijas para clientes, productos y cotizaciones están comentadas abajo.
    // Puedes moverlas aquí o habilitarlas una por una si ya existen los archivos.

    /*
    // ---------- CLIENTS ----------
    {
      
    },
    {
      path: '/clients/update',
      name: 'client-update',
      component: () => import('../views/clients/ClientUpdateView.vue')
    },
    {
      path: '/clients/delete',
      name: 'client-delete',
      component: () => import('../views/clients/ClientDeleteView.vue')
    },
    {
      path: '/clients/read',
      name: 'client-read',
      component: () => import('../views/clients/ClientReadView.vue')
    },

    // ---------- PRODUCTS ----------
    {
      path: '/products/create',
      name: 'product-create',
      component: () => import('../views/products/ProductCreateView.vue')
    },
    {
      path: '/products/edit',
      name: 'product-edit',
      component: () => import('../views/products/ProductUpdateView.vue')
    },
    {
      path: '/products/delete',
      name: 'product-delete',
      component: () => import('../views/products/ProductDeleteView.vue')
    },
    {
      path: '/products/view',
      name: 'product-view',
      component: () => import('../views/products/ProductReadView.vue')
    },

    // ---------- QUOTATIONS ----------
    {
      path: '/quotations/create',
      name: 'quotation-create',
      component: () => import('../views/quotations/QuotationCreateView.vue')
    },
    {
      path: '/quotations/history',
      name: 'quotation-history',
      component: () => import('../views/quotations/QuotationHistoryView.vue')
    }
    */
  ]
});

export default router;
