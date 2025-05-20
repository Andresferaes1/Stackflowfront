<template>
  <div class="welcome-container">
    <!-- Encabezado con botones -->
    <HeaderBar />
    
    <!-- Contenido principal en dos columnas -->
    <div class="main-content">
      <!-- Columna izquierda con texto y módulos -->
      <div class="left-column">
        <div class="intro-text">
          <h1>Bienvenido a StackFlow</h1>
          <p>Una plataforma modular para gestionar clientes, productos, cotizaciones y más.</p>
        </div>
        
        <!-- Cuadros de funcionalidades -->
        <div class="features">
          <div class="feature-box" v-for="feature in features" :key="feature.title">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- Columna derecha con la imagen -->
      <div class="right-column">
        <img src="@/assets/fondo.png" alt="StackFlow Platform" class="main-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderBar from '@/components/HeaderBar.vue'

const features = [
  { title: 'Clientes', description: 'Registra, consulta y administra tus clientes.' },
  { title: 'Mercancía', description: 'Control total de tus productos y stock.' },
  { title: 'Cotizaciones', description: 'Crea y gestiona cotizaciones de forma rápida.' },
  { title: 'Cantidades', description: 'Visualiza y actualiza inventario disponible.' },
]
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.welcome-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding-top: 60px; /* Para el HeaderBar fijo */
}

.main-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: calc(100vh - 60px);
}

/* Columna izquierda - texto y características */
.left-column {
  width: 50%;
  padding: 2%;
  margin-top: 2rem;
  flex-direction: column;
  justify-content: center;
}

.intro-text {
  margin-bottom: 2rem;
}

.intro-text h1 {
  font-size: 2.5rem;
  color: #003366;
  margin-bottom: 1rem;
}

.intro-text p {
  font-size: 1.2rem;
  color: #333;
  max-width: 90%;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
}

.feature-box {
  background: white;
  border-left: 5px solid #003366;
  border-radius: 6px;
  padding: 1.2rem;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-box h3 {
  margin: 0 0 0.5rem;
  color: #003366;
}

/* Columna derecha - imagen */
.right-column {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Mantiene la proporción y cubre todo el espacio */
}

/* Responsive */
@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }
  
  .left-column, .right-column {
    width: 100%;
  }
  
  .left-column {
    padding: 2rem;
  }
  
  .right-column {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .intro-text h1 {
    font-size: 2rem;
  }
  
  .left-column {
    padding: 1.5rem;
  }
}
</style>