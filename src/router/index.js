// Importación de Vue Router para crear el sistema de navegación
import { createRouter, createWebHistory } from 'vue-router'

// Importación de las vistas principales que se cargan inmediatamente
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UserView from '@/views/UserView.vue'

// Creamos el router con configuración de historial HTML5
const router = createRouter({
  // Configuración para usar URLs limpias sin # (ejemplo: /dashboard en lugar de /#/dashboard)
  history: createWebHistory(import.meta.env.BASE_URL),

  // Definición de todas las rutas de la aplicación
  routes: [
    {
      path: '/', // URL raíz del sitio
      name: 'home', // Nombre interno para referenciar la ruta
      component: HomeView, // Componente que se renderiza en esta ruta
    },

    {
      path: '/about', // Ruta para página "Acerca de"
      name: 'about',
      // Carga lazy (solo cuando se necesite) para optimizar performance inicial
      component: () => import('../views/AboutView.vue'),
    },

    {
      path: '/register', // Ruta para registro de usuarios
      name: 'register',
      component: RegisterView,
    },

    {
      path: '/login', // Ruta para inicio de sesión
      name: 'login',
      component: LoginView,
    },

    {
      path: '/dashboard', // Ruta principal del panel de administración
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Metadato que indica que requiere autenticación

      // Rutas hijas que se renderizan dentro del componente DashboardView
      children: [
        {
          path: 'user', // URL completa: /dashboard/user
          name: 'user-profile',
          // Carga lazy del componente de perfil de usuario
          component: () => import('@/views/UserView.vue'),
          meta: { requiresAuth: true }, // También requiere autenticación
        },
        {
          path: '', // Ruta por defecto cuando se accede solo a /dashboard
          name: 'user-dashboard',
          component: UserView, // Vista principal del dashboard
        },

        // === SECCIÓN CLIENTES ===
        {
          path: 'clients/read', // URL completa: /dashboard/clients/read
          name: 'client-read',
          // Carga lazy de la vista unificada de consulta de clientes (búsqueda + detalles)
          component: () => import('../views/clients/ClientReadView.vue'),
          meta: {
            requiresAuth: true,
            section: 'clientes',
            description: 'Directorio de clientes',
          },
        },
        {
          path: 'clientes/nuevo', // URL completa: /dashboard/clientes/nuevo
          name: 'client-create',
          // Carga lazy del formulario de creación de clientes
          component: () => import('../views/clients/ClientCreateView.vue'),
          meta: {
            requiresAuth: true,
            section: 'clientes',
            description: 'Crear nuevo cliente',
          },
        },
        
        // === SECCIÓN PRODUCTOS ===
        {
          path: 'products/manage-stock', // URL completa: /dashboard/products/manage-stock
          name: 'stock-management',
          // Carga lazy de la gestión de inventario
          component: () => import('../views/products/StockManagementView.vue'),
          meta: {
            requiresAuth: true,
            section: 'productos',
            description: 'Gestión de inventario y stock',
          },
        },
        {
          path: 'products/upload', // URL completa: /dashboard/products/upload
          name: 'csv-upload',
          // Carga lazy del formulario de subida de CSV
          component: () => import('../views/products/CsvUploadView.vue'),
          meta: {
            requiresAuth: true,
            section: 'productos',
            description: 'Cargar productos desde archivo CSV',
          },
        },
        {
          path: 'products/read', // URL completa: /dashboard/products/read
          name: 'product-read',
          // Carga lazy de la lista de productos
          component: () => import('../views/products/ProductReadView.vue'),
          meta: {
            requiresAuth: true,
            section: 'productos',
            description: 'Consultar catálogo de productos',
          },
        },
        {
          path: 'products/detail/:id', // URL dinámica: /dashboard/products/detail/123
          name: 'product-detail',
          // Carga lazy del detalle de producto (:id es un parámetro dinámico)
          component: () => import('../views/products/ProductDetailView.vue'),
          meta: {
            requiresAuth: true,
            section: 'productos',
            description: 'Detalle del producto',
          },
        },

        // === SECCIÓN COTIZACIONES/VENTAS ===
        {
          path: 'cotizacion/nueva', // URL completa: /dashboard/cotizacion/nueva
          name: 'quotation-create',
          // Carga lazy del formulario de creación/edición de cotizaciones
          component: () => import('../views/quotations/QuotationCreateView.vue'),
          meta: {
            requiresAuth: true,
            section: 'ventas',
            description: 'Crear nueva cotización',
          },
        },
        {
          path: 'cotizacion/historial', // URL completa: /dashboard/cotizacion/historial
          name: 'quotation-history', // Nombre para referenciar esta ruta programáticamente
          // Carga lazy del historial de cotizaciones
          component: () => import('../views/quotations/QuotationHistoryView.vue'),
          meta: {
            requiresAuth: true,
            section: 'ventas',
            description: 'Historial de cotizaciones',
          },
        },
      ],
    },
  ],
})

// Middleware que se ejecuta ANTES de cada navegación de ruta
router.beforeEach((to, from, next) => {
  console.log(`🔄 Router: Navegando de "${from.path}" hacia "${to.path}"`)

  // Verifica si el usuario está autenticado buscando el token en localStorage
  const isAuthenticated = !!localStorage.getItem('access_token')

  console.log(`🔐 Usuario autenticado: ${isAuthenticated}`)
  console.log(`🔒 Ruta requiere auth: ${!!to.meta.requiresAuth}`)

  // Si la ruta requiere autenticación Y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('❌ Acceso denegado - Redirigiendo al login')
    next('/login') // Redirige al login
    return
  }

  // Si el usuario ya está autenticado e intenta ir al login
  if (to.path === '/login' && isAuthenticated) {
    console.log('ℹ️ Usuario ya autenticado - Redirigiendo al dashboard')
    next('/dashboard') // Redirige al dashboard para evitar loops
    return
  }

  // Validar que la ruta existe (solo para rutas hijas de dashboard)
  if (to.path.startsWith('/dashboard/') && to.path !== '/dashboard') {
    const routeExists = router.getRoutes().some((route) => {
      return (
        route.path === to.path ||
        (route.path.includes(':') && to.path.match(route.path.replace(/:\w+/g, '[^/]+')))
      )
    })

    if (!routeExists) {
      console.error(`❌ Ruta no encontrada: ${to.path}`)
      next('/dashboard') // Redirigir al dashboard principal
      return
    }
  }

  // ✅ MANEJO DE RUTAS NO ENCONTRADAS SIN COMPONENTE DEDICADO
  // Si la ruta no existe en absoluto, redirigir según el estado de autenticación
  const allPaths = router.getRoutes().map((route) => route.path)
  const pathExists = allPaths.some((path) => {
    if (path.includes(':')) {
      // Para rutas con parámetros, usar regex simple
      const regex = new RegExp('^' + path.replace(/:\w+/g, '[^/]+') + '$')
      return regex.test(to.path)
    }
    return path === to.path
  })

  if (!pathExists) {
    console.log(`⚠️ Ruta no encontrada: ${to.path} - Redirigiendo`)
    if (isAuthenticated) {
      next('/dashboard')
    } else {
      next('/')
    }
    return
  }

  // En cualquier otro caso, permite la navegación normal
  console.log('✅ Navegación permitida')
  next()
})

// Middleware que se ejecuta DESPUÉS de cada navegación exitosa
router.afterEach((to) => {
  console.log(`✅ Navegación completada: ${to.path}`)

  // Actualizar el título de la página según la ruta
  const defaultTitle = 'StackFlow - Sistema de Gestión'
  let pageTitle = defaultTitle

  if (to.meta.description) {
    pageTitle = `${to.meta.description} | StackFlow`
  } else if (to.name) {
    const routeNames = {
      home: 'Inicio',
      about: 'Acerca de',
      login: 'Iniciar Sesión',
      register: 'Registro',
      dashboard: 'Panel de Control',
      'user-profile': 'Mi Perfil',
      'client-read': 'Directorio de Clientes', // ✅ NUEVO
      'client-create': 'Crear Cliente',
      
      'stock-management': 'Gestión de Stock',
      'csv-upload': 'Cargar CSV',
      'product-read': 'Productos',
      'product-detail': 'Detalle del Producto',
      'quotation-create': 'Nueva Cotización',
      'quotation-history': 'Historial de Cotizaciones',
    }

    const routeName = routeNames[to.name] || to.name
    pageTitle = `${routeName} | StackFlow`
  }

  document.title = pageTitle

  // Log para debugging de navegación
  if (to.meta.section) {
    console.log(`📍 Sección activa: ${to.meta.section}`)
  }
})

// Manejo de errores de navegación
router.onError((error) => {
  console.error('❌ Error en el router:', error)

  // En caso de error grave, redirigir al dashboard o login
  const isAuthenticated = !!localStorage.getItem('access_token')
  if (isAuthenticated) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
})

// Debug: Mostrar todas las rutas registradas (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('📋 Rutas registradas en el router:')
  router.getRoutes().forEach((route, index) => {
    console.log(
      `  ${index + 1}. ${route.name}: ${route.path}${route.meta?.description ? ` (${route.meta.description})` : ''}`,
    )
  })
}

// Exporta el router para usarlo en main.js
export default router