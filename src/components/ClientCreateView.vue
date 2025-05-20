<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\clients\ClientCreateView.vue -->
<template>
    <div>
      <h2>Registrar Cliente</h2>
      <form @submit.prevent="submitForm">
        <div>
          <label for="name">Nombre:</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div>
          <label for="email">Correo:</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <div>
          <label for="phone">Teléfono:</label>
          <input type="tel" id="phone" v-model="form.phone" required />
        </div>
        <button type="submit">Registrar</button>
      </form>
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
          phone: ''
        }
      };
    },
    methods: {
      submitForm() {
        console.log('Formulario enviado:', this.form);
        // Aquí puedes agregar lógica para enviar los datos al servidor
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
  label {
    font-weight: bold;
  }
  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 0.5rem 1rem;
    background-color: #003366;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #005c8b;
  }
  </style>