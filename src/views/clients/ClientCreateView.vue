<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\clients\ClientCreateView.vue -->
<template>
    <div>
      <h2>Registrar Cliente</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div class="form-group">
          <label for="nit">NIT:</label>
          <input type="text" id="nit" v-model="form.nit" required />
        </div>
        <div class="form-group">
          <label for="legal-representative">Nombre del Representante Legal:</label>
          <input type="text" id="legal-representative" v-model="form.legalRepresentative" required />
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
          <label for="alt-phone">Teléfono Alternativo:</label>
          <input type="tel" id="alt-phone" v-model="form.altPhone" />
        </div>
        <div class="form-group">
          <label for="address">Dirección:</label>
          <input type="text" id="address" v-model="form.address" required />
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'ClientCreateView',
    data() {
      return {
        form: {
          name: '',
          nit: '',
          legalRepresentative: '',
          email: '',
          phone: '',
          altPhone: '',
          address: ''
        }
      };
    },
    methods: {
      async submitForm() {
        try {
          const response = await axios.post('http://localhost:8000/clients/', this.form);
          alert('Cliente registrado exitosamente');
          console.log('Respuesta del servidor:', response.data);
          // Limpia el formulario después de enviarlo
          this.form = {
            name: '',
            nit: '',
            legalRepresentative: '',
            email: '',
            phone: '',
            altPhone: '',
            address: ''
          };
        } catch (error) {
          console.error('Error al registrar el cliente:', error);
          if (error.response && error.response.data.detail) {
            alert(`Error: ${error.response.data.detail}`);
          } else {
            alert('Hubo un error al registrar el cliente');
          }
        }
      }
    }
  };
  </script>
  
  <style scoped>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  label {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    max-width: 400px;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    padding: 0.5rem 1rem;
    background-color: #11aa32;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #005c8b;
  }
  </style>