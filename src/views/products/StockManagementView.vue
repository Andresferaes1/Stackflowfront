<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\products\StockManagementView.vue -->
<template>
  <div class="stock-management">
    <h2>Gestión de Inventario</h2>
    
    <!-- Selector de operación -->
    <div class="operation-selector">
      <button 
        :class="['tab-button', { active: currentOperation === 'stock' }]"
        @click="currentOperation = 'stock'"
      >
        Gestionar Stock
      </button>
      <button 
        :class="['tab-button', { active: currentOperation === 'create' }]"
        @click="currentOperation = 'create'"
      >
        Crear Producto
      </button>
    </div>

    <!-- Formulario de Gestión de Stock -->
    <form v-if="currentOperation === 'stock'" @submit.prevent="addToPreview" class="operation-form">
      <div class="form-grid">
        <div class="form-group">
          <label for="productId">Código del Producto:</label>
          <input type="text" id="productId" v-model="stockForm.productId" required />
        </div>
        <div class="form-group">
          <label for="amount">Cantidad:</label>
          <input type="number" id="amount" v-model.number="stockForm.amount" required />
        </div>
        <div class="form-group">
          <label for="action">Acción:</label>
          <select id="action" v-model="stockForm.action" required>
            <option value="add">Adicionar Stock</option>
            <option value="remove">Remover Stock</option>
          </select>
        </div>
      </div>
      <button type="submit" class="add-button">Agregar a la lista</button>
    </form>

    <!-- Formulario de Creación de Producto -->
    <form v-else @submit.prevent="addToPreview" class="operation-form">
      <div class="form-grid">
        <div class="form-group">
          <label for="code">Código:</label>
          <input type="text" id="code" v-model="productForm.code" required />
        </div>
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input type="text" id="name" v-model="productForm.name" required />
        </div>
        <div class="form-group">
          <label for="description">Descripción:</label>
          <input type="text" id="description" v-model="productForm.description" required />
        </div>
        <div class="form-group">
          <label for="price">Precio:</label>
          <input type="number" id="price" v-model.number="productForm.price" required />
        </div>
        <div class="form-group">
          <label for="category">Categoría:</label>
          <input type="text" id="category" v-model="productForm.category" required />
        </div>
        <div class="form-group">
          <label for="initialStock">Stock Inicial:</label>
          <input type="number" id="initialStock" v-model.number="productForm.initialStock" required />
        </div>
      </div>
      <button type="submit" class="add-button">Agregar a la lista</button>
    </form>

    <!-- Tabla de previsualización -->
    <div v-if="previewData.length > 0" class="preview-section">
      <h3>Operaciones Pendientes</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in previewData" :key="index">
              <td v-for="header in tableHeaders" :key="header">{{ item[header] }}</td>
              <td>
                <button @click="removeItem(index)" class="delete-button">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button @click="confirmChanges" class="confirm-button">
        Confirmar Operaciones
      </button>
    </div>

    <p v-if="message" :class="['message', messageType]">{{ message }}</p>
  </div>
</template>

<script>
import axios from '@/services/axios';

export default {
  name: 'StockManagementView',
  data() {
    return {
      currentOperation: 'stock',
      stockForm: {
        productId: '',
        amount: null,
        action: 'add'
      },
      productForm: {
        code: '',
        name: '',
        description: '',
        price: null,
        category: '',
        initialStock: null
      },
      previewData: [],
      message: '',
      messageType: 'info',
      isProcessing: false
    };
  },
  computed: {
    tableHeaders() {
      return this.currentOperation === 'stock' 
        ? ['código', 'cantidad', 'acción']
        : ['código', 'nombre', 'descripción', 'precio', 'categoría', 'stock_inicial'];
    }
  },
  methods: {
    addToPreview() {
      if (this.currentOperation === 'stock') {
        this.previewData.push({
          'código': this.stockForm.productId,
          'cantidad': this.stockForm.amount,
          'acción': this.stockForm.action === 'add' ? 'Adicionar' : 'Remover'
        });
        this.resetStockForm();
      } else {
        this.previewData.push({
          'código': this.productForm.code,
          'nombre': this.productForm.name,
          'descripción': this.productForm.description,
          'precio': this.productForm.price,
          'categoría': this.productForm.category,
          'stock_inicial': this.productForm.initialStock
        });
        this.resetProductForm();
      }
    },

    removeItem(index) {
      this.previewData.splice(index, 1);
    },

    resetStockForm() {
      this.stockForm = {
        productId: '',
        amount: null,
        action: 'add'
      };
    },

    resetProductForm() {
      this.productForm = {
        code: '',
        name: '',
        description: '',
        price: null,
        category: '',
        initialStock: null
      };
    },

    async confirmChanges() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        const endpoint = this.currentOperation === 'stock'
          ? '/products/batch-stock-update/'
          : '/products/batch-create/';

        const response = await axios.post(endpoint, {
          data: this.previewData
        });

        this.message = response.data.message || 'Operaciones realizadas con éxito';
        this.messageType = 'success';
        this.previewData = [];
      } catch (error) {
        console.error('Error:', error);
        this.message = error.response?.data?.detail || 'Error al procesar las operaciones';
        this.messageType = 'error';
      } finally {
        this.isProcessing = false;
      }
    }
  }
};
</script>

<style scoped>
.stock-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.operation-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.tab-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  background-color: #f0f2f5;
}

.tab-button.active {
  background-color: #409eff;
  color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-button {
  background-color: #409eff;
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 1rem auto;
  display: block;
}

.preview-section {
  margin-top: 2rem;
  background-color: white;
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
}

th, td {
  padding: 0.8rem;
  text-align: left;
  border: 1px solid #dcdfe6;
}

th {
  background-color: #f4f4f5;
  font-weight: 600;
}

.delete-button {
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}

.confirm-button {
  background-color: #67c23a;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 2rem auto 0;
  display: block;
  font-size: 1.1rem;
}

.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.message.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.message.error {
  background-color: #fef0f0;
  color: #f56c6c;
}
</style>