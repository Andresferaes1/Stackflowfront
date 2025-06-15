<!-- PasswordRecoveryModal.vue -->
<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h3>Recuperar contraseña</h3>
      <form @submit.prevent="handleSubmit">
        <label for="email">Correo electrónico:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="usuario@dominio.com"
        />
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">{{ success }}</div>
        <div class="modal-actions">
          <button type="submit" :disabled="loading">
            {{ loading ? "Enviando..." : "Enviar enlace" }}
          </button>
          <button type="button" @click="closeModal" :disabled="loading">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close'])

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

watch(() => props.show, (val) => {
  if (val) {
    email.value = ''
    error.value = ''
    success.value = ''
  }
})

const handleSubmit = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await axios.post('http://localhost:8000/recovery', { email: email.value })
    success.value = 'Si el correo está registrado, se enviará un enlace de recuperación.'
  } catch (e) {
  error.value = 'No se pudo enviar el correo. Intenta de nuevo.'
  console.error('Error al enviar correo de recuperación:', e)
}
  loading.value = false
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.error { color: #c00; margin-top: 0.5rem; }
.success { color: #090; margin-top: 0.5rem; }
</style>