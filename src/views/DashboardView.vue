<template>
  <div class="dashboard">
    <!-- Encabezado independiente: logo y bienvenida -->
    <header class="header">
      <div class="header-content">
        <img src="@/assets/logo.png" class="logo" alt="Logo de StackFlow" />
        <h1>Bienvenido, {{ userName }} !!</h1>
      </div>
    </header>

    <!-- Barra de navegación -->
    <div class="navbar-wrapper">
      <nav class="navbar" aria-label="Navegación principal">
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
            :aria-expanded="menus[key]"
            :aria-controls="`dropdown-${key}`"
          >
            {{ labels[key] }}
          </button>
          <div 
            class="dropdown-menu" 
            v-if="menus[key]"
            :id="`dropdown-${key}`"
            role="menu"
          >
            <button
              v-for="item in items"
              :key="item.text"
              @click="navigate(item.path)"
              role="menuitem"
              tabindex="0"
            >
              {{ item.text }}
            </button>
          </div>
        </div>
        <button 
          class="logout-button" 
          @click="logout" 
          aria-label="Cerrar sesión"
        >
          Cerrar Sesión
        </button>
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
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(event.target)) {
      clickedInside = true
    }
  })
  
  if (!clickedInside) {
    Object.keys(menus.value).forEach(key => {
      menus.value[key] = false
    })
  }
}

const labels = {
  clientes: 'Clientes',
  productos: 'Productos',
  cotizacion: 'Cotización',
  stackflow: 'StackFlow',
  cuenta: 'Mi Cuenta',
}

//botones barra de dashboard
const options = {
  clientes: [
    { text: 'Nuevo', path: '/dashboard/clientes/nuevo' },
    { text: 'Actualizar', path: '/clientes/actualizar' },
    { text: 'Borrar', path: '/clientes/borrar' },
    { text: 'Leer', path: '/clientes/leer' },
  ],
  productos: [
    { text: 'Gestionar Stock', path: '/dashboard/products/manage-stock' },
    { text: 'Cargar CSV', path: '/dashboard/products/upload' },
    { text: 'Eliminar', path: '/productos/eliminar' },
    { text: 'Consultar', path: '/dashboard/products/read' },
  ],
  cotizacion: [
    { text: 'Nueva', path: '/dashboard/cotizacion/nueva' },
    { text: 'Historial', path: '/cotizacion/historial' }
  ],
  
  stackflow: [
    { text: 'Sistema', path: '/stackflow/info' },
  ],
  cuenta: [  // Nueva opción
    { text: 'Mi Perfil', path: '/dashboard/user' },
  ],
}

function showMenu(menu) {
  // Cerrar todos los demás menús primero
  Object.keys(menus.value).forEach(key => {
    if (key !== menu) menus.value[key] = false
  })
  menus.value[menu] = true
}

function hideMenu(menu) {
  menus.value[menu] = false
}

function navigate(path) {
  // Cerrar todos los menús antes de navegar
  Object.keys(menus.value).forEach(key => {
    menus.value[key] = false
  })
  
  // Mostrar indicador de carga
  isLoading.value = true
  
  // Navegar a la ruta solicitada
  router.push(path).finally(() => {
    // Una vez completada la navegación, quitar el indicador de carga
    nextTick(() => {
      isLoading.value = false
    })
  })
}

function logout() {
  try {
    // Limpiar datos de sesión
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Redireccionar al login
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

onMounted(() => {
  // Primero verificar el token
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  // Si hay token, entonces cargar datos del usuario
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      userName.value = userData.name || 'Usuario'
    } else {
      userName.value = 'Usuario'
    }
  } catch (error) {
    console.error('Error al obtener datos de usuario:', error)
    userName.value = 'Usuario'
  }
  
  // Agregar listener para cerrar menús al hacer clic fuera
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
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
}

/* Reseteos y configuración base */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--background-light);
  font-family: sans-serif;
}

.dashboard {
  width: 90vw;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100vh;
}

/* Header y Logo */
.header {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.5rem 1rem;
  background-color: white;
  background-image: url('@/assets/Fondometal.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  justify-content: center; 
  display:flex
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;

}

.logo {
  width: 65px;
  height: auto;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

/* Barra de navegación */
.navbar-wrapper {
  width: 100%;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  background-color: #d29750;
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.5rem 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
  margin: 0;
}

/* Botones principales y logout */
.main-button,
.logout-button {
  background-color: #d0e229;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.logout-button {
  background-color: var(--danger-color);
  margin-left: auto;
}

.main-button:hover {
  background-color: #0fac21;
}

.logout-button:hover {
  background-color: #c0392b;
}

.main-button:focus,
.logout-button:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}

/* Menú dropdown */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: var(--shadow-medium);
  min-width: 160px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0;
}

.dropdown-menu button {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.15s;
}

.dropdown-menu button:hover,
.dropdown-menu button:focus {
  background-color: #eee;
}

.dropdown-menu button:focus {
  outline: 2px solid #0fac21;
  outline-offset: -2px;
}

/* Área de trabajo */
.workspace-area {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--background-white);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: var(--shadow-light);
  min-height: 400px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

/* Loader */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(0, 51, 102, 0.2);
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .main-button,
  .logout-button {
    width: 100%;
    padding: 0.75rem;
    text-align: center;
  }
  
  .logout-button {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .dropdown {
    width: 100%;
  }
  
  .dropdown-menu {
    width: 100%;
  }
  
  .workspace-area {
    padding: 1rem;
  }

  .header-content {
    justify-content: center;
    gap: 10px;
  }

  .logo {
    width: 50px;
  }

  .header h1 {
    font-size: 1.2rem;
  }
}
</style>
  