<!-- filepath: src/views/UserView.vue -->
<template>
  <div class="user-dashboard">
    <!-- Mostrar spinner de carga -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <p>Cargando datos del usuario...</p>
        <div class="spinner"></div>
      </div>
    </div>

    <!-- Mostrar error si existe -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <h3>⚠️ Error al cargar datos</h3>
        <p>{{ error }}</p>
        <button @click="fetchUserData" class="retry-button">🔄 Reintentar</button>
      </div>
    </div>

    <!-- Mostrar datos cuando estén cargados -->
    <div v-else class="user-container">
      <!-- Sección izquierda: Información principal del usuario -->
      <div class="user-info">
        <div class="user-photo">
          <!-- Mostrar foto si existe, sino placeholder -->
          <img v-if="user.photo_url" :src="user.photo_url" alt="Foto del usuario" />
          <div v-else class="placeholder-photo">
            <span>📷</span>
            <small>Sin foto</small>
          </div>
        </div>

        <!-- Información básica del usuario -->
        <h2 class="user-name">{{ user.name || 'Usuario sin nombre' }}</h2>
        <p class="user-email" v-if="user.email">✉️ {{ user.email }}</p>

        <!-- Información complementaria -->
        <div class="user-details-summary">
          <p class="user-business" v-if="user.company_name">🏢 {{ user.company_name }}</p>
          <p class="user-contact" v-if="user.phone">📞 {{ user.phone }}</p>
          <p class="user-address" v-if="user.company_address">📍 {{ user.company_address }}</p>
        </div>

        <!-- Botón para editar perfil -->
        <button @click="enableEditMode" class="edit-button">✏️ Editar Perfil</button>
      </div>

      <!-- Sección derecha: Información adicional -->
      <div class="user-details">
        <!-- Panel de información adicional -->
        <div class="user-stats">
          <h3>📊 Información Adicional</h3>
          <div class="additional-info">
            <!-- Solo mostrar campos que existen en el backend -->
            <div v-if="user.blood_type" class="info-item">
              <span class="info-label">🩸 Tipo de sangre:</span>
              <span class="info-value">{{ user.blood_type }}</span>
            </div>
            <div v-if="user.recovery_email" class="info-item">
              <span class="info-label">📧 Email de recuperación:</span>
              <span class="info-value">{{ user.recovery_email }}</span>
            </div>
            <div v-if="user.city" class="info-item">
              <span class="info-label">🏙️ Ciudad:</span>
              <span class="info-value">{{ user.city }}</span>
            </div>

            <!-- Mensaje si no hay información adicional -->
            <div v-if="!hasAdditionalInfo" class="no-additional-info">
              <p>ℹ️ No hay información adicional registrada</p>
              <small>Haz clic en "Editar Perfil" para completar tu información</small>
            </div>
          </div>
        </div>

        <!-- Panel de notificaciones -->
        <div class="user-notifications">
          <h3>🔔 Notificaciones</h3>
          <div class="notifications-content">
            <!-- Mostrar notificaciones si existen -->
            <ul v-if="user.notifications && user.notifications.length > 0">
              <li
                v-for="(notification, index) in user.notifications"
                :key="index"
                class="notification-item"
              >
                <span class="notification-message">{{ notification.message }}</span>
                <small class="notification-date" v-if="notification.date">
                  {{ formatDate(notification.date) }}
                </small>
              </li>
            </ul>
            <!-- Mensaje si no hay notificaciones -->
            <div v-else class="no-notifications">
              <p>✅ No tienes notificaciones pendientes</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- === MODAL DE EDICIÓN SIMPLE === -->
    <div v-if="editMode" class="modal-overlay" @click="closeEditMode">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✏️ Editar Perfil</h3>
          <button @click="closeEditMode" class="close-button">✕</button>
        </div>
        
        <form @submit.prevent="saveProfile" class="edit-form">
          <!-- Información de la empresa -->
          <div class="form-group">
            <label>🏢 Nombre de la empresa:</label>
            <input v-model="editData.company_name" type="text" placeholder="Ej: Tech Solutions S.A.S" />
          </div>
          
          <div class="form-group">
            <label>📍 Dirección de la empresa:</label>
            <input v-model="editData.company_address" type="text" placeholder="Ej: Calle 123 #45-67" />
          </div>
          
          <div class="form-group">
            <label>📞 Teléfono:</label>
            <input v-model="editData.phone" type="tel" placeholder="Ej: +57 300 123 4567" />
          </div>
          
          <div class="form-group">
            <label>📧 Email de recuperación:</label>
            <input v-model="editData.recovery_email" type="email" placeholder="Ej: backup@email.com" />
          </div>
          
          <div class="form-group">
            <label>🏙️ Ciudad:</label>
            <input v-model="editData.city" type="text" placeholder="Ej: Bogotá" />
          </div>
          
          <div class="form-group">
            <label>🩸 Tipo de sangre:</label>
            <select v-model="editData.blood_type">
              <option value="">Seleccionar...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <!-- Botones -->
          <div class="form-actions">
            <button type="button" @click="closeEditMode" class="cancel-button">❌ Cancelar</button>
            <button type="submit" :disabled="saving" class="save-button">
              <span v-if="saving">💾 Guardando...</span>
              <span v-else>✅ Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/services/axios'

export default {
  name: 'UserView',
  data() {
    return {
      user: {},
      loading: false,
      error: null,
      editMode: false,
      saving: false,
      editData: {}
    }
  },

  computed: {
    hasAdditionalInfo() {
      return this.user.blood_type || this.user.recovery_email || this.user.city
    },
  },

  created() {
    // === DEBUGGING TEMPORAL ===
    console.log('=== VERIFICACIÓN LOCALSTORAGE ===');
    console.log('Raw user:', localStorage.getItem('user'));
    console.log('Raw access_token:', localStorage.getItem('access_token'));
    
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      console.log('Parsed user:', parsed);
      console.log('¿Tiene access_token?:', parsed.access_token);
      console.log('¿Tiene user.id?:', parsed.user?.id);
      console.log('¿Tiene id directo?:', parsed.id);
    }
    
    this.fetchUserData();
  },

  methods: {
    async fetchUserData() {
      this.loading = true
      this.error = null

      try {
        console.log('🚀 Obteniendo datos del usuario actual...')
        const response = await axios.get('/user/me')
        console.log('✅ Datos del usuario recibidos:', response.data)
        
        this.user = response.data
        this.initializeEditData()
        
      } catch (err) {
        console.error('❌ Error al obtener datos:', err)
        
        if (err.response?.status === 401) {
          this.error = 'Tu sesión ha expirado. Serás redirigido al login.'
          setTimeout(() => this.$router.push('/login'), 3000)
        } else {
          this.error = 'Error al cargar los datos del usuario. Verifica tu conexión.'
        }
      } finally {
        this.loading = false
      }
    },

    initializeEditData() {
      this.editData = {
        company_name: this.user.company_name || '',
        company_address: this.user.company_address || '',
        phone: this.user.phone || '',
        recovery_email: this.user.recovery_email || '',
        city: this.user.city || '',
        blood_type: this.user.blood_type || ''
      }
    },

    enableEditMode() {
      this.initializeEditData()
      this.editMode = true
      console.log('📝 Modo de edición activado')
    },

    closeEditMode() {
      this.editMode = false
      this.saving = false
    },

    async saveProfile() {
      this.saving = true
      console.log('💾 Guardando perfil...', this.editData)

      try {
        const response = await axios.put(`/user/${this.user.id}/profile`, this.editData)
        console.log('✅ Perfil actualizado:', response.data)
        
        this.user = response.data
        this.closeEditMode()
        alert('✅ Perfil actualizado correctamente')
        
      } catch (err) {
        console.error('❌ Error al guardar:', err)
        alert('❌ Error al guardar los cambios')
      } finally {
        this.saving = false
      }
    },

    getUserId() {
      const user = localStorage.getItem('user')
      if (user) {
        try {
          const userData = JSON.parse(user)
          return userData.user?.id || userData.id
        } catch (error) {
          console.error('Error al parsear datos del usuario:', error)
          return null
        }
      }
      return null
    },

    formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        return dateString
      }
    },

    async refreshUserData() {
      await this.fetchUserData()
    },
  },
}
</script>

<style scoped>
/* === ESTILOS ORIGINALES === */
.user-dashboard {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  width: 100%;
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
}

.error-content h3 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.retry-button {
  background: #409eff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: #3a8ee6;
}

.user-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-top: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 2px solid #f0f0f0;
  padding-right: 2rem;
}

.user-photo {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 4px solid #e9ecef;
  transition: transform 0.3s ease;
}

.user-photo:hover {
  transform: scale(1.05);
}

.user-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-photo {
  text-align: center;
  color: #6c757d;
}

.placeholder-photo span {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
}

.user-email {
  color: #7f8c8d;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.user-details-summary {
  width: 100%;
  margin-bottom: 1.5rem;
}

.user-business,
.user-contact,
.user-address {
  margin-bottom: 0.75rem;
  color: #495057;
  font-size: 0.95rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.edit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-left: 1rem;
}

.user-stats,
.user-notifications {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.user-stats h3,
.user-notifications h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.info-label {
  font-weight: 600;
  color: #495057;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
}

.no-additional-info {
  text-align: center;
  padding: 1.5rem;
  color: #6c757d;
  background: white;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.notification-item {
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border-left: 4px solid #17a2b8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notification-message {
  color: #2c3e50;
  font-weight: 500;
}

.notification-date {
  color: #6c757d;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.25rem;
}

.no-notifications {
  text-align: center;
  padding: 1.5rem;
  color: #28a745;
  background: white;
  border-radius: 8px;
  border: 2px solid #d4edda;
}

/* === ESTILOS SIMPLES PARA EL MODAL === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  background: #409eff;
  color: white;
  border-radius: 12px 12px 0 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.edit-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button,
.save-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button {
  background: #6c757d;
  color: white;
}

.save-button {
  background: #28a745;
  color: white;
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .user-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
  }

  .user-info {
    border-right: none;
    border-bottom: 2px solid #f0f0f0;
    padding-right: 0;
    padding-bottom: 1.5rem;
  }

  .user-details {
    padding-left: 0;
  }

  .user-dashboard {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .user-photo {
    width: 100px;
    height: 100px;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>