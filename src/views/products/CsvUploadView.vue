<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\products\CsvUploadView.vue -->
<template>
  <div class="upload-container">
    <div class="upload-section">
      <h2>Cargar Archivo CSV</h2>
      
      <div class="info-boxes">
        <div class="info-box">
          <h3>Carga de Productos</h3>
          <p>Use esta opción para crear nuevos productos en el sistema. El archivo CSV debe contener las siguientes columnas:</p>
          <ul>
            <li>código</li>
            <li>nombre</li>
            <li>descripción</li>
            <li>precio</li>
            <li>categoría</li>
          </ul>
        </div>
        <div class="info-box">
          <h3>Actualización de Stock</h3>
          <p>Use esta opción para actualizar el inventario de productos existentes. El archivo CSV debe contener:</p>
          <ul>
            <li>código del producto</li>
            <li>cantidad a agregar/restar</li>
            <li>tipo de movimiento (entrada/salida)</li>
          </ul>
        </div>
      </div>

      <form @submit.prevent="handleFileUpload" class="upload-form">
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
        
        <button type="submit" class="upload-button">Cargar Archivo</button>
      </form>

      <p v-if="message" :class="['message', messageType]">{{ message }}</p>
    </div>

    <!-- Tabla de previsualización -->
    <div class="preview-section" v-if="previewData.length > 0">
      <h3>Previsualización de Datos</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in previewData" :key="index">
              <td v-for="header in tableHeaders" :key="header">{{ row[header] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="confirm-button" @click="confirmChanges">
        Confirmar los cambios realizados
      </button>
    </div>
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
      messageType: 'info',
      previewData: [],
      tableHeaders: [],
      isLoading: false,
      isProcessing: false
    };
  },
  
  computed: {
    expectedHeaders() {
      return this.action === 'upload-products' 
        ? ['codigo', 'nombre', 'descripcion', 'precio', 'categoria']
        : ['codigo', 'cantidad', 'tipo_movimiento'];
    }
  },

  methods: {
    onFileChange(event) {
      this.file = event.target.files[0];
      this.message = '';
      this.previewCsvFile();
    },
    
    async previewCsvFile() {
      if (!this.file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n');
          
          if (rows.length === 0) {
            this.showError('El archivo está vacío');
            return;
          }

          // Validar encabezados
          const headers = rows[0].toLowerCase().split(',').map(h => h.trim());
          
          // Verificar que estén todos los encabezados requeridos
          const missingHeaders = this.expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            this.showError(`Faltan los siguientes encabezados: ${missingHeaders.join(', ')}`);
            return;
          }

          this.tableHeaders = headers;
          
          // Procesar filas de datos
          this.previewData = rows.slice(1)
            .map(row => {
              if (!row.trim()) return null;
              const values = row.split(',');
              const rowData = {};
              
              headers.forEach((header, index) => {
                rowData[header] = values[index]?.trim() || '';
              });

              // Validaciones específicas según el tipo de acción
              if (this.action === 'upload-products') {
                if (!rowData.precio || isNaN(rowData.precio)) {
                  rowData._error = 'Precio inválido';
                }
              } else {
                if (!rowData.cantidad || isNaN(rowData.cantidad)) {
                  rowData._error = 'Cantidad inválida';
                }
                if (!['entrada', 'salida'].includes(rowData.tipo_movimiento?.toLowerCase())) {
                  rowData._error = 'Tipo de movimiento inválido';
                }
              }
              
              return rowData;
            })
            .filter(row => row && Object.values(row).some(value => value));

          if (this.previewData.length === 0) {
            this.showError('No se encontraron datos válidos en el archivo');
          }
          
        } catch (error) {
          console.error('Error al procesar el archivo:', error);
          this.showError('Error al procesar el archivo CSV');
        }
      };

      reader.onerror = () => {
        this.showError('Error al leer el archivo');
      };

      reader.readAsText(this.file);
    },

    showError(message) {
      this.message = message;
      this.messageType = 'error';
      this.previewData = [];
      this.tableHeaders = [];
    },

    async handleFileUpload() {
      if (!this.file) {
        this.showError('Por favor selecciona un archivo.');
        return;
      }

      if (this.isProcessing) {
        return;
      }

      this.isProcessing = true;
      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('action', this.action);

      try {
        const endpoint = this.action === 'upload-products'
          ? 'http://localhost:8000/products/upload-products/'
          : 'http://localhost:8000/products/upload-stock/';

        const response = await axios.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        this.message = response.data.message || 'Archivo procesado correctamente';
        this.messageType = 'success';
        
      } catch (error) {
        console.error('Error al cargar el archivo:', error);
        this.showError(error.response?.data?.detail || 'Error al cargar el archivo');
      } finally {
        this.isProcessing = false;
      }
    },

    async confirmChanges() {
  if (this.isProcessing) {
    return;
  }

  this.isProcessing = true;

  try {
    const endpoint = this.action === 'upload-products'
      ? 'http://localhost:8000/products/confirm-upload/'
      : 'http://localhost:8000/products/confirm-stock-update/';

    const response = await axios.post(endpoint, {
      data: this.previewData
    });

    // Usar el mensaje de la respuesta del servidor o un mensaje predeterminado
    this.message = response.data.message || 'Cambios confirmados exitosamente';
    this.messageType = 'success';
    this.previewData = [];
    this.file = null;
    
    // Limpiar input file
    const fileInput = document.getElementById('csvFile');
    if (fileInput) fileInput.value = '';
    
  } catch (error) {
    console.error('Error al confirmar los cambios:', error);
    this.showError(error.response?.data?.detail || 'Error al confirmar los cambios');
  } finally {
    this.isProcessing = false;
  }
}
  }
};
</script>

<style scoped>
.upload-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.info-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1.5rem;
}

.info-box ul {
  margin-top: 1rem;
  padding-left: 1.5rem;
}

.info-box li {
  margin-bottom: 0.5rem;
  color: #495057;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

input[type="file"],
select {
  padding: 0.8rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.upload-button,
.confirm-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button {
  background-color: #409eff;
  color: white;
  width: 100%;
  max-width: 300px;
  margin: 1rem auto;
}

.confirm-button {
  background-color: #67c23a;
  color: white;
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  display: block;
}

.upload-button:hover {
  background-color: #337ecc;
}

.confirm-button:hover {
  background-color: #529b2e;
}

.message {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
  font-size: 1.1rem;
}

.message.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.message.error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.preview-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  border: 1px solid #dcdfe6;
  padding: 0.8rem;
  text-align: left;
}

th {
  background-color: #f4f4f5;
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: #fafafa;
}

@media (max-width: 768px) {
  .info-boxes {
    grid-template-columns: 1fr;
  }

  .upload-container {
    padding: 1rem;
  }
}
</style>