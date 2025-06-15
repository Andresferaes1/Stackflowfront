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
        <div class="form-group">
          <label for="username">Correo electrónico</label>
          <input
            id="username"
            type="text"
            v-model="username"
            placeholder="Usuario"
            required
          />
        </div>
  
        <!-- Campo de contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            v-model="password"
            placeholder="Contraseña"
            required
          />
        </div>
        <!-- Enlace para recuperación de contraseña -->
        <div class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">
            ¿Olvidó su contraseña?
          </a>
        </div>
        <!-- Botón para enviar el formulario -->
        <button type="submit">Entrar</button>
        <!-- Botón de registro -->
        <RegisterButton />
  
        <!-- Mensaje de error si el login falla -->
        <p v-if="error" class="error-message">{{ error }}</p>
            <!-- Sección de aceptación de términos y condiciones -->
        <div class="terms">
          <p>
            Al iniciar sesión, aceptas nuestros 
            <a href="#" @click.prevent="showTerms">términos y condiciones</a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Importación de componentes y librerías necesarias
import RegisterButton from '@/components/RegisterButton.vue'; // Botón de registro
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
    const response = await axios.post('http://localhost:8000/login', {
      email: username.value,
      password: password.value,
    });

    // Extraer token y datos de usuario
    const { access_token, user } = response.data;

    if (access_token) {
      // Guardar token y datos de usuario
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user || { name: username.value }));
      
      // Limpiar cualquier error previo
      error.value = null;
      
      // Redireccionar al dashboard
      await router.push('/dashboard');
    } else {
      throw new Error('No se recibió un token válido');
    }
  } catch (err) {
    error.value = 'Credenciales incorrectas o error de conexión.';
    console.error('Error de login:', err);
  }
};

// Método para manejar la recuperación de contraseña
const handleForgotPassword = () => {
  router.push('/forgot-password');
};

// Método para mostrar los términos y condiciones
const showTerms = () => {
  router.push('/terms');
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
/* Estilos para el grupo de formulario */
.form-group {
  margin-bottom: 1rem;
}

/* Estilos para las etiquetas de los campos */
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

/* Contenedor del enlace de recuperación de contraseña */
.forgot-password {
  text-align: right;
  margin-bottom: 1rem;
}

/* Estilo del enlace de recuperación de contraseña */
.forgot-password a {
  color: #2514d5;
  text-decoration: none;
  font-size: 0.9rem;
}

/* Efecto hover para el enlace */
.forgot-password a:hover {
  text-decoration: underline;
}

/* Contenedor de términos y condiciones */
.terms {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #333;
}

/* Estilo para los enlaces en términos */
.terms a {
  color: #2514d5;
  text-decoration: none;
}

/* Efecto hover para enlaces de términos */
.terms a:hover {
  text-decoration: underline;
}
</style>