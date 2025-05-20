<script setup>
  // Importamos el componente HeaderBar personalizado
  import HeaderBar from './components/HeaderBar.vue';

  // Importamos el hook 'useRoute' de 'vue-router' para obtener la información de la ruta actual
  import { useRoute } from 'vue-router';

  // Usamos el hook 'useRoute' para obtener la ruta actual
  const route = useRoute();
</script>

<template>
  <!-- Usamos tu encabezado personalizado en la parte superior solo si la ruta no comienza con '/dashboard' -->
  <HeaderBar v-if="!route.path.startsWith('/dashboard')" />

  <!-- Aquí se cargarán dinámicamente las vistas de acuerdo a la ruta (login, home, etc.) -->
  <RouterView />
</template>

<style scoped>
/* Aquí puedes agregar estilos globales si los necesitas */
</style>
