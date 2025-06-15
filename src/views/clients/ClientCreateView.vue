<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\clients\ClientCreateView.vue -->
<!-- filepath: src/views/clients/ClientCreateView.vue -->
<template>
  <div class="client-create-container">
    <!-- Header con título profesional -->
    <div class="form-header">
      <div class="header-content">
        <div class="header-icon">🏢</div>
        <div class="header-text">
          <h1>Registrar Nuevo Cliente</h1>
          <p>Complete la información comercial del cliente</p>
        </div>
      </div>
      <div class="form-progress">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- Formulario principal -->
    <form @submit.prevent="submitClient" class="client-form">
      
      <!-- Sección 1: Información Básica -->
      <div class="form-section">
        <div class="section-header">
          <h3><span class="section-icon">📋</span> Información Básica</h3>
          <div class="section-divider"></div>
        </div>
        
        <div class="form-grid-2">
          <div class="form-group">
            <label for="name" class="form-label">
              <span class="label-icon">🏢</span>
              Nombre de la Empresa *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'error': errors.name, 'valid': form.name && !errors.name }"
              placeholder="Ej: Distribuidora ABC S.A.S"
              @input="validateField('name')"
              required
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="nit" class="form-label">
              <span class="label-icon">🆔</span>
              NIT / Cédula *
            </label>
            <input
              id="nit"
              v-model="form.nit"
              type="text"
              class="form-input"
              :class="{ 'error': errors.nit, 'valid': form.nit && !errors.nit }"
              placeholder="Ej: 900123456-7"
              @input="validateField('nit')"
              required
            />
            <span v-if="errors.nit" class="error-message">{{ errors.nit }}</span>
          </div>

          <div class="form-group">
            <label for="legalRepresentative" class="form-label">
              <span class="label-icon">👤</span>
              Representante Legal *
            </label>
            <input
              id="legalRepresentative"
              v-model="form.legalRepresentative"
              type="text"
              class="form-input"
              :class="{ 'error': errors.legalRepresentative, 'valid': form.legalRepresentative && !errors.legalRepresentative }"
              placeholder="Ej: Juan Carlos Pérez"
              @input="validateField('legalRepresentative')"
              required
            />
            <span v-if="errors.legalRepresentative" class="error-message">{{ errors.legalRepresentative }}</span>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">
              <span class="label-icon">📧</span>
              Correo Electrónico *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'error': errors.email, 'valid': form.email && !errors.email }"
              placeholder="Ej: contacto@empresa.com"
              @input="validateField('email')"
              required
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
        </div>
      </div>

      <!-- Sección 2: Información de Contacto -->
      <div class="form-section">
        <div class="section-header">
          <h3><span class="section-icon">📞</span> Información de Contacto</h3>
          <div class="section-divider"></div>
        </div>
        
        <div class="form-grid-2">
          <div class="form-group">
            <label for="phone" class="form-label">
              <span class="label-icon">📱</span>
              Teléfono Principal *
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="form-input"
              :class="{ 'error': errors.phone, 'valid': form.phone && !errors.phone }"
              placeholder="Ej: +57 300 123 4567"
              @input="validateField('phone')"
              required
            />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label for="altPhone" class="form-label">
              <span class="label-icon">☎️</span>
              Teléfono Alternativo
            </label>
            <input
              id="altPhone"
              v-model="form.altPhone"
              type="tel"
              class="form-input"
              :class="{ 'valid': form.altPhone }"
              placeholder="Ej: (1) 234-5678"
            />
            <small class="help-text">Campo opcional</small>
          </div>
        </div>
      </div>

      <!-- Sección 3: Ubicación -->
      <div class="form-section">
        <div class="section-header">
          <h3><span class="section-icon">📍</span> Ubicación</h3>
          <div class="section-divider"></div>
        </div>
        
        <div class="form-group">
          <label for="address" class="form-label">
            <span class="label-icon">🏠</span>
            Dirección Completa *
          </label>
          <textarea
            id="address"
            v-model="form.address"
            class="form-textarea"
            :class="{ 'error': errors.address, 'valid': form.address && !errors.address }"
            placeholder="Ej: Calle 123 #45-67, Oficina 301, Centro Empresarial, Bogotá D.C."
            rows="3"
            @input="validateField('address')"
            required
          ></textarea>
          <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>
      </div>

      <!-- Resumen del formulario -->
      <div class="form-summary">
        <div class="summary-content">
          <h4>📊 Resumen del Cliente</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Empresa:</span>
              <span class="summary-value">{{ form.name || 'Sin especificar' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">NIT:</span>
              <span class="summary-value">{{ form.nit || 'Sin especificar' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Email:</span>
              <span class="summary-value">{{ form.email || 'Sin especificar' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Teléfono:</span>
              <span class="summary-value">{{ form.phone || 'Sin especificar' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary" :disabled="loading">
          <span class="btn-icon">🔄</span>
          Limpiar Formulario
        </button>
        
        <button type="submit" class="btn-primary" :disabled="loading || !isFormValid">
          <span v-if="loading" class="btn-icon loading">⏳</span>
          <span v-else class="btn-icon">💾</span>
          {{ loading ? 'Guardando...' : 'Registrar Cliente' }}
        </button>
      </div>
    </form>

    <!-- Notificaciones -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <div class="notification-content">
        <span class="notification-icon">
          {{ notification.type === 'success' ? '✅' : '❌' }}
        </span>
        <span class="notification-message">{{ notification.message }}</span>
        <button @click="hideNotification" class="notification-close">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
// Importar axios configurado (que maneja la URL base)
import axios from '@/services/axios'

export default {
  name: 'ClientCreateView',
  data() {
    return {
      // Formulario (manteniendo estructura original)
      form: {
        name: '',
        nit: '',
        legalRepresentative: '',
        email: '',
        phone: '',
        altPhone: '',
        address: ''
      },
      
      // Nuevos estados para la funcionalidad mejorada
      errors: {},
      loading: false,
      notification: {
        show: false,
        type: '',
        message: ''
      }
    }
  },

  computed: {
    isFormValid() {
      const requiredFields = ['name', 'nit', 'legalRepresentative', 'email', 'phone', 'address']
      return requiredFields.every(field => 
        this.form[field] && 
        this.form[field].trim() !== '' && 
        !this.errors[field]
      )
    },

    progressPercent() {
      const totalFields = 7
      const filledFields = Object.values(this.form).filter(value => 
        value && value.toString().trim() !== ''
      ).length
      return (filledFields / totalFields) * 100
    }
  },

  methods: {
    validateField(fieldName) {
      this.errors = { ...this.errors }
      delete this.errors[fieldName]

      const value = this.form[fieldName]
      
      switch (fieldName) {
        case 'name':
          if (!value || value.trim().length < 2) {
            this.errors.name = 'El nombre debe tener al menos 2 caracteres'
          }
          break
          
        case 'nit':
          if (!value || value.trim().length < 8) {
            this.errors.nit = 'El NIT debe tener al menos 8 caracteres'
          }
          break
          
        case 'legalRepresentative':
          if (!value || value.trim().length < 3) {
            this.errors.legalRepresentative = 'El nombre debe tener al menos 3 caracteres'
          }
          break
          
        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!value || !emailRegex.test(value)) {
            this.errors.email = 'Ingrese un email válido'
          }
          break
        }
          
        case 'phone': {
          const phoneRegex = /^[+]?[\d\s\-()]{7,}$/
          if (!value || !phoneRegex.test(value)) {
            this.errors.phone = 'Ingrese un teléfono válido'
          }
          break
        }
          
        case 'address':
          if (!value || value.trim().length < 10) {
            this.errors.address = 'La dirección debe ser más específica'
          }
          break
      }
    },

    // Método principal mejorado (basado en tu submitForm original)
    async submitClient() {
      // Validar todos los campos requeridos
      Object.keys(this.form).forEach(field => {
        if (field !== 'altPhone') { // altPhone es opcional
          this.validateField(field)
        }
      })

      if (!this.isFormValid) {
        this.showNotification('error', 'Por favor, corrija los errores en el formulario')
        return
      }

      this.loading = true

      try {
        console.log('📤 Enviando datos del cliente:', this.form)
        
        // Usar la URL relativa ya que axios está configurado con baseURL
        const response = await axios.post('/clients/', this.form)
        
        console.log('✅ Cliente creado exitosamente:', response.data)
        
        // Notificación de éxito
        this.showNotification('success', `Cliente "${this.form.name}" registrado exitosamente`)
        
        // Limpiar formulario después de 2 segundos
        setTimeout(() => {
          this.resetForm()
        }, 2000)
        
      } catch (error) {
        console.error('❌ Error al registrar el cliente:', error)
        
        // Manejo de errores mejorado
        let errorMessage = 'Hubo un error al registrar el cliente'
        
        if (error.response?.status === 400) {
          if (error.response.data?.detail?.includes('nit')) {
            errorMessage = 'El NIT ya está registrado'
          } else if (error.response.data?.detail?.includes('email')) {
            errorMessage = 'El email ya está registrado'
          } else if (error.response.data?.detail) {
            errorMessage = error.response.data.detail
          }
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail
        }
        
        this.showNotification('error', errorMessage)
        
      } finally {
        this.loading = false
      }
    },

    // Método original mantenido para compatibilidad
    async submitForm() {
      return this.submitClient()
    },

    resetForm() {
      // Limpiar formulario (tu lógica original mejorada)
      this.form = {
        name: '',
        nit: '',
        legalRepresentative: '',
        email: '',
        phone: '',
        altPhone: '',
        address: ''
      }
      this.errors = {}
      console.log('🔄 Formulario reiniciado')
    },

    showNotification(type, message) {
      this.notification = {
        show: true,
        type,
        message
      }
      
      // Auto-hide después de 5 segundos
      setTimeout(() => {
        this.hideNotification()
      }, 5000)
    },

    hideNotification() {
      this.notification.show = false
    }
  }
}
</script>

<style scoped>
/* === VARIABLES CSS === */
:root {
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --error-color: #f56565;
  --warning-color: #ed8936;
  --gray-100: #f7fafc;
  --gray-200: #edf2f7;
  --gray-300: #e2e8f0;
  --gray-500: #a0aec0;
  --gray-700: #4a5568;
  --gray-900: #1a202c;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* === CONTAINER PRINCIPAL === */
.client-create-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: 100vh;
}

/* === HEADER === */
.form-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 2rem;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  margin-bottom: 0;
  box-shadow: var(--shadow-lg);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.header-icon {
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.header-text h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-text p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.form-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.5s ease;
  border-radius: 2px;
}

/* === FORMULARIO === */
.client-form {
  background: white;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* === SECCIONES === */
.form-section {
  padding: 2rem;
  border-bottom: 1px solid var(--gray-200);
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: var(--gray-900);
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.2rem;
}

.section-divider {
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  margin-top: 0.5rem;
  border-radius: 1px;
}

/* === GRIDS === */
.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* === FORM GROUPS === */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.label-icon {
  font-size: 1rem;
}

/* === INPUTS === */
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
  background: var(--gray-100);
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.valid,
.form-textarea.valid {
  border-color: var(--success-color);
  background: rgba(72, 187, 120, 0.05);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--error-color);
  background: rgba(245, 101, 101, 0.05);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* === MENSAJES === */
.error-message {
  color: var(--error-color);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
  font-weight: 500;
}

.help-text {
  color: var(--gray-500);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* === RESUMEN === */
.form-summary {
  background: var(--gray-100);
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-200);
}

.summary-content h4 {
  margin: 0 0 1rem 0;
  color: var(--gray-900);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.85rem;
}

.summary-value {
  color: var(--gray-900);
  font-size: 0.95rem;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}

/* === BOTONES === */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: var(--gray-100);
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--gray-300);
  color: var(--gray-700);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--gray-500);
  color: white;
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-icon.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === NOTIFICACIONES === */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: var(--success-color);
  color: white;
}

.notification.error {
  background: var(--error-color);
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.notification-icon {
  font-size: 1.2rem;
}

.notification-message {
  flex: 1;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: var(--transition);
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .client-create-container {
    padding: 1rem;
  }
  
  .form-header {
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-text h1 {
    font-size: 1.5rem;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .header-icon {
    font-size: 2rem;
    padding: 0.75rem;
  }
}
</style>