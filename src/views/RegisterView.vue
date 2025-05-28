<template>
  <div class="register-page">
    <div class="register-view">
      <!-- Contenedor principal del formulario -->
      <div class="form-container">
        <h2>Registro de Usuario</h2>
    
        <!-- Formulario de registro -->
        <form @submit.prevent="handleRegister">
          <!-- Campo de correo electrónico -->
          <label for="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Ejemplo: usuario@correo.com"
          />
          <!-- Campo de nombre -->  
          <label for="name">Nombre completo</label>   
          <input
            type="text"
            id="name"
            v-model="name"
            required
            placeholder="Ejemplo: Andrés Feraéz"
          />  
    
          <!-- Campo de contraseña -->
          <label for="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Mínimo 6 caracteres"
          />
    
          <!-- Campo de edad -->
          <label for="age">Edad:</label>
          <input
            type="number"
            id="age"
            v-model="age"
            required
            min="0"
            placeholder="Edad en años"
          />
    
          <!-- Botón para registrar -->
          <button type="submit">Registrar</button>
        </form>
    
        <!-- Mensaje si hay error -->
        <p v-if="error" class="error-message">{{ error }}</p>
    
        <!-- Confirmación -->
        <p v-if="success" class="success-message">Registro exitoso ✔</p>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import axiosInstance from '@/services/axios';  // Importa la instancia de Axios
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const password = ref('');
const age = ref('');
const error = ref(null);
const success = ref(false);

const handleRegister = async () => {
  error.value = null;
  success.value = false;

  // Validación básica
  if (!email.value || !password.value || !age.value) {
    error.value = 'Todos los campos son obligatorios.';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  // Realizar la solicitud POST al backend
  try {
    const response = await axiosInstance.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      age: age.value,
    });

    // Si el registro es exitoso, usamos el mensaje detallado del backend
    success.value = response.data.detail; // Mensaje detallado que el backend devuelve
    email.value = '';
    password.value = '';
    age.value = '';
  } catch (err) {
    // Manejo de errores
    if (err.response) {
      error.value = err.response.data.detail || 'Error al registrar usuario.';
    } else {
      error.value = 'No se pudo conectar con el servidor.';
    }
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
.register-page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: right;
  padding: 20px;
  background-image: url('@/assets/Registrofondo.png'); /* Ruta de la imagen */
  
  background-position: center; /* Centra la imagen */
  background-repeat: no-repeat; /* Evita que la imagen se repita */

}

.register-view {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container {
  width: 100%;
  margin-top: 5rem;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

label {
  font-weight: bold;
  margin: 0.5rem 0 0.2rem;
}

input {
  padding: 0.6rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  font-size: 1rem;
}

button {
  padding: 0.8rem;
  background-color: #0fac21;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 0.5rem;
}

button:hover {
  background-color: #002244;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  color: green;
  font-weight: bold;
  margin-top: 1rem;
  text-align: center;
}

/* Responsive para pantallas muy pequeñas */
@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem;
  }
}
</style>