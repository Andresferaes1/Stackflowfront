<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\products\CsvUploadView.vue -->
<template>
    <div class="csv-upload">
      <h2>Cargar Archivo CSV</h2>
      <form @submit.prevent="handleFileUpload">
        <div class="form-group">
          <label for="csvFile">Seleccionar archivo CSV:</label>
          <input type="file" id="csvFile" @change="onFileChange" accept=".csv" required />
        </div>
        <div class="form-group">
          <label for="action">Acción:</label>
          <select id="action" v-model="action" required>
            <option value="upload-products">Cargar Productos</option>
            <option value="upload-stock">Actualizar Stock</option>
          </select>
        </div>
        <button type="submit">Cargar Archivo</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'CsvUploadView',
    data() {
      return {
        file: null,
        action: 'upload-products',
        message: '',
      };
    },
    methods: {
      onFileChange(event) {
        this.file = event.target.files[0];
      },
      async handleFileUpload() {
        if (!this.file) {
          this.message = 'Por favor selecciona un archivo.';
          return;
        }
  
        const formData = new FormData();
        formData.append('file', this.file);
  
        try {
          const endpoint =
            this.action === 'upload-products'
              ? 'http://localhost:8000/products/upload-products/'
              : 'http://localhost:8000/products/upload-stock/';
  
          const response = await axios.post(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
          this.message = response.data.message;
        } catch (error) {
          console.error('Error al cargar el archivo:', error);
          this.message = error.response?.data?.detail || 'Error al cargar el archivo.';
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Igual que antes */
  </style>