<!-- filepath: src/views/quotations/QuotationCreateView.vue -->
<template>
  <div class="quotation-workspace">
    <!-- Header Moderno con Gradiente -->
    <div class="quotation-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <span class="icon-document">📄</span>
            Nueva Cotización
          </h1>
          <p class="subtitle">Crea cotizaciones profesionales con facilidad</p>
        </div>
        <div class="quotation-badge">
          <span class="badge-label">N°</span>
          <span class="badge-number">{{ quotation.number || 'COT-2024-001' }}</span>
        </div>
      </div>
      <div class="progress-indicator">
        <div class="progress-step active">
          <span class="step-number">1</span>
          <span class="step-label">Información</span>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step">
          <span class="step-number">2</span>
          <span class="step-label">Productos</span>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step">
          <span class="step-number">3</span>
          <span class="step-label">Finalizar</span>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="quotation-body">
      <!-- Panel de Información del Cliente -->
      <div class="info-panel client-panel">
        <div class="panel-header">
          <h3><span class="icon-user">👤</span>Información del Cliente</h3>
          <span class="required-indicator">* Campos obligatorios</span>
        </div>
        <div class="panel-content">
          <div class="form-row">
            <div class="form-field large">
              <label for="client">
                <span class="icon-search">🔍</span>Cliente *
              </label>
              <div class="search-container">
                <input
                  type="text"
                  id="client"
                  v-model="clientQuery"
                  placeholder="Buscar cliente por nombre o documento..."
                  @input="fetchClients"
                  class="search-input"
                />
                <div v-if="filteredClients.length" class="search-dropdown">
                  <div
                    v-for="client in filteredClients"
                    :key="client.id"
                    @click="selectClient(client)"
                    class="dropdown-option"
                  >
                    <div class="client-info">
                      <span class="client-name">{{ client.name }}</span>
                      <span class="client-detail">{{ client.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-field">
              <label for="date">
                <span class="icon-calendar">📅</span>Fecha de Cotización
              </label>
              <input type="date" id="date" v-model="quotation.date" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="currency">
                <span class="icon-dollar">💰</span>Moneda
              </label>
              <select id="currency" v-model="quotation.currency">
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div class="form-field">
              <label>Estado</label>
              <div class="status-indicator draft">
                <span class="status-dot"></span>
                Borrador
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Productos -->
      <div class="info-panel products-panel">
        <div class="panel-header">
          <h3><span class="icon-package">📦</span>Productos y Servicios</h3>
          <div class="panel-actions">
            <button class="btn-icon" @click="addProduct" title="Agregar producto">
              <span class="icon-plus">➕</span>
            </button>
            <label for="csvFile" class="btn-icon csv-btn" title="Importar CSV">
              <span class="icon-upload">📤</span>
              <input type="file" id="csvFile" accept=".csv" @change="handleFileUpload" style="display: none;" />
            </label>
          </div>
        </div>
        <div class="panel-content">
          <div class="products-table-wrapper">
            <table class="products-table">
              <thead>
                <tr>
                  <th class="product-column">Producto/Servicio</th>
                  <th class="description-column">Descripción</th>
                  <th class="quantity-column">Cant.</th>
                  <th class="price-column">Precio Unit.</th>
                  <th class="discount-column">Desc. %</th>
                  <th class="total-column">Total</th>
                  <th class="actions-column">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in products" :key="index" class="product-row">
                  <td class="product-cell">
                    <input
                      type="text"
                      v-model="product.query"
                      placeholder="Nombre del producto..."
                      class="product-input"
                      @input="fetchProductSuggestions(index)"
                    />
                    <div v-if="product.suggestions && product.suggestions.length" class="suggestions-dropdown">
                      <div
                        v-for="suggestion in product.suggestions"
                        :key="suggestion.id"
                        @click="selectProduct(index, suggestion)"
                        class="suggestion-option"
                      >
                        <span class="suggestion-name">{{ suggestion.name }}</span>
                        <span class="suggestion-price">${{ formatNumber(suggestion.unit_price) }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="description-cell">
                    <textarea
                      v-model="product.description"
                      placeholder="Descripción detallada..."
                      rows="2"
                    ></textarea>
                  </td>
                  <td class="quantity-cell">
                    <input
                      type="number"
                      v-model.number="product.quantity"
                      min="1"
                      @input="updateTotal(index)"
                      class="number-input"
                    />
                  </td>
                  <td class="price-cell">
                    <div class="currency-input">
                      <span class="currency-symbol">$</span>
                      <input
                        type="number"
                        v-model.number="product.unitPrice"
                        min="0"
                        step="0.01"
                        @input="updateTotal(index)"
                        class="number-input"
                      />
                    </div>
                  </td>
                  <td class="discount-cell">
                    <div class="percentage-input">
                      <input
                        type="number"
                        v-model.number="product.discount"
                        min="0"
                        max="100"
                        @input="updateTotal(index)"
                        class="number-input"
                      />
                      <span class="percentage-symbol">%</span>
                    </div>
                  </td>
                  <td class="total-cell">
                    <div class="total-display">
                      ${{ formatNumber(product.total) }}
                    </div>
                  </td>
                  <td class="actions-cell">
                    <button
                      v-if="products.length > 1"
                      @click="removeProduct(index)"
                      class="btn-remove"
                      title="Eliminar producto"
                    >
                      <span class="icon-trash">🗑️</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Panel de Condiciones Comerciales -->
      <div class="info-panel conditions-panel">
        <div class="panel-header">
          <h3><span class="icon-document-text">📝</span>Condiciones Comerciales</h3>
        </div>
        <div class="panel-content">
          <div class="conditions-editor">
            <textarea
              v-model="quotation.comments"
              placeholder="Ingrese las condiciones comerciales, términos de pago, garantías, etc..."
              rows="6"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Totales Flotante -->
    <div class="totals-panel">
      <div class="totals-header">
        <h4>Resumen Financiero</h4>
      </div>
      <div class="totals-content">
        <div class="total-row subtotal">
          <span class="label">Subtotal:</span>
          <span class="value">${{ formatNumber(totalBruto) }}</span>
        </div>
        <div class="total-row discount">
          <span class="label">Descuentos:</span>
          <span class="value negative">-${{ formatNumber(totalDescuentos) }}</span>
        </div>
        <div class="total-row taxes">
          <span class="label">Impuestos:</span>
          <span class="value">${{ formatNumber(totalImpuestos) }}</span>
        </div>
        <div class="total-separator"></div>
        <div class="total-row final">
          <span class="label">Total Neto:</span>
          <span class="value">${{ formatNumber(totalNeto) }}</span>
        </div>
      </div>
    </div>

    <!-- Panel de Acciones Mejorado -->
    <div class="actions-panel">
      <div class="actions-left">
        <button class="btn secondary" @click="cancelQuotation">
          <span class="icon-x">❌</span>
          Cancelar
        </button>
        <button class="btn secondary-outline" @click="previewQuotation">
          <span class="icon-eye">👁️</span>
          Vista Previa
        </button>
      </div>
      <div class="actions-center">
        <div class="save-indicator" v-if="isSaving">
          <span class="icon-loading spinning">⏳</span>
          Guardando...
        </div>
      </div>
      <div class="actions-right">
        <button class="btn primary-outline" @click="saveQuotationAsDraft" :disabled="isSaving">
          <span class="icon-save">💾</span>
          Guardar Borrador
        </button>
        <button class="btn primary" @click="saveAndSendQuotation" :disabled="isSaving">
          <span class="icon-send">📧</span>
          Enviar Cotización
        </button>
        <button class="btn success" @click="approveQuotation" :disabled="isSaving">
          <span class="icon-check-circle">✅</span>
          Aprobar y Facturar
        </button>
      </div>
    </div>

    <!-- Modal de Vista Previa -->
    <div v-if="showPreview" class="modal-overlay" @click="closePreview">
      <div class="modal-content preview-modal" @click.stop>
        <div class="modal-header">
          <h3>Vista Previa de Cotización</h3>
          <button class="btn-close" @click="closePreview">
            <span class="icon-x">❌</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="preview-content">
            <div class="preview-quotation">
              <div class="preview-header">
                <h2>COTIZACIÓN {{ quotation.number }}</h2>
                <p>Fecha: {{ quotation.date }}</p>
              </div>
              <div class="preview-client">
                <h4>Cliente:</h4>
                <p>{{ quotation.client?.name || clientQuery }}</p>
                <p>{{ quotation.client?.email || 'Email no especificado' }}</p>
              </div>
              <div class="preview-products">
                <h4>Productos:</h4>
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in products" :key="product.id">
                      <td>{{ product.query }}</td>
                      <td>{{ product.quantity }}</td>
                      <td>${{ formatNumber(product.unitPrice) }}</td>
                      <td>${{ formatNumber(product.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="preview-total">
                <h3>Total: ${{ formatNumber(totalNeto) }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/services/axios'
import { jsPDF } from 'jspdf'

export default {
  name: 'QuotationCreateView',
  data() {
    return {
      clientQuery: '',
      clients: [],
      filteredClients: [],
      isSaving: false,
      showPreview: false,
      quotation: {
        client: null,
        date: new Date().toISOString().split('T')[0],
        number: '',
        currency: 'COP',
        comments: '',
      },
      products: [
        {
          query: '',
          suggestions: [],
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxCharge: 0,
          taxRetention: 0,
          total: 0,
        },
      ],
    }
  },
  computed: {
    totalBruto() {
      return this.products.reduce((sum, product) => {
        return sum + (product.quantity * product.unitPrice || 0)
      }, 0)
    },
    totalDescuentos() {
      return this.products.reduce((sum, product) => {
        const subtotal = product.quantity * product.unitPrice || 0
        return sum + (subtotal * (product.discount / 100) || 0)
      }, 0)
    },
    totalImpuestos() {
      return this.products.reduce((sum, product) => {
        return sum + (product.taxCharge || 0)
      }, 0)
    },
    totalNeto() {
      return this.totalBruto - this.totalDescuentos + this.totalImpuestos
    },
  },
  methods: {
    // Métodos de clientes
    async fetchClients() {
      if (this.clientQuery.length === 0) {
        this.filteredClients = []
        return
      }
      try {
        const response = await axios.get('/clients', {
          params: { query: this.clientQuery },
        })
        this.filteredClients = response.data
      } catch (error) {
        console.error('Error al obtener clientes:', error)
      }
    },

    selectClient(client) {
      this.quotation.client = client
      this.clientQuery = client.name
      this.filteredClients = []
    },

    // Método principal para obtener número de cotización
    async fetchQuotationNumber() {
      try {
        console.log('📤 Solicitando próximo número de cotización...')
        const token = localStorage.getItem('access_token')
        const response = await axios.get('/quotations/next-number/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('✅ Respuesta del servidor:', response.data)
        this.quotation.number = response.data.next_number
        console.log('✅ Número asignado:', this.quotation.number)
      } catch (error) {
        console.error('❌ Error al obtener número de cotización:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          this.$router.push('/login')
          return
        }
        alert('Error al obtener el número de cotización. Intente nuevamente.')
      }
    },

    // Métodos de productos
    async fetchProductSuggestions(index) {
      const product = this.products[index]
      if (product.query.length < 2) {
        product.suggestions = []
        return
      }
      
      try {
        const response = await axios.get('/products/search', {
          params: { query: product.query }
        })
        product.suggestions = response.data
      } catch (error) {
        console.error('Error al obtener sugerencias:', error)
        product.suggestions = []
      }
    },

    selectProduct(index, product) {
      const item = this.products[index]
      item.query = product.name
      item.description = product.description || ''
      item.unitPrice = product.unit_price || 0
      item.suggestions = []
      this.updateTotal(index)
    },

    updateTotal(index) {
      const product = this.products[index]
      const subtotal = product.quantity * product.unitPrice || 0
      const discount = subtotal * (product.discount / 100) || 0
      product.total = subtotal - discount
    },

    updateTotals() {
      this.products.forEach((_, index) => {
        this.updateTotal(index)
      })
    },

    addProduct() {
      this.products.push({
        query: '',
        suggestions: [],
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxCharge: 0,
        taxRetention: 0,
        total: 0,
      })
    },

    removeProduct(index) {
      if (this.products.length > 1) {
        this.products.splice(index, 1)
        this.updateTotals()
      }
    },

    // Manejo de archivos
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file && file.type === 'text/csv') {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.parseCSV(e.target.result)
        }
        reader.readAsText(file)
      }
    },

    parseCSV(csvData) {
      const lines = csvData.split('\n')
      const newProducts = []
      
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',')
        if (columns.length >= 4) {
          newProducts.push({
            query: columns[0].trim(),
            description: columns[1].trim(),
            quantity: parseInt(columns[2]) || 1,
            unitPrice: parseFloat(columns[3]) || 0,
            discount: 0,
            taxCharge: 0,
            taxRetention: 0,
            total: 0,
            suggestions: []
          })
        }
      }
      
      if (newProducts.length > 0) {
        this.products = newProducts
        this.updateTotals()
      }
    },

    // Utilidades
    formatNumber(number) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number || 0)
    },

    // Métodos de guardado y acciones principales
    async saveQuotationAsDraft() {
      this.isSaving = true
      try {
        const quotationData = this.prepareQuotationData('borrador')
        await axios.post('/quotations/', quotationData)
        this.showSuccessMessage('Cotización guardada como borrador')
        // console.log('Respuesta del servidor:', response.data)
      } catch (error) {
        console.error('Error al guardar la cotización:', error)
        this.showErrorMessage('Error al guardar la cotización')
      } finally {
        this.isSaving = false
      }
    },

    async saveAndSendQuotation() {
      this.isSaving = true
      try {
        const quotationData = this.prepareQuotationData('enviada')
        await axios.post('/quotations/', quotationData)
        this.showSuccessMessage('Cotización enviada correctamente')
        this.generatePDF()
      } catch (error) {
        console.error('Error al enviar la cotización:', error)
        this.showErrorMessage('Error al enviar la cotización')
      } finally {
        this.isSaving = false
      }
    },

    async approveQuotation() {
      this.isSaving = true
      try {
        const quotationData = this.prepareQuotationData('aprobada')
        const response = await axios.post('/quotations/', quotationData)
        this.showSuccessMessage('Cotización aprobada y convertida a factura')
        // Redirigir a crear factura (implementar después)
        this.$router.push(`/facturas/nueva?from_quotation=${response.data.id}`)
      } catch (error) {
        console.error('Error al aprobar la cotización:', error)
        this.showErrorMessage('Error al aprobar la cotización')
      } finally {
        this.isSaving = false
      }
    },

    prepareQuotationData(status = 'borrador') {
      return {
        client_name: this.quotation.client?.name || this.clientQuery,
        client_email: this.quotation.client?.email || '',
        client_phone: this.quotation.client?.phone || '',
        client_address: this.quotation.client?.address || '',
        client_document: this.quotation.client?.document || '',
        valid_until: this.quotation.date,
        notes: this.quotation.comments,
        status: status,
        items: this.products.map(product => ({
          product_name: product.query,
          product_description: product.description,
          quantity: product.quantity,
          unit_price: product.unitPrice,
          discount_percentage: product.discount
        }))
      }
    },

    // Vista previa y PDF
    previewQuotation() {
      this.showPreview = true
    },

    closePreview() {
      this.showPreview = false
    },

    generatePDF() {
      const doc = new jsPDF()
      let yPosition = 20
      
      // Header
      doc.setFontSize(20)
      doc.text('COTIZACIÓN', 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.text(`Número: ${this.quotation.number}`, 20, yPosition)
      yPosition += 10
      doc.text(`Fecha: ${this.quotation.date}`, 20, yPosition)
      yPosition += 20
      
      // Cliente
      doc.setFontSize(14)
      doc.text('CLIENTE:', 20, yPosition)
      yPosition += 10
      doc.setFontSize(12)
      doc.text(`${this.quotation.client?.name || this.clientQuery}`, 20, yPosition)
      yPosition += 30
      
      // Productos
      doc.setFontSize(14)
      doc.text('PRODUCTOS:', 20, yPosition)
      yPosition += 15
      
      this.products.forEach((product, index) => {
        doc.setFontSize(10)
        doc.text(`${index + 1}. ${product.query}`, 20, yPosition)
        yPosition += 6
        doc.text(`   Cantidad: ${product.quantity} - Precio: $${this.formatNumber(product.unitPrice)}`, 25, yPosition)
        yPosition += 6
        doc.text(`   Total: $${this.formatNumber(product.total)}`, 25, yPosition)
        yPosition += 10
      })
      
      // Total
      yPosition += 10
      doc.setFontSize(14)
      doc.text(`TOTAL NETO: $${this.formatNumber(this.totalNeto)}`, 20, yPosition)
      
      doc.save(`cotizacion-${this.quotation.number}.pdf`)
    },

    // Navegación
    cancelQuotation() {
      if (confirm('¿Estás seguro de que deseas cancelar la cotización?')) {
        this.$router.push('/cotizaciones')
      }
    },

    // Mensajes de notificación (usando toast si está disponible)
    showSuccessMessage(message) {
      if (this.$toast) {
        this.$toast.success(message)
      } else {
        alert(message)
      }
    },

    showErrorMessage(message) {
      if (this.$toast) {
        this.$toast.error(message)
      } else {
        alert(message)
      }
    }
  },

  async created() {
    console.log('🚀 Iniciando QuotationCreateView...')
    const token = localStorage.getItem('access_token')
    console.log('🔑 Token en localStorage:', token ? `SÍ (${token.substring(0, 20)}...)` : 'NO')

    if (!token) {
      console.error('❌ No hay token de autenticación')
      this.$router.push('/login')
      return
    }

    await this.fetchQuotationNumber()
  },
}
</script>

<style scoped>
/* Variables CSS para consistencia */
:root {
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary-color: #64748b;
  --success-color: #059669;
  --warning-color: #d97706;
  --danger-color: #dc2626;
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --border-color: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

/* Layout Principal */
.quotation-workspace {
  min-height: 100vh;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 1rem;
}

/* Header Moderno */
.quotation-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: var(--shadow-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title-section .main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-section .subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0.5rem 0 0;
}

.quotation-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
}

.badge-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.badge-number {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Indicador de Progreso */
.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.progress-step.active {
  opacity: 1;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.progress-step.active .step-number {
  background: white;
  color: var(--primary-color);
}

.progress-line {
  width: 4rem;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
}

/* Cuerpo Principal */
.quotation-body {
  display: grid;
  gap: 2rem;
  margin-bottom: 8rem;
}

/* Paneles de Información */
.info-panel {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.panel-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.required-indicator {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.panel-actions {
  display: flex;
  gap: 0.5rem;
}

.panel-content {
  padding: 2rem;
}

/* Formulario */
.form-row {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  grid-template-columns: 2fr 1fr;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.large {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

/* Búsqueda de Cliente */
.search-container {
  position: relative;
}

.search-input {
  width: 100%;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: var(--shadow-lg);
}

.dropdown-option {
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.dropdown-option:hover {
  background-color: #f8fafc;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.client-name {
  font-weight: 600;
  color: var(--text-primary);
}

.client-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Estado */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 500;
}

.status-indicator.draft {
  background-color: #fef3c7;
  color: #92400e;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: currentColor;
}

/* Tabla de Productos */
.products-table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.products-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
}

.products-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
  position: relative;
}

.product-row:hover {
  background-color: #f8fafc;
}

.product-input,
.number-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.currency-input,
.percentage-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.currency-symbol,
.percentage-symbol {
  padding: 0.5rem;
  background-color: #f8fafc;
  color: var(--text-secondary);
  font-weight: 600;
}

.currency-input input,
.percentage-input input {
  border: none;
  flex: 1;
}

.total-display {
  font-weight: 600;
  color: var(--primary-color);
  text-align: right;
}

/* Sugerencias de Productos */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: var(--shadow-md);
}

.suggestion-option {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-option:hover {
  background-color: #f8fafc;
}

.suggestion-option:last-child {
  border-bottom: none;
}

.suggestion-name {
  font-weight: 500;
}

.suggestion-price {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Condiciones Comerciales */
.conditions-editor textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
}

/* Panel de Totales */
.totals-panel {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  width: 350px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  z-index: 20;
}

.totals-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.totals-header h4 {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.totals-content {
  padding: 1.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.total-row.final {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.total-row .value.negative {
  color: var(--danger-color);
}

.total-separator {
  height: 1px;
  background-color: var(--border-color);
  margin: 1rem 0;
}

/* Panel de Acciones */
.actions-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 30;
}

.actions-left {
  display: flex;
  gap: 1rem;
}

.actions-center {
  display: flex;
  justify-content: center;
}

.actions-right {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Botones */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  background: transparent;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--primary-color);
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn.primary-outline {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: transparent;
}

.btn.primary-outline:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.btn.success {
  background: var(--success-color);
  color: white;
}

.btn.success:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn.secondary {
  background: var(--secondary-color);
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background: #475569;
}

.btn.secondary-outline {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
  background: transparent;
}

.btn.secondary-outline:hover:not(:disabled) {
  background: var(--secondary-color);
  color: white;
}

.btn-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #f8fafc;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-remove {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: var(--danger-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: var(--danger-color);
  color: white;
}

/* Indicadores */
.save-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.preview-modal {
  width: 800px;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
}

.btn-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.btn-close:hover {
  background: #f3f4f6;
  color: var(--text-primary);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: 70vh;
}

/* Vista Previa */
.preview-content {
  font-family: Arial, sans-serif;
}

.preview-quotation {
  max-width: 100%;
}

.preview-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}

.preview-header h2 {
  margin: 0;
  color: var(--primary-color);
}

.preview-client,
.preview-products {
  margin-bottom: 2rem;
}

.preview-client h4,
.preview-products h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.preview-table th,
.preview-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.preview-table th {
  background-color: #f8fafc;
  font-weight: 600;
}

.preview-total {
  text-align: right;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid var(--border-color);
}

.preview-total h3 {
  margin: 0;
  color: var(--primary-color);
}

/* Responsive */
@media (max-width: 1024px) {
  .quotation-workspace {
    padding: 0.5rem;
  }
  
  .totals-panel {
    position: static;
    width: 100%;
    margin-top: 2rem;
  }
  
  .actions-panel {
    position: static;
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
  
  .actions-left,
  .actions-right {
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .progress-indicator {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .progress-line {
    width: 2px;
    height: 2rem;
  }
}

@media (max-width: 768px) {
  .products-table-wrapper {
    font-size: 0.8rem;
  }
  
  .products-table th,
  .products-table td {
    padding: 0.5rem;
  }
  
  .panel-content {
    padding: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .main-title {
    font-size: 2rem !important;
  }
  
  .preview-modal {
    width: 95vw;
  }
}
</style>