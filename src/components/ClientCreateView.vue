<template>
  <div class="user-dashboard">
    <div class="form-content">
      <h2>Registrar Cliente</h2>
      <form @submit.prevent="submitForm">
        <div class="form-grid">
          <!-- Primera columna -->
          <div class="form-section">
            <div class="form-group">
              <label for="name">Nombre:</label>
              <input type="text" id="name" v-model="form.name" required />
            </div>
            <div class="form-group">
              <label for="email">Correo:</label>
              <input type="email" id="email" v-model="form.email" required />
            </div>
            <div class="form-group">
              <label for="phone">Teléfono:</label>
              <input type="tel" id="phone" v-model="form.phone" required />
            </div>
            <div class="form-group">
              <label for="address">Dirección:</label>
              <input type="text" id="address" v-model="form.address" required />
            </div>
          </div>
          <!-- Segunda columna -->
          <div class="form-section">
            <div class="form-group">
              <label for="company">Empresa:</label>
              <input type="text" id="company" v-model="form.company" required />
            </div>
            <div class="form-group">
              <label for="nit">NIT:</label>
              <input type="text" id="nit" v-model="form.nit" required />
            </div>
            <div class="form-group">
              <label for="city">Ciudad:</label>
              <input type="text" id="city" v-model="form.city" required />
            </div>
            <div class="form-group">
              <label for="contactPerson">Persona de Contacto:</label>
              <input type="text" id="contactPerson" v-model="form.contactPerson" required />
            </div>
          </div>
        </div>
        <button type="submit">Registrar Cliente</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientCreateView',
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        nit: '',
        city: '',
        contactPerson: ''
      }
    };
  },
  methods: {
    async submitForm() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        if (!this.form.email.includes('@')) {
          alert('Por favor ingrese un email válido');
          return;
        }

        console.log('Formulario enviado:', this.form);
        this.resetForm();
        alert('Cliente registrado exitosamente');
        
      } catch (error) {
        console.error('Error al registrar cliente:', error);
        alert('Error al registrar cliente');
      }
    },
    
    resetForm() {
      this.form = {
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        nit: '',
        city: '',
        contactPerson: ''
      };
    }
  }
};
</script>

<style scoped>
.user-dashboard {
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.form-content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  background-color: #f8f9fa;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

button[type="submit"] {
  display: block;
  width: 300px;
  margin: 2rem auto 0;
  padding: 1rem 2rem;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #337ecc;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-content {
    padding: 1.5rem;
    margin: 0 1rem;
  }

  button[type="submit"] {
    width: 100%;
  }
}
</style>