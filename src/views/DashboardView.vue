<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\DashboardView.vue -->
<template>
  <div class="dashboard">
    <!-- Encabezado independiente: logo y bienvenida -->
    <header class="header">
      <div class="header-content">
        <img src="@/assets/logo.png" class="logo" alt="Logo de StackFlow" />
        <h1>Bienvenido, {{ userName }} !!</h1>
      </div>
    </header>

    <!-- Barra de navegación mejorada -->
    <div class="navbar-wrapper">
      <nav class="navbar" aria-label="Navegación principal">
        <div class="navbar-container">
          <div class="navbar-left">
            <div
              class="dropdown"
              v-for="(items, key) in options"
              :key="key"
              @mouseenter="showMenu(key)"
              @mouseleave="hideMenu(key)"
              @keydown.escape="hideMenu(key)"
              @focusin="showMenu(key)"
            >
              <button
                class="main-button"
                :class="{ 'menu-active': menus[key] }"
                :aria-expanded="menus[key]"
                :aria-controls="`dropdown-${key}`"
              >
                <span class="button-content">
                  <span class="button-icon">{{ getIcon(key) }}</span>
                  <span class="button-text">{{ labels[key] }}</span>
                </span>
                <span class="button-arrow" :class="{ 'arrow-up': menus[key] }">▼</span>
              </button>
              <div class="dropdown-menu" v-if="menus[key]" :id="`dropdown-${key}`" role="menu">
                <button
                  v-for="item in items"
                  :key="item.text"
                  @click="navigate(item.path)"
                  role="menuitem"
                  tabindex="0"
                  class="dropdown-item"
                >
                  <span class="dropdown-icon">•</span>
                  <span class="dropdown-text">{{ item.text }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="navbar-right">
            <button class="logout-button" @click="logout" aria-label="Cerrar sesión">
              <span class="logout-icon">🚪</span>
              <span class="logout-text">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>
    </div>

    <!-- Área de trabajo dinámica -->
    <main class="workspace-area">
      <router-view v-if="!isLoading" />
      <div v-else class="loading">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const isLoading = ref(false)

// Estado para los menús
const menus = ref({
  clientes: false,
  productos: false,
  cotizacion: false,
  stackflow: false,
  cuenta: false,
})

// Handler para cerrar los menús cuando se hace clic afuera
const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll('.dropdown')

  // Si el clic no fue dentro de un dropdown, cerrar todos los menús
  let clickedInside = false
  dropdowns.forEach((dropdown) => {
    if (dropdown.contains(event.target)) {
      clickedInside = true
    }
  })

  if (!clickedInside) {
    Object.keys(menus.value).forEach((key) => {
      menus.value[key] = false
    })
  }
}

const labels = {
  clientes: 'Clientes',
  productos: 'Productos',
  cotizacion: 'Ventas',
  stackflow: 'Análisis',
  cuenta: 'Mi Cuenta',
}

// Iconos para cada sección
const getIcon = (key) => {
  const icons = {
    clientes: '👥',
    productos: '📦',
    cotizacion: '💰',
    stackflow: '📊',
    cuenta: '👤',
  }
  return icons[key] || '📋'
}

// ✅ CORRECCIÓN: Botones barra de dashboard con rutas corregidas
const options = {
  clientes: [
    { text: 'Nuevo Cliente', path: '/dashboard/clients/create' }, // ← CORREGIDO
    { text: 'Consultar Clientes', path: '/dashboard/clients/read' }, // ← CORREGIDO
  ],
  productos: [
    { text: 'Gestionar Stock', path: '/dashboard/products/manage-stock' },
    { text: 'Cargar CSV', path: '/dashboard/products/upload' },
    { text: 'Consultar Productos', path: '/dashboard/products/read' }, // ← QUITAR TYPO
  ],
  cotizacion: [
    { text: 'Nueva Cotización', path: '/dashboard/quotation/create' }, // ← SINGULAR
    { text: 'Historial', path: '/dashboard/quotation/history' }, // ← SINGULAR
  ],
  stackflow: [{ text: 'Información del Sistema', path: '/dashboard/system/info' }],
  cuenta: [{ text: 'Mi Perfil', path: '/dashboard/user' }],
}

function showMenu(menu) {
  // Cerrar todos los demás menús primero
  Object.keys(menus.value).forEach((key) => {
    if (key !== menu) menus.value[key] = false
  })
  menus.value[menu] = true
}

function hideMenu(menu) {
  menus.value[menu] = false
}

// ✅ FUNCIÓN NAVIGATE MEJORADA CON DEBUG:
function navigate(path) {
  console.log('🚀 DashboardView: Navegando a:', path)

  // Cerrar todos los menús antes de navegar
  Object.keys(menus.value).forEach((key) => {
    menus.value[key] = false
  })

  // Mostrar indicador de carga
  isLoading.value = true

  // ✅ VALIDAR QUE LA RUTA EXISTE ANTES DE NAVEGAR:
  const routeExists = router.getRoutes().some((route) => {
    // Verificar si existe una ruta que coincida con el path
    return route.path === path || route.path.replace(':id?', '') === path
  })

  if (!routeExists) {
    console.error('❌ Ruta no encontrada en el router:', path)
    console.log(
      '📋 Rutas disponibles:',
      router.getRoutes().map((r) => ({ name: r.name, path: r.path })),
    )
    isLoading.value = false
    alert(`Error: La ruta "${path}" no está configurada en el sistema.`)
    return
  }

  // Navegar a la ruta solicitada
  router
    .push(path)
    .then(() => {
      console.log('✅ Navegación exitosa a:', path)
    })
    .catch((error) => {
      console.error('❌ Error navegando a:', path, error)
      alert(`Error navegando a ${path}: ${error.message}`)
    })
    .finally(() => {
      // Una vez completada la navegación, quitar el indicador de carga
      nextTick(() => {
        isLoading.value = false
      })
    })
}

function logout() {
  try {
    console.log('🚪 Cerrando sesión...')

    // Limpiar datos de sesión
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    console.log('✅ Sesión cerrada correctamente')

    // Redireccionar al login
    router.push('/login')
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error)
  }
}

onMounted(() => {
  console.log('📍 DashboardView montado')

  // Verificar el token
  const token = localStorage.getItem('access_token')
  if (!token) {
    console.log('❌ No hay token, redirigiendo al login')
    router.push('/login')
    return
  }

  // Cargar datos del usuario
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      userName.value = userData.name || 'Usuario'
      console.log('✅ Usuario cargado:', userName.value)
    } else {
      userName.value = 'Usuario'
      console.log('⚠️ No hay datos de usuario, usando valor por defecto')
    }
  } catch (error) {
    console.error('❌ Error al obtener datos de usuario:', error)
    userName.value = 'Usuario'
  }

  // ✅ DEBUG: Mostrar rutas disponibles
  console.log('📋 Rutas disponibles en el router:')
  router.getRoutes().forEach((route) => {
    console.log(`  - ${route.name}: ${route.path}`)
  })

  // Agregar listener para cerrar menús al hacer clic fuera
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  console.log('📍 DashboardView desmontado')
  // Eliminar listener al desmontar el componente
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Variables CSS para mejor mantenimiento */
:root {
  --primary-color: #003366;
  --secondary-color: #f1c40f;
  --danger-color: #e74c3c;
  --hover-color: #005c8b;
  --border-color: #ccc;
  --background-light: #f9f9f9;
  --background-white: #ffffff;
  --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-medium: 0 2px 6px rgba(0, 0, 0, 0.2);
  --navbar-gradient: linear-gradient(145deg, #e6a146, #d29750, #be8540);
  --button-gradient: linear-gradient(145deg, #dce836, #d0e229, #bbcc1f);
  --button-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  --button-shadow-active: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Reseteos y configuración base */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--background-light);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard {
  width: 100vw;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100vh;
}

/* Header y Logo */
.header {
  width: 100%;
  padding: 0.75rem 2rem;
  background-color: white;
  background-image: url('@/assets/Fondometal.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  justify-content: center;
  display: flex;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  max-width: 1400px;
}

.logo {
  width: 65px;
  height: auto;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* Barra de navegación mejorada */
.navbar-wrapper {
  width: 100%;
  border-top: 3px solid #000;
  border-bottom: 3px solid #000;
  background: var(--navbar-gradient);
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 9999;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.navbar {
  width: 100%;
  padding: 0;
  margin: 0;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.navbar-right {
  display: flex;
  align-items: center;
}

/* Botones principales mejorados */
.main-button {
  background: var(--button-gradient);
  color: #2c3e50;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: var(--button-shadow);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 120px;
  font-size: 0.9rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.main-button:hover {
  background: linear-gradient(145deg, #e8f441, #dce836, #c7d324);
  transform: translateY(-1px);
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.main-button:active,
.main-button.menu-active {
  transform: translateY(1px);
  box-shadow: var(--button-shadow-active);
  background: linear-gradient(145deg, #c7d324, #bbcc1f, #a8b91c);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-icon {
  font-size: 1.1rem;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.2));
}

.button-text {
  font-weight: 600;
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.3);
}

.button-arrow {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
  margin-left: 0.3rem;
  color: #2c3e50;
}

.button-arrow.arrow-up {
  transform: rotate(180deg);
}

/* Botón de logout mejorado */
.logout-button {
  background: linear-gradient(145deg, #e74c3c, #c0392b, #a93226);
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow:
    0 4px 8px rgba(231, 76, 60, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.logout-button:hover {
  background: linear-gradient(145deg, #ec7063, #e74c3c, #d35400);
  transform: translateY(-1px);
  box-shadow:
    0 6px 12px rgba(231, 76, 60, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.logout-button:active {
  transform: translateY(1px);
  box-shadow:
    0 2px 4px rgba(231, 76, 60, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logout-icon {
  font-size: 1.1rem;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
}

.logout-text {
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.main-button:focus,
.logout-button:focus {
  outline: 3px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

/* Menú dropdown mejorado */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  background: linear-gradient(145deg, #ffffff, #f8f9fa, #e9ecef);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #ffffff;
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.1));
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1.2rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #2c3e50;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef, #dee2e6);
  color: var(--primary-color);
  transform: translateX(3px);
  box-shadow: inset 3px 0 0 var(--primary-color);
}

.dropdown-item:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

.dropdown-icon {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.2rem;
}

.dropdown-text {
  flex: 1;
}

/* Área de trabajo */
.workspace-area {
  position: relative;
  z-index: 1;
  overflow: visible;
  width: 100%;
  max-width: 1400px;
  margin: 1.5rem auto;
  padding: 2rem;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 2px 10px rgba(0, 0, 0, 0.04);
  min-height: 500px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

/* Loader mejorado */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px solid rgba(0, 51, 102, 0.2);
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading p {
  margin-top: 1rem;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive mejorado */
@media (max-width: 1200px) {
  .navbar-container {
    padding: 0.75rem 1rem;
  }

  .workspace-area {
    margin: 1rem;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .navbar-left {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .navbar-right {
    width: 100%;
    justify-content: center;
  }

  .main-button,
  .logout-button {
    min-width: 100px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .dropdown {
    flex: 1;
    min-width: 120px;
  }

  .main-button {
    width: 100%;
    justify-content: center;
  }

  .dropdown-menu {
    width: 100%;
    min-width: unset;
  }

  .workspace-area {
    margin: 0.5rem;
    padding: 1rem;
    border-radius: 8px;
  }

  .header-content {
    padding: 0 1rem;
    justify-content: center;
    gap: 15px;
  }

  .logo {
    width: 50px;
  }

  .header h1 {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .navbar-left {
    flex-direction: column;
    align-items: stretch;
  }

  .dropdown {
    width: 100%;
  }

  .main-button {
    width: 100%;
    margin-bottom: 0.25rem;
  }

  .button-content {
    justify-content: center;
  }

  .header {
    padding: 0.5rem 1rem;
  }

  .header-content {
    gap: 10px;
  }

  .logo {
    width: 40px;
  }

  .header h1 {
    font-size: 1rem;
  }
}
</style>
