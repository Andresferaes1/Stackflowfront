<template>
  <!-- Contenedor principal centrado -->
  <div class="login-page">
    <div class="login-container">
      <!-- Título de la vista -->
      <h2>Iniciar Sesión</h2>
  
      <!-- Formulario de login -->
      <!-- @submit.prevent evita que el formulario recargue la página -->
      <form @submit.prevent="handleLogin">
        <!-- Campo de nombre de usuario -->
        <input
          type="text"
          v-model="username"
          placeholder="Usuario"
          required
        />
  
        <!-- Campo de contraseña -->
        <input
          type="password"
          v-model="password"
          placeholder="Contraseña"
          required
        />
  
        <!-- Botón para enviar el formulario -->
        <button type="submit">Entrar</button>
        <!-- Botón de registro -->
        <RegisterButton />
  
        <!-- Mensaje de error si el login falla -->
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
// Composición de Vue 3
import RegisterButton from '@/components/RegisterButton.vue'
import { ref } from 'vue';              // Importa ref para variables reactivas
import { useRouter } from 'vue-router'; // Importa el router para hacer redirecciones
import axios from 'axios';              // Cliente HTTP para enviar peticiones al backend

// Campos reactivamente ligados al formulario
const username = ref('');     // Usuario ingresado
const password = ref('');     // Contraseña ingresada
const error = ref(null);      // Variable para guardar errores

// Obtenemos el router para redireccionar después del login
const router = useRouter();

// Función que se ejecuta al enviar el formulario
const handleLogin = async () => {
  try {
    // Enviamos los datos al backend
    const response = await axios.post('http://localhost:8000/login', {
      email: username.value,
      password: password.value
    });

    // Si todo sale bien, recibimos un token (JWT)
    const token = response.data.access_token;

    // Guardamos el token en el almacenamiento local del navegador
    localStorage.setItem('token', token);

    // Redireccionamos al usuario al dashboard
    router.push('/dashboard');
  } catch (err) {
    // Si ocurre un error (credenciales inválidas o fallo de red), lo mostramos
    error.value = 'Credenciales incorrectas o error de conexión.';
    console.error(err);
  }
};
</script>

<style scoped>
/* Reset básico para evitar problemas de margen y padding */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Contenedor de página completo */
.login-page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-image: url('@/assets/backgroundlog.png'); /* Ruta de la imagen */
  background-size: 100%; /* Asegura que la imagen cubra todo el fondo */
  background-position: center; /* Centra la imagen */
  background-repeat: no-repeat; /* Evita que la imagen se repita */
}



/* Estilo principal del contenedor */
.login-container {
  width: 100%;
  margin-top: 2rem;
  max-width: 600px;
  padding: 3rem;
  border-radius: 8px;
  background-color: rgba(249, 249, 249, 0.4); /* Fondo claro con transparencia */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); /* Sombra suave */
}

/* Título centrado */
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

/* Estilo de campos de entrada */
input {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

/* Estilo del botón */
button {
  width: 100%;
  padding: 0.6rem;
  background-color: #d0e229; /* Color original */
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
}

/* Cambio de color al pasar el mouse */
button:hover {
  background-color: #2514d5;
}

/* Mensaje de error */
.error-message {
  color: red;
  font-weight: bold;
  margin-top: 1rem;
  text-align: center;
}

/* Corrige el estilo del botón de registro que estaba cortado en el original */
:deep(.register-button) {
  margin-top: 0.5rem;
  display: block;
  width: 100%;
  padding: 0.6rem;
  background-color: #0fac21;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

/* Responsive para pantallas muy pequeñas */
@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
  }
}
</style>