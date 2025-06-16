<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\LoginView.vue -->
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
            type="email"
            v-model="username"
            placeholder="ejemplo@correo.com"
            required
            autocomplete="email"
          />
        </div>
  
        <!-- Campo de contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input-container">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Contraseña"
              required
              autocomplete="current-password"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="togglePassword"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <!-- Enlace para recuperación de contraseña -->
        <div class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">
            ¿Olvidó su contraseña?
          </a>
        </div>

        <!-- Indicador de carga y botón -->
        <button type="submit" :disabled="isLoading" class="login-button">
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Iniciando sesión...' : 'Entrar' }}
        </button>

        <!-- Botón de registro -->
        <RegisterButton />
  
        <!-- Mensaje de error si el login falla -->
        <div v-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button type="button" class="error-close" @click="clearError">×</button>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="successMessage" class="success-container">
          <p class="success-message">{{ successMessage }}</p>
        </div>

        <!-- Sección de aceptación de términos y condiciones -->
        <div class="terms">
          <p>
            Al iniciar sesión, aceptas nuestros 
            <a href="#" @click.prevent="showTerms">términos y condiciones</a>
          </p>
        </div>
      </form>
    </div>

    <!-- ✅ NUEVO FOOTER AGREGADO -->
    <footer class="login-footer">
      <div class="footer-content">
        <!-- Información de contacto -->
        <div class="footer-section">
          <h4>STACKFLOW</h4>
          <p>Sistema de Gestión Empresarial</p>
        </div>

        <!-- Datos de contacto -->
        <div class="footer-section">
          <h5>Contacto</h5>
          <p>📞 +57 (601) 123-4567</p>
          <p>📧 info@stackflow.com</p>
          <p>📍 Bogotá D.C., Colombia</p>
        </div>

        <!-- Redes sociales -->
        <div class="footer-section">
          <h5>Síguenos</h5>
          <div class="social-links">
            <a href="#" @click.prevent="openSocial('facebook')" aria-label="Facebook">📘</a>
            <a href="#" @click.prevent="openSocial('twitter')" aria-label="Twitter">🐦</a>
            <a href="#" @click.prevent="openSocial('linkedin')" aria-label="LinkedIn">💼</a>
            <a href="#" @click.prevent="openSocial('instagram')" aria-label="Instagram">📷</a>
          </div>
        </div>

        <!-- Enlaces útiles -->
        <div class="footer-section">
          <h5>Enlaces</h5>
          <a href="#" @click.prevent="showTerms">Términos y Condiciones</a>
          <a href="#" @click.prevent="showPrivacy">Política de Privacidad</a>
          <a href="#" @click.prevent="showSupport">Soporte Técnico</a>
        </div>
      </div>

      <!-- Copyright -->
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} STACKFLOW. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Importación de componentes y librerías necesarias
import RegisterButton from '@/components/RegisterButton.vue'; // Botón de registro
import { ref, computed } from 'vue';        // Importa ref para variables reactivas
import { useRouter } from 'vue-router';     // Importa el router para hacer redirecciones
import axios from 'axios';                  // Cliente HTTP para enviar peticiones al backend

// Campos reactivamente ligados al formulario
const username = ref('');         // Usuario ingresado
const password = ref('');         // Contraseña ingresada
const error = ref(null);          // Variable para guardar errores
const successMessage = ref('');   // Mensaje de éxito
const isLoading = ref(false);     // Estado de carga
const showPassword = ref(false);  // Toggle para mostrar/ocultar contraseña

// Obtenemos el router para redireccionar después del login
const router = useRouter();

// Computed para el año actual
const currentYear = computed(() => new Date().getFullYear());

// ✅ FUNCIÓN PARA TOGGLE DE CONTRASEÑA
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// ✅ FUNCIÓN PARA LIMPIAR ERRORES
const clearError = () => {
  error.value = null;
};

// Función que se ejecuta al enviar el formulario (MEJORADA)
const handleLogin = async () => {
  // Validaciones básicas
  if (!username.value.trim()) {
    error.value = 'Por favor ingresa tu correo electrónico';
    return;
  }
  
  if (!password.value.trim()) {
    error.value = 'Por favor ingresa tu contraseña';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.post('http://localhost:8000/login', {
      email: username.value.trim(),
      password: password.value,
    });

    // Extraer token y datos de usuario
    const { access_token, user } = response.data;

    if (access_token) {
      // Guardar token y datos de usuario
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user || { name: username.value }));
      
      // Mostrar mensaje de éxito
      successMessage.value = 'Inicio de sesión exitoso. Redirigiendo...';
      
      // Pequeña pausa para mostrar el mensaje
      setTimeout(async () => {
        // Redireccionar al dashboard
        await router.push('/dashboard');
      }, 1000);
    } else {
      throw new Error('No se recibió un token válido');
    }
  } catch (err) {
    console.error('Error de login:', err);
    
    if (err.response?.status === 401) {
      error.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    } else if (err.response?.status >= 500) {
      error.value = 'Error del servidor. Intenta nuevamente en unos minutos.';
    } else {
      error.value = 'Error de conexión. Verifica tu conexión a internet.';
    }
  } finally {
    isLoading.value = false;
  }
};

// Método para manejar la recuperación de contraseña
const handleForgotPassword = () => {
  console.log('Recuperación de contraseña solicitada');
  // TODO: Implementar recuperación de contraseña
  alert('Funcionalidad de recuperación de contraseña próximamente disponible');
};

// Método para mostrar los términos y condiciones
const showTerms = () => {
  console.log('Mostrando términos y condiciones');
  alert('Términos y condiciones:\n\n• Uso responsable del sistema\n• Confidencialidad de datos\n• Cumplimiento de políticas empresariales');
};

// ✅ NUEVAS FUNCIONES PARA EL FOOTER
const showPrivacy = () => {
  console.log('Mostrando política de privacidad');
  alert('Política de Privacidad:\n\n• Protección de datos personales\n• Uso seguro de la información\n• Cumplimiento GDPR');
};

const showSupport = () => {
  console.log('Mostrando soporte técnico');
  alert('Soporte Técnico:\n\n📞 +57 (601) 123-4567\n📧 soporte@stackflow.com\n🕒 Lunes a Viernes: 8:00 AM - 6:00 PM');
};

const openSocial = (platform) => {
  console.log(`Abriendo ${platform}`);
  const socialUrls = {
    facebook: 'https://facebook.com/stackflow',
    twitter: 'https://twitter.com/stackflow',
    linkedin: 'https://linkedin.com/company/stackflow',
    instagram: 'https://instagram.com/stackflow'
  };
  
  // En un entorno real, esto abriría la URL
  alert(`Abriendo ${platform}: ${socialUrls[platform]}`);
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
  flex-direction: column;
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
  margin-bottom: 2rem;
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

/* ✅ NUEVO: Contenedor para input de contraseña con toggle */
.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  padding-right: 2.5rem;
  margin-bottom: 0;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.2rem;
  width: auto;
  margin-bottom: 0;
}

.password-toggle:hover {
  background-color: transparent;
  opacity: 0.7;
}

/* Estilo del botón (MANTENIDO EXACTO) */
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

/* Cambio de color al pasar el mouse (MANTENIDO EXACTO) */
button:hover {
  background-color: #2514d5;
}

/* ✅ NUEVO: Estilo para botón deshabilitado */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: #d0e229;
}

/* ✅ NUEVO: Spinner de carga */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ✅ MEJORADO: Contenedor de mensaje de error */
.error-container {
  position: relative;
  background-color: #ffe6e6;
  border: 1px solid #ff9999;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message {
  color: red;
  font-weight: bold;
  margin: 0;
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: red;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: auto;
  margin: 0;
  margin-left: 0.5rem;
}

.error-close:hover {
  background-color: transparent;
  opacity: 0.7;
}

/* ✅ NUEVO: Mensaje de éxito */
.success-container {
  background-color: #e6ffe6;
  border: 1px solid #99ff99;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 1rem;
}

.success-message {
  color: green;
  font-weight: bold;
  margin: 0;
  text-align: center;
}

/* Corrige el estilo del botón de registro que estaba cortado en el original (MANTENIDO) */
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

/* Estilos para el grupo de formulario (MANTENIDO) */
.form-group {
  margin-bottom: 1rem;
}

/* Estilos para las etiquetas de los campos (MANTENIDO) */
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

/* Contenedor del enlace de recuperación de contraseña (MANTENIDO) */
.forgot-password {
  text-align: right;
  margin-bottom: 1rem;
}

/* Estilo del enlace de recuperación de contraseña (MANTENIDO) */
.forgot-password a {
  color: #2514d5;
  text-decoration: none;
  font-size: 0.9rem;
}

/* Efecto hover para el enlace (MANTENIDO) */
.forgot-password a:hover {
  text-decoration: underline;
}

/* Contenedor de términos y condiciones (MANTENIDO) */
.terms {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #333;
}

/* Estilo para los enlaces en términos (MANTENIDO) */
.terms a {
  color: #2514d5;
  text-decoration: none;
}

/* Efecto hover para enlaces de términos (MANTENIDO) */
.terms a:hover {
  text-decoration: underline;
}

/* ===== ✅ NUEVOS ESTILOS PARA EL FOOTER ===== */
.login-footer {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1.5rem 2rem 0.5rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section h4 {
  color: #d0e229;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.footer-section h5 {
  color: #d0e229;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.footer-section p {
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.footer-section a {
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.3rem;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #d0e229;
}

.social-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.social-links a {
  display: inline-block;
  font-size: 1.2rem;
  padding: 0.3rem;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.social-links a:hover {
  transform: scale(1.2);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 1rem;
  padding-top: 0.75rem;
  text-align: center;
}

.footer-bottom p {
  font-size: 0.8rem;
  color: #ccc;
}

/* Responsive para pantallas muy pequeñas (MANTENIDO Y MEJORADO) */
@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
  
  .login-footer {
    padding: 1rem;
  }
}
</style>