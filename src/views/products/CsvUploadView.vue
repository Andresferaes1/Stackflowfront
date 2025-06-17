<!-- filepath: src/views/products/CsvUploadView.vue -->
<template>
  <div class="csv-upload-workspace">
    <!-- Header Principal -->
    <div class="upload-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-icon">📊</span>
            Carga Masiva de Productos
          </h1>
          <p class="subtitle">
            Importa múltiples productos desde archivos CSV de forma rápida y eficiente
          </p>
        </div>
        <div class="stats-counter">
          <div class="stat-item">
            <span class="stat-number">{{ totalProcessed }}</span>
            <span class="stat-label">Procesados</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ successfulUploads }}</span>
            <span class="stat-label">Exitosos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Instrucciones -->
    <div class="instructions-panel">
      <div class="panel-header">
        <h3><span class="section-icon">📋</span>Formato Requerido</h3>
        <button class="btn-download" @click="downloadTemplate">
          <span class="btn-icon">📥</span>
          Descargar Plantilla
        </button>
      </div>
      <div class="panel-content">
        <div class="format-info">
          <div class="format-section">
            <h4>📄 Estructura del CSV</h4>
            <div class="headers-display">
              <span v-for="(header, index) in expectedHeaders" :key="index" class="header-tag">
                {{ header }}
                <span v-if="isRequiredField(header)" class="required-mark">*</span>
              </span>
            </div>
          </div>

          <div class="format-section">
            <h4>⚠️ Campos Obligatorios</h4>
            <ul class="required-fields">
              <li><strong>name:</strong> Nombre del producto (2-255 caracteres)</li>
              <li><strong>unit_price:</strong> Precio unitario (mayor que 0)</li>
              <li><strong>stock_quantity:</strong> Stock inicial (número entero ≥ 0)</li>
              <li>
                <strong>product_status:</strong> Estado (active, inactive, discontinued, pending)
              </li>
            </ul>
          </div>

          <div class="format-section">
            <h4>💡 Notas Importantes</h4>
            <ul class="format-notes">
              <li><strong>code:</strong> Opcional - Se autogenera si está vacío</li>
              <li><strong>Separador:</strong> Usar comas (,) para separar campos</li>
              <li><strong>Codificación:</strong> UTF-8 para caracteres especiales</li>
              <li><strong>Primera fila:</strong> Debe contener los nombres de las columnas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Carga -->
    <div class="upload-panel">
      <div class="panel-header">
        <h3><span class="section-icon">📁</span>Cargar Archivo CSV</h3>
        <div class="panel-actions">
          <button v-if="selectedFile" class="btn-secondary" @click="clearFile">
            <span class="btn-icon">🗑️</span>
            Limpiar
          </button>
          <button
            class="btn-primary"
            @click="processFile"
            :disabled="!selectedFile || isProcessing"
          >
            <span class="btn-icon">{{ isProcessing ? '⏳' : '🚀' }}</span>
            {{ isProcessing ? 'Procesando...' : 'Procesar Archivo' }}
          </button>
        </div>
      </div>
      <div class="panel-content">
        <!-- Área de drop -->
        <div
          class="drop-zone"
          :class="{ dragover: isDragOver, 'has-file': selectedFile }"
          @drop="handleDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @dragenter.prevent
        >
          <div v-if="!selectedFile" class="drop-content">
            <div class="drop-icon">📁</div>
            <p class="drop-text">Arrastra tu archivo CSV aquí</p>
            <p class="drop-subtext">o</p>
            <input
              type="file"
              ref="fileInput"
              accept=".csv"
              @change="handleFileSelect"
              style="display: none"
            />
            <button class="btn-browse" @click="$refs.fileInput.click()">Seleccionar Archivo</button>
          </div>

          <div v-else class="file-preview">
            <div class="file-info">
              <div class="file-icon">📄</div>
              <div class="file-details">
                <h4>{{ selectedFile.name }}</h4>
                <p>{{ formatFileSize(selectedFile.size) }} • {{ fileRows }} filas detectadas</p>
                <p class="file-status" :class="validationStatus.class">
                  {{ validationStatus.message }}
                </p>
              </div>
            </div>
            <button class="btn-remove" @click="clearFile">❌</button>
          </div>
        </div>

        <!-- Preview de datos -->
        <div v-if="previewData.length > 0" class="preview-section">
          <h4>👀 Vista Previa (Primeras 5 filas)</h4>
          <div class="table-wrapper">
            <table class="preview-table">
              <thead>
                <tr>
                  <th v-for="header in detectedHeaders" :key="header" class="preview-header">
                    {{ header }}
                    <span v-if="isRequiredField(header)" class="required-mark">*</span>
                    <span v-if="!expectedHeaders.includes(header)" class="invalid-mark">⚠️</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                  <td v-for="(value, colIndex) in row" :key="colIndex" class="preview-cell">
                    {{ value || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Resultados de Procesamiento -->
    <div v-if="uploadResults.length > 0" class="results-panel">
      <div class="panel-header">
        <h3><span class="section-icon">📊</span>Resultados del Procesamiento</h3>
        <button class="btn-secondary" @click="clearResults">
          <span class="btn-icon">🗑️</span>
          Limpiar Resultados
        </button>
      </div>
      <div class="panel-content">
        <div class="results-summary">
          <div class="result-stat success">
            <span class="stat-icon">✅</span>
            <span class="stat-number">{{ successfulUploads }}</span>
            <span class="stat-label">Exitosos</span>
          </div>
          <div class="result-stat error">
            <span class="stat-icon">❌</span>
            <span class="stat-number">{{ failedUploads }}</span>
            <span class="stat-label">Fallidos</span>
          </div>
          <div class="result-stat total">
            <span class="stat-icon">📋</span>
            <span class="stat-number">{{ totalProcessed }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>

        <div v-if="failedUploads > 0" class="error-details">
          <h4>❌ Errores Encontrados:</h4>
          <div class="error-list">
            <div v-for="(error, index) in errorDetails" :key="index" class="error-item">
              <strong>Fila {{ error.row }}:</strong> {{ error.message }}
            </div>
          </div>
        </div>

        <div v-if="successfulUploads > 0" class="success-details">
          <h4>✅ Productos Creados Exitosamente:</h4>
          <div class="success-list">
            <div v-for="(success, index) in successDetails" :key="index" class="success-item">
              <strong>{{ success.name }}</strong> - Código: {{ success.code }}
            </div>
          </div>
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
      // Estado de la carga
      selectedFile: null,
      isProcessing: false,
      isDragOver: false,

      // Headers esperados (ACTUALIZADOS SEGÚN BACKEND)
      expectedHeaders: [
        'code',
        'name',
        'description',
        'category',
        'brand',
        'supplier',
        'unit_price',
        'profit_margin',
        'stock_quantity',
        'min_stock',
        'warehouse_location',
        'weight',
        'dimensions',
        'product_status',
      ],

      // Campos obligatorios según backend
      requiredFields: ['name', 'unit_price', 'stock_quantity', 'product_status'],

      // Datos del archivo
      detectedHeaders: [],
      previewData: [],
      fileRows: 0,

      // Resultados
      uploadResults: [],
      errorDetails: [],
      successDetails: [],
    }
  },

  computed: {
    validationStatus() {
      if (!this.selectedFile) {
        return { class: '', message: 'Selecciona un archivo CSV' }
      }

      if (this.detectedHeaders.length === 0) {
        return { class: 'error', message: 'No se pudieron detectar las columnas' }
      }

      const missingRequired = this.requiredFields.filter(
        (field) => !this.detectedHeaders.includes(field),
      )

      if (missingRequired.length > 0) {
        return {
          class: 'error',
          message: `Faltan campos obligatorios: ${missingRequired.join(', ')}`,
        }
      }

      const invalidHeaders = this.detectedHeaders.filter(
        (header) => !this.expectedHeaders.includes(header),
      )

      if (invalidHeaders.length > 0) {
        return {
          class: 'warning',
          message: `Columnas no reconocidas: ${invalidHeaders.join(', ')}`,
        }
      }

      return { class: 'success', message: 'Archivo válido y listo para procesar' }
    },

    totalProcessed() {
      return this.uploadResults.length
    },

    successfulUploads() {
      return this.uploadResults.filter((r) => r.success).length
    },

    failedUploads() {
      return this.uploadResults.filter((r) => !r.success).length
    },
  },

  methods: {
    // Gestión de archivos
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file && file.type === 'text/csv') {
        this.selectedFile = file
        this.analyzeFile()
      } else {
        alert('Por favor selecciona un archivo CSV válido')
      }
    },

    handleDrop(event) {
      event.preventDefault()
      this.isDragOver = false

      const file = event.dataTransfer.files[0]
      if (file && file.type === 'text/csv') {
        this.selectedFile = file
        this.analyzeFile()
      } else {
        alert('Por favor arrastra un archivo CSV válido')
      }
    },

    clearFile() {
      this.selectedFile = null
      this.detectedHeaders = []
      this.previewData = []
      this.fileRows = 0
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    // Análisis del archivo
    async analyzeFile() {
      if (!this.selectedFile) return

      try {
        const text = await this.readFileAsText(this.selectedFile)
        const lines = text.split('\n').filter((line) => line.trim())

        if (lines.length < 2) {
          alert('El archivo debe tener al menos una fila de datos además de los headers')
          return
        }

        // Detectar headers
        this.detectedHeaders = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))

        // Preparar preview
        this.previewData = lines
          .slice(1, 6)
          .map((line) => line.split(',').map((cell) => cell.trim().replace(/"/g, '')))

        this.fileRows = lines.length - 1 // Excluir header

        console.log('📄 Archivo analizado:', {
          headers: this.detectedHeaders,
          rows: this.fileRows,
          preview: this.previewData.length,
        })
      } catch (error) {
        console.error('❌ Error analizando archivo:', error)
        alert('Error al analizar el archivo CSV')
      }
    },

    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsText(file, 'UTF-8')
      })
    },

    // Procesamiento
    async processFile() {
      if (!this.selectedFile || this.validationStatus.class === 'error') {
        alert('Corrije los errores antes de procesar el archivo')
        return
      }

      this.isProcessing = true
      this.uploadResults = []
      this.errorDetails = []
      this.successDetails = []

      try {
        console.log('🚀 Iniciando carga masiva...')

        // Preparar FormData para envío al backend
        const formData = new FormData()
        formData.append('file', this.selectedFile)

        // Enviar al endpoint correcto del backend
        const response = await axios.post('/products/upload-csv', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        console.log('✅ Respuesta del backend:', response.data)

        // Procesar respuesta del backend
        this.processBackendResponse(response.data)
      } catch (error) {
        console.error('❌ Error en carga masiva:', error)

        if (error.response?.data) {
          this.processBackendError(error.response.data)
        } else {
          alert('Error de conexión con el servidor')
        }
      } finally {
        this.isProcessing = false
      }
    },

    processBackendResponse(data) {
      // Procesar respuesta exitosa del backend
      if (data.created_products) {
        data.created_products.forEach((product) => {
          this.uploadResults.push({ success: true, data: product })
          this.successDetails.push({
            name: product.name,
            code: product.code,
          })
        })
      }

      if (data.errors) {
        data.errors.forEach((error) => {
          this.uploadResults.push({ success: false, error: error.message })
          this.errorDetails.push({
            row: error.row || 'N/A',
            message: error.message,
          })
        })
      }
    },

    processBackendError(errorData) {
      // Procesar errores del backend
      if (errorData.detail) {
        this.errorDetails.push({
          row: 'General',
          message: errorData.detail,
        })
      }

      if (errorData.errors) {
        errorData.errors.forEach((error) => {
          this.errorDetails.push({
            row: error.row || 'N/A',
            message: error.message,
          })
        })
      }
    },

    // Utilidades
    isRequiredField(header) {
      return this.requiredFields.includes(header)
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // Descarga de plantilla
    downloadTemplate() {
      const headers = this.expectedHeaders.join(',')
      const exampleRow = [
        'PROD-001', // code (opcional)
        'Laptop Gaming XYZ', // name (obligatorio)
        'Descripción del producto', // description
        'Electrónicos', // category
        'Dell', // brand
        'Proveedor A', // supplier
        '1500.00', // unit_price (obligatorio)
        '25.00', // profit_margin
        '10', // stock_quantity (obligatorio)
        '5', // min_stock
        'A-01-15', // warehouse_location
        '2.5 kg', // weight
        '35x25x3 cm', // dimensions
        'active', // product_status (obligatorio)
      ].join(',')

      const csvContent = headers + '\n' + exampleRow

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'plantilla_productos.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      console.log('📥 Plantilla CSV descargada')
    },

    clearResults() {
      this.uploadResults = []
      this.errorDetails = []
      this.successDetails = []
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
  --info-color: #3498db;
  --background-light: #f8f9fa;
  --border-color: #e2e8f0;
  --text-primary: #2c3e50;
  --text-secondary: #64748b;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

.csv-upload-workspace {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  z-index: 100;
}

/* Header */
.upload-header {
  background: var(--primary-color);
  color: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section .main-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.title-section .subtitle {
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
  opacity: 0.9;
  color: white;
}

.stats-counter {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Paneles principales */
.instructions-panel,
.upload-panel,
.results-panel {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}

.panel-header {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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

/* Información de formato */
.format-info {
  display: grid;
  gap: 2rem;
}

.format-section h4 {
  margin: 0 0 1rem;
  color: var(--primary-color);
  font-weight: 600;
}

.headers-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.header-tag {
  background: var(--background-light);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-mark {
  color: var(--error-color);
  font-weight: bold;
}

.required-fields,
.format-notes {
  margin: 0;
  padding-left: 1.5rem;
}

.required-fields li,
.format-notes li {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

/* Drop zone */
.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--background-light);
}

.drop-zone.dragover {
  border-color: var(--primary-color);
  background: rgba(0, 51, 102, 0.05);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: var(--success-color);
  background: rgba(39, 174, 96, 0.05);
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.drop-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.drop-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.drop-subtext {
  color: var(--text-secondary);
  margin: 0;
}

/* Preview de archivo */
.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-icon {
  font-size: 2rem;
}

.file-details h4 {
  margin: 0;
  color: var(--text-primary);
}

.file-details p {
  margin: 0.25rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.file-status {
  font-weight: 600;
}

.file-status.success {
  color: var(--success-color);
}

.file-status.warning {
  color: var(--warning-color);
}

.file-status.error {
  color: var(--error-color);
}

/* Tabla de preview */
.preview-section {
  margin-top: 2rem;
}

.preview-section h4 {
  margin: 0 0 1rem;
  color: var(--primary-color);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.preview-header {
  background: linear-gradient(145deg, #f1f3f4, #e8eaed);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  position: relative;
}

.preview-cell {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invalid-mark {
  color: var(--warning-color);
}

/* Botones */
.btn-primary,
.btn-secondary,
.btn-browse,
.btn-download,
.btn-remove {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #004080;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--text-secondary);
  color: white;
}

.btn-download {
  background: var(--info-color);
  color: white;
}

.btn-browse {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
}

.btn-remove {
  background: var(--error-color);
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  justify-content: center;
}

button:disabled {
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
  border-radius: var(--radius-lg);
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

.stat-icon {
  font-size: 1.5rem;
}

.result-stat .stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.error-details,
.success-details {
  background: #f8f9fa;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
}

.error-details h4,
.success-details h4 {
  margin: 0 0 0.75rem;
}

.error-list,
.success-list {
  max-height: 200px;
  overflow-y: auto;
}

.error-item,
.success-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.error-item {
  background: rgba(231, 76, 60, 0.1);
  color: var(--error-color);
}

.success-item {
  background: rgba(39, 174, 96, 0.1);
  color: var(--success-color);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .stats-counter {
    flex-direction: row;
    justify-content: center;
  }

  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .panel-actions {
    justify-content: center;
  }

  .format-info {
    gap: 1rem;
  }

  .headers-display {
    justify-content: center;
  }

  .results-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .csv-upload-workspace {
    padding: 0.5rem;
  }

  .upload-header {
    padding: 1rem;
  }

  .panel-content {
    padding: 1rem;
  }

  .drop-zone {
    padding: 2rem 1rem;
  }
}
</style>
