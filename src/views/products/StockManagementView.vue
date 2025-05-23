<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\products\StockManagementView.vue -->
<template>
    <div class="stock-management">
      <h2>Gestión de Inventario</h2>
      <form @submit.prevent="updateStock">
        <div class="form-group">
          <label for="productId">ID del Producto:</label>
          <input type="number" id="productId" v-model="productId" required />
        </div>
        <div class="form-group">
          <label for="amount">Cantidad:</label>
          <input type="number" id="amount" v-model="amount" required />
        </div>
        <div class="form-group">
          <label for="action">Acción:</label>
          <select id="action" v-model="action" required>
            <option value="add">Adicionar Stock</option>
            <option value="remove">Remover Stock</option>
          </select>
        </div>
        <button type="submit">Actualizar Inventario</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import axios from '@/services/axios'; // Importa la instancia configurada
  // de Axios para hacer peticiones HTTP
  
  export default {
    name: 'StockManagementView',
    data() {
      return {
        productId: null,
        amount: null,
        action: 'add',
        message: '',
      };
    },
    methods: {
      async updateStock() {
        if (!this.productId || !this.amount) {
    this.message = 'Por favor, completa todos los campos.';
    return;
  }
        try {
          const endpoint =
            this.action === 'add'
            ? `/products/add-stock/${this.productId}`
            : `/products/remove-stock/${this.productId}`;
  
          const response = await axios.post(endpoint, null, {
            params: { amount: this.amount },
          });
  
          this.message = response.data.message;
        } catch (error) {
          console.error('Error al actualizar el inventario:', error);
          this.message = error.response?.data?.detail || 'Error al actualizar el inventario.';
          
        } 

      },
    },
  };
  </script>
  
  <style scoped>
  .stock-management {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  .form-group {
    margin-bottom: 1rem;
  }
  label {
    font-weight: bold;
  }
  input, select {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
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
  .message {
    margin-top: 1rem;
    font-weight: bold;
  }
  </style>