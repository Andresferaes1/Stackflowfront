<!-- filepath: src/views/products/CsvUploadView.vue -->
<template>
  <div class="csv-upload-workspace">
    <!-- Header optimizado con colores del sistema -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <span class="page-icon">📊</span>
            Carga Masiva de Productos
          </h1>
          <p class="page-subtitle">
            Importa productos desde archivos CSV con vista previa y validación
          </p>
        </div>
        <div class="upload-status" :class="uploadStatusClass">
          <span class="status-icon">{{ statusIcon }}</span>
          <span class="status-text">{{ uploadStatus }}</span>
        </div>
      </div>
    </div>

    <!-- Panel de carga de archivo -->
    <div class="upload-panel">
      <div class="panel-header">
        <h3><span class="section-icon">📁</span>Seleccionar Archivo CSV</h3>
      </div>
      <div class="panel-content">
        <div
          class="upload-zone"
          :class="{ 'drag-over': isDragOver }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <div class="upload-icon">📤</div>
          <h4>Arrastra tu archivo CSV aquí</h4>
          <p>o</p>
          <label for="csvFile" class="file-input-label">
            <span class="upload-button">Seleccionar Archivo</span>
            <input type="file" id="csvFile" accept=".csv" @change="handleFileUpload" />
          </label>
          <div class="upload-info">
            <p><strong>Formato requerido:</strong> .csv con separador de comas</p>
            <p>
              <strong>Columnas esperadas:</strong> name, description, category, unit_price,
              stock_quantity, min_stock, brand, supplier, sku
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de vista previa -->
    <div v-if="csvData.length > 0" class="preview-panel">
      <div class="panel-header">
        <h3>
          <span class="section-icon">👁️</span>Vista Previa de Datos ({{ csvData.length }} productos)
        </h3>
        <div class="panel-actions">
          <button class="btn secondary" @click="clearData">
            <span class="btn-icon">🗑️</span>
            Limpiar
          </button>
          <button class="btn primary" @click="validateAndUpload" :disabled="isUploading">
            <span class="btn-icon">{{ isUploading ? '⏳' : '✅' }}</span>
            {{ isUploading ? 'Procesando...' : 'Validar y Cargar' }}
          </button>
        </div>
      </div>
      <div class="panel-content">
        <div class="table-container">
          <table class="products-preview-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Stock Mín.</th>
                <th>Marca</th>
                <th>Proveedor</th>
                <th>SKU</th>
                <th>Margen (%)</th>
                <th>Ubicación</th>
                <th>Peso (kg)</th>
                <th>Dimensiones</th>
                <th>Estado Prod.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in csvData" :key="index" :class="getRowClass(product)">
                <td class="status-cell">
                  <span class="validation-status" :class="product.validation?.status || 'pending'">
                    {{ getValidationIcon(product.validation?.status) }}
                  </span>
                </td>
                <td class="name-cell">{{ product.name || '-' }}</td>
                <td class="description-cell">
                  <div class="description-content">{{ product.description || '-' }}</div>
                </td>
                <td class="category-cell">{{ product.category || '-' }}</td>
                <td class="price-cell">${{ formatNumber(product.unit_price) }}</td>
                <td class="stock-cell">{{ product.stock_quantity || 0 }}</td>
                <td class="min-stock-cell">{{ product.min_stock || 0 }}</td>
                <td class="brand-cell">{{ product.brand || '-' }}</td>
                <td class="supplier-cell">{{ product.supplier || '-' }}</td>
                <td class="sku-cell">{{ product.sku || '-' }}</td>
                <td class="margin-cell">{{ product.profit_margin || 0 }}%</td>
                <td class="location-cell">{{ product.warehouse_location || '-' }}</td>
                <td class="weight-cell">{{ product.weight || '-' }}</td>
                <td class="dimensions-cell">{{ product.dimensions || '-' }}</td>
                <td class="product-status-cell">
                  <span class="product-status" :class="product.product_status || 'active'">
                    {{ getProductStatusText(product.product_status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Panel de resultados -->
    <div v-if="uploadResults.length > 0" class="results-panel">
      <div class="panel-header">
        <h3><span class="section-icon">📋</span>Resultados de Carga</h3>
      </div>
      <div class="panel-content">
        <div class="results-summary">
          <div class="result-stat success">
            <span class="stat-icon">✅</span>
            <span class="stat-number">{{ successCount }}</span>
            <span class="stat-label">Exitosos</span>
          </div>
          <div class="result-stat error">
            <span class="stat-icon">❌</span>
            <span class="stat-number">{{ errorCount }}</span>
            <span class="stat-label">Con Errores</span>
          </div>
          <div class="result-stat total">
            <span class="stat-icon">📊</span>
            <span class="stat-number">{{ uploadResults.length }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        <div v-if="errorCount > 0" class="error-details">
          <h4>Detalles de Errores:</h4>
          <ul>
            <li v-for="(error, index) in errorDetails" :key="index">
              <strong>Fila {{ error.row }}:</strong> {{ error.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/services/axios'

export default {
  name: 'CsvUploadView',
  data() {
    return {
      csvData: [],
      uploadResults: [],
      uploadStatus: 'Listo para cargar',
      isUploading: false,
      isDragOver: false,
      errorDetails: [],
    }
  },
  computed: {
    uploadStatusClass() {
      if (this.isUploading) return 'uploading'
      if (this.csvData.length > 0) return 'ready'
      return 'waiting'
    },
    statusIcon() {
      if (this.isUploading) return '⏳'
      if (this.csvData.length > 0) return '✅'
      return '⏱️'
    },
    successCount() {
      return this.uploadResults.filter((r) => r.success).length
    },
    errorCount() {
      return this.uploadResults.filter((r) => !r.success).length
    },
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file && file.type === 'text/csv') {
        this.processFile(file)
      } else {
        alert('Por favor selecciona un archivo CSV válido')
      }
    },

    handleDrop(event) {
      event.preventDefault()
      this.isDragOver = false
      const file = event.dataTransfer.files[0]
      if (file && file.type === 'text/csv') {
        this.processFile(file)
      }
    },

    handleDragOver(event) {
      event.preventDefault()
      this.isDragOver = true
    },

    handleDragLeave() {
      this.isDragOver = false
    },

    processFile(file) {
      this.uploadStatus = 'Procesando archivo...'
      this.isUploading = true

      const reader = new FileReader()
      reader.onload = (e) => {
        this.parseCSV(e.target.result)
        this.isUploading = false
        this.uploadStatus = `${this.csvData.length} productos cargados`
      }
      reader.readAsText(file)
    },

    parseCSV(csvText) {
      const lines = csvText.split('\n').filter((line) => line.trim())
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))

      this.csvData = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))
        const product = {}

        headers.forEach((header, index) => {
          product[header] = values[index] || ''
        })

        // Agregar campos calculados y nuevas características
        product.profit_margin = this.calculateMargin(product.unit_price, product.cost_price)
        product.warehouse_location = product.warehouse_location || 'A-01-01'
        product.weight = product.weight || ''
        product.dimensions = product.dimensions || ''
        product.product_status = product.product_status || 'active'
        product.validation = this.validateProduct(product)

        this.csvData.push(product)
      }
    },

    validateProduct(product) {
      const errors = []

      if (!product.name) errors.push('Nombre requerido')
      if (!product.unit_price || isNaN(parseFloat(product.unit_price)))
        errors.push('Precio inválido')
      if (!product.stock_quantity || isNaN(parseInt(product.stock_quantity)))
        errors.push('Stock inválido')

      return {
        status: errors.length === 0 ? 'valid' : 'error',
        errors: errors,
      }
    },

    calculateMargin(salePrice, costPrice) {
      if (!salePrice || !costPrice) return 0
      const sale = parseFloat(salePrice)
      const cost = parseFloat(costPrice)
      return (((sale - cost) / sale) * 100).toFixed(2)
    },

    getRowClass(product) {
      if (!product.validation) return ''
      return product.validation.status === 'valid' ? 'valid-row' : 'error-row'
    },

    getValidationIcon(status) {
      const icons = {
        valid: '✅',
        error: '❌',
        pending: '⏳',
      }
      return icons[status] || '⏱️'
    },

    getProductStatusText(status) {
      const statuses = {
        active: 'Activo',
        inactive: 'Inactivo',
        discontinued: 'Descontinuado',
        pending: 'Pendiente',
      }
      return statuses[status] || 'Activo'
    },

    formatNumber(number) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number || 0)
    },

    async validateAndUpload() {
      this.isUploading = true
      this.uploadStatus = 'Cargando productos...'

      try {
        const validProducts = this.csvData.filter((p) => p.validation.status === 'valid')

        for (let i = 0; i < validProducts.length; i++) {
          try {
            await this.uploadProduct(validProducts[i])
            this.uploadResults.push({ success: true, product: validProducts[i] })
          } catch (error) {
            this.uploadResults.push({
              success: false,
              product: validProducts[i],
              error: error.message,
            })
            this.errorDetails.push({
              row: i + 2,
              message: error.message,
            })
          }
        }

        this.uploadStatus = 'Carga completada'
      } catch (error) {
        console.error('Error en carga masiva:', error)
        this.uploadStatus = 'Error en la carga'
      } finally {
        this.isUploading = false
      }
    },

    async uploadProduct(product) {
      const response = await axios.post('/products/', {
        name: product.name,
        description: product.description,
        category: product.category,
        unit_price: parseFloat(product.unit_price),
        stock_quantity: parseInt(product.stock_quantity),
        min_stock: parseInt(product.min_stock),
        brand: product.brand,
        supplier: product.supplier,
        sku: product.sku,
        profit_margin: parseFloat(product.profit_margin),
        warehouse_location: product.warehouse_location,
        weight: product.weight,
        dimensions: product.dimensions,
        product_status: product.product_status,
      })
      return response.data
    },

    clearData() {
      this.csvData = []
      this.uploadResults = []
      this.uploadStatus = 'Listo para cargar'
      this.errorDetails = []
    },
  },
}
</script>

<style scoped>
/* Variables del sistema */
:root {
  --primary-color: #003366;
  --secondary-color: #f1c40f;
  --success-color: #27ae60;
  --error-color: #e74c3c;
  --warning-color: #f39c12;
  --background-light: #f8f9fa;
  --border-color: #e2e8f0;
  --text-primary: #2c3e50;
  --text-secondary: #64748b;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.csv-upload-workspace {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  z-index: 100; /* CORRECCIÓN Z-INDEX */
}

/* Header con colores del sistema */
.page-header {
  background: var(--primary-color); /* USAR COLOR DEL DASHBOARD */
  color: white; /* CONTRASTE NATURAL */
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.title-section .page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white; /* ASEGURAR CONTRASTE */
}

.title-section .page-subtitle {
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
  opacity: 0.9;
  color: white; /* ASEGURAR CONTRASTE */
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.upload-status.waiting {
  background: rgba(241, 196, 15, 0.2);
}

.upload-status.ready {
  background: rgba(39, 174, 96, 0.2);
}

.upload-status.uploading {
  background: rgba(52, 152, 219, 0.2);
}

/* Paneles principales */
.upload-panel,
.preview-panel,
.results-panel {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 50; /* MENOR QUE WORKSPACE */
}

.panel-header {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-actions {
  display: flex;
  gap: 1rem;
}

.panel-content {
  padding: 2rem;
}

/* Zona de carga */
.upload-zone {
  border: 3px dashed var(--border-color);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-zone.drag-over {
  border-color: var(--primary-color);
  background: rgba(0, 51, 102, 0.05);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.file-input-label {
  cursor: pointer;
}

.upload-button {
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.upload-button:hover {
  background: var(--hover-color);
  transform: translateY(-1px);
}

#csvFile {
  display: none;
}

.upload-info {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 51, 102, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Tabla de vista previa */
.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 10; /* CORRECCIÓN Z-INDEX TABLA */
}

.products-preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.products-preview-table th {
  background: linear-gradient(145deg, #f1f3f4, #e8eaed);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 20; /* MENOR QUE NAVBAR */
}

.products-preview-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.products-preview-table tr:hover {
  background: #f8f9fa;
}

.valid-row {
  background: rgba(39, 174, 96, 0.05);
}

.error-row {
  background: rgba(231, 76, 60, 0.05);
}

.validation-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 1rem;
}

.validation-status.valid {
  background: rgba(39, 174, 96, 0.1);
}

.validation-status.error {
  background: rgba(231, 76, 60, 0.1);
}

.product-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.product-status.active {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.product-status.inactive {
  background: rgba(149, 165, 166, 0.1);
  color: #95a5a6;
}

/* Botones */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn.primary {
  background: var(--primary-color);
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: var(--hover-color);
  transform: translateY(-1px);
}

.btn.secondary {
  background: var(--text-secondary);
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Resultados */
.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.result-stat {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  text-align: center;
}

.result-stat.success {
  border-left: 4px solid var(--success-color);
}

.result-stat.error {
  border-left: 4px solid var(--error-color);
}

.result-stat.total {
  border-left: 4px solid var(--primary-color);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .panel-content {
    padding: 1rem;
  }

  .products-preview-table {
    font-size: 0.75rem;
  }

  .products-preview-table th,
  .products-preview-table td {
    padding: 0.5rem;
  }
}
</style>
