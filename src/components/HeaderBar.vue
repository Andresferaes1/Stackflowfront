<template>
  <!-- Barra superior del encabezado -->
  <header class="header-bar">
    <!-- Sección izquierda: logo y título -->
    <div class="left-section">
      <img
        src="@/assets/logo.jpg"
        alt="Logo"
        class="logo"
        width="65"
        height="65"
      />
      <h1 class="title"> </h1>
    </div>

    <!-- Sección derecha: enlaces de navegación -->
    <nav class="nav-links">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/about">Acerca</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register" class="register-button">Registrarse</RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.header-bar {
  position: fixed;              /* Fija en la parte superior */
  top: 0;
  left: 0;
  width: 100%;                 /* Ocupar todo el ancho */
  z-index: 1000;               /* Por encima de otros elementos */
  background-color: #d29750;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 40px;
  max-height: 65px;
  font-family: 'Arial', sans-serif;
  font-size: 16px; 
}

/* Para empujar el contenido hacia abajo, considera agregar padding-top equivalente en tu layout principal */

.left-section {
  display: flex;
  align-items: center;
}

.logo {
  margin-right: 10px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 16px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.nav-links a.router-link-exact-active {
  text-decoration: underline;
}
.nav-links {
  display: flex;
  gap: 16px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.nav-links a.router-link-exact-active {
  text-decoration: underline;
}

.register-button {
  background-color: #0fac21; /* Color azul */
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #eadb13; /* Azul más oscuro al pasar el mouse */
}
</style>

  