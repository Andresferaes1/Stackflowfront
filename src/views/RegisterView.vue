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
          <div class="input-group">
            <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="Ejemplo: usuario@correo.com"
              autocomplete="email"
            />
            <span class="input-icon">📧</span>
          </div>

          <!-- Campo de nombre -->  
          <label for="name">Nombre completo</label>   
          <div class="input-group">
            <input
              type="text"
              id="name"
              v-model="name"
              required
              placeholder="Ejemplo: Andrés Feraéz"
              autocomplete="name"
            />
            <span class="input-icon">👤</span>
          </div>
    
          <!-- Campo de contraseña -->
          <label for="password">Contraseña:</label>
          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              placeholder="Mínimo 6 caracteres"
              autocomplete="new-password"
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

          <!-- ✅ NUEVA: Barra de fortaleza de contraseña -->
          <div v-if="password" class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill" :class="passwordStrengthClass" :style="{width: passwordStrengthWidth}"></div>
            </div>
            <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
          </div>
    
          <!-- Campo de edad -->
          <label for="age">Edad:</label>
          <div class="input-group">
            <input
              type="number"
              id="age"
              v-model="age"
              required
              min="18"
              max="120"
              placeholder="Edad en años (mínimo 18)"
            />
            <span class="input-icon">🎂</span>
          </div>

          <!-- ✅ NUEVA: Checkbox de términos y condiciones -->
          <div class="checkbox-group">
            <input type="checkbox" id="terms" v-model="acceptTerms" required />
            <label for="terms" class="checkbox-label">
              Acepto los <a href="#" @click.prevent="showTerms">términos y condiciones</a> de STACKFLOW
            </label>
          </div>
    
          <!-- Botón para registrar -->
          <button type="submit" :disabled="isLoading || !acceptTerms" class="register-button">
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Registrando...' : 'Registrar' }}
          </button>
        </form>

        <!-- ✅ NUEVO: Enlace para ir al login -->
        <div class="login-link">
          <p>¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
        </div>
    
        <!-- Mensaje si hay error -->
        <div v-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button type="button" class="error-close" @click="clearError">×</button>
        </div>
    
        <!-- Confirmación -->
        <div v-if="success" class="success-container">
          <p class="success-message">{{ success }} ✔</p>
          <p class="success-subtitle">Redirigiendo al login...</p>
        </div>
      </div>

      <!-- ✅ NUEVO FOOTER MOTIVACIONAL AGREGADO -->
      <footer class="register-footer">
        <div class="footer-content">
          <div class="welcome-section">
            <h3>¡Bienvenido a STACKFLOW! 🎉</h3>
            <p>
              Estás a punto de unirte a una plataforma que transformará la manera en que gestionas tu trabajo. 
              Esperamos que con STACKFLOW logres ser más eficiente, obtengas mejores resultados en tus proyectos 
              y veas un impacto positivo en tu economía y crecimiento profesional.
            </p>
          </div>

          <div class="quote-section">
            <blockquote>
              "El éxito es la suma de pequeños esfuerzos repetidos día tras día."

            </blockquote>
            <cite>— Robert Collier (escritor estadounidense)</cite>
          </div>

          <div class="benefits-section">
            <h4>Con STACKFLOW lograrás:</h4>
            <ul>
              <li>📈 Mayor productividad en tu trabajo</li>
              <li>💰 Mejor control de tus finanzas</li>
              <li>⏰ Ahorro de tiempo valioso</li>
              <li>🎯 Resultados más precisos</li>
              <li>🚀 Crecimiento profesional</li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} STACKFLOW - Tu éxito es nuestro compromiso</p>
        </div>
      </footer>
    </div>
  </div>
</template>
  
<script setup>
import axiosInstance from '@/services/axios';  // Importa la instancia de Axios
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Variables reactivas del formulario
const name = ref('');
const email = ref('');
const password = ref('');
const age = ref('');
const error = ref(null);
const success = ref(false);
const isLoading = ref(false);
const showPassword = ref(false);
const acceptTerms = ref(false);

// Router para redirección
const router = useRouter();

// Computed para el año actual
const currentYear = computed(() => new Date().getFullYear());

// ✅ NUEVA: Función para toggle de contraseña
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// ✅ NUEVA: Función para limpiar errores
const clearError = () => {
  error.value = null;
};

// ✅ NUEVA: Computed para evaluar fortaleza de contraseña
const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return 0;
  
  let strength = 0;
  if (pwd.length >= 6) strength += 1;
  if (pwd.length >= 8) strength += 1;
  if (/[A-Z]/.test(pwd)) strength += 1;
  if (/[0-9]/.test(pwd)) strength += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
  
  return strength;
});

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'medium';
  return 'strong';
});

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 5) * 100}%`;
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return 'Débil';
  if (strength <= 3) return 'Media';
  return 'Fuerte';
});

// ✅ NUEVA: Función para mostrar términos
const showTerms = () => {
  alert(`Términos y Condiciones de STACKFLOW:

• Uso responsable del sistema de gestión
• Protección y confidencialidad de datos
• Cumplimiento de políticas empresariales
• Compromiso con la mejora continua
• Soporte técnico y actualizaciones incluidas

Al aceptar estos términos, te unes a una comunidad comprometida con la excelencia y el crecimiento profesional.`);
};

// Función de registro mejorada
const handleRegister = async () => {
  error.value = null;
  success.value = false;

  // Validaciones mejoradas
  if (!name.value.trim()) {
    error.value = 'El nombre completo es obligatorio.';
    return;
  }

  if (!email.value.trim()) {
    error.value = 'El correo electrónico es obligatorio.';
    return;
  }

  if (!password.value) {
    error.value = 'La contraseña es obligatoria.';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  if (!age.value) {
    error.value = 'La edad es obligatoria.';
    return;
  }

  if (parseInt(age.value) < 18) {
    error.value = 'Debes ser mayor de 18 años para registrarte.';
    return;
  }

  if (!acceptTerms.value) {
    error.value = 'Debes aceptar los términos y condiciones.';
    return;
  }

  isLoading.value = true;

  // Realizar la solicitud POST al backend
  try {
    const response = await axiosInstance.post('/register', {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      age: parseInt(age.value),
    });

    // Si el registro es exitoso
    success.value = response.data.detail || 'Registro exitoso! Tu cuenta ha sido creada';
    
    // Limpiar formulario
    name.value = '';
    email.value = '';
    password.value = '';
    age.value = '';
    acceptTerms.value = false;

    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      router.push('/login');
    }, 3000);

  } catch (err) {
    // Manejo de errores mejorado
    console.error('Error en el registro:', err);
    
    if (err.response?.status === 400) {
      error.value = err.response.data.detail || 'Datos inválidos. Verifica la información ingresada.';
    } else if (err.response?.status === 409) {
      error.value = 'Este correo electrónico ya está registrado. Intenta con otro.';
    } else if (err.response?.status >= 500) {
      error.value = 'Error del servidor. Intenta nuevamente en unos minutos.';
    } else {
      error.value = err.response?.data?.detail || 'Error de conexión. Verifica tu conexión a internet.';
    }
  } finally {
    isLoading.value = false;
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
  align-items: flex-start;
  padding: 20px;
  background-image: url('@/assets/Registrofondo.png'); /* Ruta de la imagen (MANTENIDA) */
  background-position: center; /* Centra la imagen (MANTENIDO) */
  background-repeat: no-repeat; /* Evita que la imagen se repita (MANTENIDO) */
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
  margin-top: 2rem;
  background-color: #f9f9f9; /* MANTENIDO */
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* MANTENIDO */
  opacity: 0.9; /* MANTENIDO */
  margin-bottom: 1rem;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333; /* MANTENIDO */
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

/* ✅ NUEVO: Grupo de input con iconos */
.input-group {
  position: relative;
  margin-bottom: 1rem;
}

.input-group input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.input-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #666;
  pointer-events: none;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem;
  color: #666;
}

.password-toggle:hover {
  opacity: 0.7;
}

/* ✅ NUEVA: Barra de fortaleza de contraseña */
.password-strength {
  margin-bottom: 1rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-fill.weak {
  background-color: #ff4444;
}

.strength-fill.medium {
  background-color: #ffaa00;
}

.strength-fill.strong {
  background-color: #00aa00;
}

.strength-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.strength-text.weak {
  color: #ff4444;
}

.strength-text.medium {
  color: #ffaa00;
}

.strength-text.strong {
  color: #00aa00;
}

/* Fallback para inputs sin grupo */
input:not(.input-group input) {
  padding: 0.6rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  font-size: 1rem;
}

/* ✅ NUEVA: Checkbox group */
.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.checkbox-group input[type="checkbox"] {
  margin: 0;
  width: auto;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.checkbox-label {
  font-weight: normal;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.checkbox-label a {
  color: #0fac21;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

/* ✅ NUEVO: Enlace de login */
.login-link {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.login-link p {
  color: #666;
  font-size: 0.9rem;
}

.login-link a {
  color: #0fac21;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

button.register-button {
  padding: 0.8rem;
  background-color: #0fac21; /* MANTENIDO */
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

button.register-button:hover {
  background-color: #002244; /* MANTENIDO */
}

button.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.register-button:disabled:hover {
  background-color: #0fac21;
}

/* ✅ NUEVO: Spinner de carga */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  color: red; /* MANTENIDO */
  font-weight: bold; /* MANTENIDO */
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
  opacity: 0.7;
}

/* ✅ MEJORADO: Mensaje de éxito */
.success-container {
  background-color: #e6ffe6;
  border: 1px solid #99ff99;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  color: green; /* MANTENIDO */
  font-weight: bold; /* MANTENIDO */
  margin: 0;
}

.success-subtitle {
  color: #006600;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

/* ===== ✅ NUEVOS ESTILOS PARA EL FOOTER MOTIVACIONAL ===== */
.register-footer {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, rgba(15, 172, 33, 0.9), rgba(0, 34, 68, 0.9));
  color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.welcome-section h3 {
  color: #fff;
  margin-bottom: 0.75rem;
  text-align: center;
  font-size: 1.2rem;
}

.welcome-section p {
  line-height: 1.6;
  text-align: center;
  font-size: 0.95rem;
  color: #f0f0f0;
}

.quote-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #fff;
}

.quote-section blockquote {
  font-style: italic;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  color: #f8f8f8;
}

.quote-section cite {
  font-size: 0.8rem;
  color: #d0d0d0;
  font-weight: 500;
}

.benefits-section h4 {
  margin-bottom: 0.75rem;
  color: #fff;
  text-align: center;
  font-size: 1rem;
}

.benefits-section ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.benefits-section li {
  font-size: 0.85rem;
  color: #f0f0f0;
  padding: 0.25rem 0;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  margin-top: 1rem;
  padding-top: 0.75rem;
  text-align: center;
}

.footer-bottom p {
  font-size: 0.8rem;
  color: #e0e0e0;
  font-weight: 500;
}

/* Responsive para pantallas muy pequeñas (MANTENIDO Y MEJORADO) */
@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem;
  }
  
  .register-footer {
    padding: 1rem;
    margin-top: 0.5rem;
  }
  
  .footer-content {
    gap: 1rem;
  }
  
  .welcome-section h3 {
    font-size: 1.1rem;
  }
  
  .welcome-section p {
    font-size: 0.9rem;
  }
  
  .benefits-section ul {
    gap: 0.3rem;
  }
  
  .benefits-section li {
    font-size: 0.8rem;
  }
}
</style>
```