<!-- filepath: src/views/products/StockManagementView.vue -->
<template>
  <div class="stock-workspace">
    <!-- Header Principal -->
    <div class="stock-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-icon">📋</span>
            Gestión de Inventario
          </h1>
          <p class="subtitle">Crea productos y gestiona stock mediante formularios intuitivos</p>
        </div>
        <div class="operation-counter">
          <span class="counter-label">Operaciones:</span>
          <span class="counter-number">{{ totalOperations }}</span>
        </div>
      </div>
    </div>

    <!-- Selector de Operación -->
    <div class="operation-tabs">
      <button
        :class="['tab-button', { active: currentOperation === 'create' }]"
        @click="switchOperation('create')"
      >
        <span class="tab-icon">➕</span>
        <span class="tab-text">Crear Producto</span>
      </button>
      <button
        :class="['tab-button', { active: currentOperation === 'stock' }]"
        @click="switchOperation('stock')"
      >
        <span class="tab-icon">📦</span>
        <span class="tab-text">Gestionar Stock</span>
      </button>
    </div>

    <!-- Panel de Creación de Producto -->
    <div v-if="currentOperation === 'create'" class="form-panel create-panel">
      <div class="panel-header">
        <h3><span class="section-icon">🆕</span>Nuevo Producto</h3>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="clearProductForm">
            <span class="btn-icon">🔄</span>
            Limpiar
          </button>
          <button
            type="button"
            class="btn-primary"
            @click="addProductToList"
            :disabled="!isProductFormValid"
          >
            <span class="btn-icon">✅</span>
            Agregar a Lista
          </button>
        </div>
      </div>
      <div class="panel-content">
        <form @submit.prevent="addProductToList" class="product-form">
          <div class="form-grid">
            <!-- Información Básica -->
            <div class="form-section">
              <h4 class="section-title">Información Básica</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="productCode">
                    <span class="field-icon">🏷️</span>
                    {{ productLabels.code }}
                  </label>
                  <input
                    type="text"
                    id="productCode"
                    v-model="productForm.code"
                    placeholder="Ej: PROD-001 (Se autogenera si está vacío)"
                    :class="{ error: validationErrors.code }"
                  />
                  <span v-if="validationErrors.code" class="error-message">{{
                    validationErrors.code
                  }}</span>
                </div>
                <div class="form-field">
                  <label for="productName">
                    <span class="field-icon">📝</span>
                    {{ productLabels.name }} *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    v-model="productForm.name"
                    placeholder="Ej: Laptop Gaming XYZ"
                    required
                    :class="{ error: validationErrors.name }"
                  />
                  <span v-if="validationErrors.name" class="error-message">{{
                    validationErrors.name
                  }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field full-width">
                  <label for="productDescription">
                    <span class="field-icon">📄</span>
                    {{ productLabels.description }}
                  </label>
                  <textarea
                    id="productDescription"
                    v-model="productForm.description"
                    placeholder="Descripción detallada del producto..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Categorización -->
            <div class="form-section">
              <h4 class="section-title">Categorización</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="category">
                    <span class="field-icon">📂</span>
                    {{ productLabels.category }}
                  </label>
                  <select id="category" v-model="productForm.category">
                    <option value="">Seleccionar categoría</option>
                    <option value="Electrónicos">Electrónicos</option>
                    <option value="Ropa">Ropa y Accesorios</option>
                    <option value="Hogar">Hogar y Jardín</option>
                    <option value="Deportes">Deportes y Fitness</option>
                    <option value="Libros">Libros y Medios</option>
                    <option value="Salud">Salud y Belleza</option>
                    <option value="Automotriz">Automotriz</option>
                    <option value="Oficina">Oficina y Papelería</option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="brand">
                    <span class="field-icon">🏢</span>
                    {{ productLabels.brand }}
                  </label>
                  <input
                    type="text"
                    id="brand"
                    v-model="productForm.brand"
                    placeholder="Ej: Dell, Samsung..."
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="supplier">
                    <span class="field-icon">🏭</span>
                    {{ productLabels.supplier }}
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    v-model="productForm.supplier"
                    placeholder="Nombre del proveedor"
                  />
                </div>
              </div>
            </div>

            <!-- Información Económica -->
            <div class="form-section">
              <h4 class="section-title">Información Económica</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="unitPrice">
                    <span class="field-icon">💰</span>
                    {{ productLabels.unit_price }} *
                  </label>
                  <div class="currency-input">
                    <span class="currency-symbol">$</span>
                    <input
                      type="number"
                      id="unitPrice"
                      v-model.number="productForm.unit_price"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                      :class="{ error: validationErrors.unit_price }"
                    />
                  </div>
                  <span v-if="validationErrors.unit_price" class="error-message">{{
                    validationErrors.unit_price
                  }}</span>
                </div>
                <div class="form-field">
                  <label for="profitMargin">
                    <span class="field-icon">📈</span>
                    {{ productLabels.profit_margin }}
                  </label>
                  <input
                    type="number"
                    id="profitMargin"
                    v-model.number="productForm.profit_margin"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <!-- Información de Stock -->
            <div class="form-section">
              <h4 class="section-title">Gestión de Inventario</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="initialStock">
                    <span class="field-icon">📦</span>
                    {{ productLabels.stock_quantity }} *
                  </label>
                  <input
                    type="number"
                    id="initialStock"
                    v-model.number="productForm.stock_quantity"
                    placeholder="0"
                    min="0"
                    required
                    :class="{ error: validationErrors.stock_quantity }"
                  />
                  <span v-if="validationErrors.stock_quantity" class="error-message">{{
                    validationErrors.stock_quantity
                  }}</span>
                </div>
                <div class="form-field">
                  <label for="minStock">
                    <span class="field-icon">⚠️</span>
                    {{ productLabels.min_stock }}
                  </label>
                  <input
                    type="number"
                    id="minStock"
                    v-model.number="productForm.min_stock"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="warehouseLocation">
                    <span class="field-icon">📍</span>
                    {{ productLabels.warehouse_location }}
                  </label>
                  <input
                    type="text"
                    id="warehouseLocation"
                    v-model="productForm.warehouse_location"
                    placeholder="Ej: A-01-15"
                  />
                </div>
                <div class="form-field">
                  <label for="productStatus">
                    <span class="field-icon">🔄</span>
                    {{ productLabels.product_status }} *
                  </label>
                  <select
                    id="productStatus"
                    v-model="productForm.product_status"
                    required
                    :class="{ error: validationErrors.product_status }"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="discontinued">Descontinuado</option>
                    <option value="pending">Pendiente</option>
                  </select>
                  <span v-if="validationErrors.product_status" class="error-message">{{
                    validationErrors.product_status
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Características Físicas -->
            <div class="form-section">
              <h4 class="section-title">Características Físicas</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="weight">
                    <span class="field-icon">⚖️</span>
                    {{ productLabels.weight }}
                  </label>
                  <input
                    type="text"
                    id="weight"
                    v-model="productForm.weight"
                    placeholder="1.5 kg"
                  />
                </div>
                <div class="form-field">
                  <label for="dimensions">
                    <span class="field-icon">📏</span>
                    {{ productLabels.dimensions }}
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    v-model="productForm.dimensions"
                    placeholder="Ej: 30x20x15 cm"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Panel de Gestión de Stock -->
    <div v-if="currentOperation === 'stock'" class="form-panel stock-panel">
      <div class="panel-header">
        <h3><span class="section-icon">📦</span>Gestión de Stock</h3>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="clearStockForm">
            <span class="btn-icon">🔄</span>
            Limpiar
          </button>
          <button
            type="button"
            class="btn-primary"
            @click="addStockToList"
            :disabled="!isStockFormValid"
          >
            <span class="btn-icon">✅</span>
            Agregar a Lista
          </button>
        </div>
      </div>
      <div class="panel-content">
        <form @submit.prevent="addStockToList" class="stock-form">
          <div class="form-grid stock-grid">
            <div class="form-section">
              <h4 class="section-title">Identificación del Producto</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="stockProductCode">
                    <span class="field-icon">🏷️</span>
                    Código del Producto *
                  </label>
                  <input
                    type="text"
                    id="stockProductCode"
                    v-model="stockForm.codigoProducto"
                    placeholder="Buscar por código..."
                    required
                    @input="searchExistingProduct"
                    :class="{ error: validationErrors.codigoProducto }"
                  />
                  <span v-if="validationErrors.codigoProducto" class="error-message">{{
                    validationErrors.codigoProducto
                  }}</span>

                  <!-- Información del producto encontrado -->
                  <div v-if="foundProduct" class="product-info">
                    <div class="product-card">
                      <h5>{{ foundProduct.nombre }}</h5>
                      <p><strong>Stock actual:</strong> {{ foundProduct.stockActual }}</p>
                      <p><strong>Stock mínimo:</strong> {{ foundProduct.stockMinimo }}</p>
                      <p><strong>Categoría:</strong> {{ foundProduct.categoria }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4 class="section-title">Operación de Stock</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="stockAction">
                    <span class="field-icon">🔄</span>
                    Tipo de Operación *
                  </label>
                  <select
                    id="stockAction"
                    v-model="stockForm.tipoOperacion"
                    required
                    :class="{ error: validationErrors.tipoOperacion }"
                  >
                    <option value="">Seleccionar operación</option>
                    <option value="entrada">➕ Entrada de Stock</option>
                    <option value="salida">➖ Salida de Stock</option>
                    <option value="ajuste">🔧 Ajuste de Inventario</option>
                    <option value="devolucion">↩️ Devolución</option>
                  </select>
                  <span v-if="validationErrors.tipoOperacion" class="error-message">{{
                    validationErrors.tipoOperacion
                  }}</span>
                </div>
                <div class="form-field">
                  <label for="stockQuantity">
                    <span class="field-icon">🔢</span>
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    v-model.number="stockForm.cantidad"
                    placeholder="0"
                    min="1"
                    required
                    :class="{ error: validationErrors.cantidad }"
                  />
                  <span v-if="validationErrors.cantidad" class="error-message">{{
                    validationErrors.cantidad
                  }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field full-width">
                  <label for="stockReason">
                    <span class="field-icon">📝</span>
                    Motivo de la Operación
                  </label>
                  <textarea
                    id="stockReason"
                    v-model="stockForm.motivo"
                    placeholder="Ej: Recepción de mercancía, venta, daño, etc..."
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4 class="section-title">Actualización de Información</h4>
              <div class="form-row">
                <div class="form-field">
                  <label for="newMinStock">
                    <span class="field-icon">⚠️</span>
                    Nuevo Stock Mínimo
                  </label>
                  <input
                    type="number"
                    id="newMinStock"
                    v-model.number="stockForm.nuevoStockMinimo"
                    placeholder="Mantener actual"
                    min="0"
                  />
                </div>
                <div class="form-field">
                  <label for="newLocation">
                    <span class="field-icon">📍</span>
                    Nueva Ubicación
                  </label>
                  <input
                    type="text"
                    id="newLocation"
                    v-model="stockForm.nuevaUbicacion"
                    placeholder="Mantener actual"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>
                    <span class="field-icon">📊</span>
                    Stock Resultante
                  </label>
                  <div
                    class="calculated-stock"
                    :class="getStockStatusClass(calculatedResultingStock)"
                  >
                    {{ calculatedResultingStock }} unidades
                    <span class="stock-status">{{
                      getStockStatusText(calculatedResultingStock)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de Operaciones -->
    <div v-if="operationsList.length > 0" class="operations-panel">
      <div class="panel-header">
        <h3>
          <span class="section-icon">📋</span>
          Operaciones Pendientes ({{ operationsList.length }})
        </h3>
        <div class="panel-actions">
          <button class="btn-warning" @click="clearAllOperations">
            <span class="btn-icon">🗑️</span>
            Limpiar Todo
          </button>
          <button class="btn-success" @click="executeAllOperations" :disabled="isProcessing">
            <span class="btn-icon">{{ isProcessing ? '⏳' : '✅' }}</span>
            {{ isProcessing ? 'Procesando...' : 'Ejecutar Operaciones' }}
          </button>
        </div>
      </div>
      <div class="panel-content">
        <div class="table-wrapper">
          <table class="operations-table">
            <thead>
              <tr>
                <th class="col-type">Tipo</th>
                <th class="col-code">Código</th>
                <th class="col-name">Producto</th>
                <th class="col-details">Detalles</th>
                <th class="col-status">Estado</th>
                <th class="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(operation, index) in operationsList" :key="index" class="operation-row">
                <td class="col-type">
                  <span class="operation-type" :class="operation.tipo">
                    <span class="type-icon">{{ getOperationIcon(operation.tipo) }}</span>
                    <span class="type-text">{{ getOperationText(operation.tipo) }}</span>
                  </span>
                </td>
                <td class="col-code">
                  <span class="product-code">{{ operation.code }}</span>
                </td>
                <td class="col-name">
                  <div class="product-info-cell">
                    <span class="product-name">{{ operation.name || 'Nuevo Producto' }}</span>
                    <span v-if="operation.category" class="product-category">{{
                      operation.category
                    }}</span>
                  </div>
                </td>
                <td class="col-details">
                  <div class="operation-details">
                    <div v-if="operation.tipo === 'crear'">
                      <span class="detail-item">💰 ${{ formatNumber(operation.unit_price) }}</span>
                      <span class="detail-item">📦 {{ operation.stock_quantity }} unidades</span>
                    </div>
                    <div v-else>
                      <span class="detail-item">{{
                        getOperationText(operation.tipoOperacion)
                      }}</span>
                      <span class="detail-item">{{ operation.cantidad }} unidades</span>
                      <span v-if="operation.motivo" class="detail-item">{{
                        operation.motivo
                      }}</span>
                    </div>
                  </div>
                </td>
                <td class="col-status">
                  <span class="operation-status pending">
                    <span class="status-dot"></span>
                    Pendiente
                  </span>
                </td>
                <td class="col-actions">
                  <button class="btn-edit" @click="editOperation(index)" title="Editar">✏️</button>
                  <button class="btn-delete" @click="removeOperation(index)" title="Eliminar">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Resultados de Operaciones -->
    <div v-if="operationResults.length > 0" class="results-panel">
      <div class="panel-header">
        <h3><span class="section-icon">📊</span>Resultados de Operaciones</h3>
      </div>
      <div class="panel-content">
        <div class="results-summary">
          <div class="result-stat success">
            <span class="stat-icon">✅</span>
            <span class="stat-number">{{ successfulOperations }}</span>
            <span class="stat-label">Exitosas</span>
          </div>
          <div class="result-stat error">
            <span class="stat-icon">❌</span>
            <span class="stat-number">{{ failedOperations }}</span>
            <span class="stat-label">Fallidas</span>
          </div>
          <div class="result-stat total">
            <span class="stat-icon">📋</span>
            <span class="stat-number">{{ operationResults.length }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>

        <div v-if="failedOperations > 0" class="error-details">
          <h4>Operaciones con Errores:</h4>
          <ul>
            <li v-for="(result, index) in operationResults" :key="index">
              <span v-if="!result.success">
                <strong>{{ result.operacion }}:</strong> {{ result.error }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockManagementView',
  data() {
    return {
      currentOperation: 'create',
      isProcessing: false,

      // Formulario de creación de producto (CÓDIGO EN LUGAR DE SKU)
      productForm: {
        code: '', // CAMBIO: era 'sku'
        name: '',
        description: '',
        category: '',
        brand: '',
        supplier: '',
        unit_price: null,
        profit_margin: 25,
        stock_quantity: null,
        min_stock: 5,
        warehouse_location: '',
        weight: '',
        dimensions: '',
        product_status: 'active',
      },

      // Labels en español para la interfaz
      productLabels: {
        code: 'Código del Producto', // CAMBIO: era 'sku'
        name: 'Nombre del Producto',
        description: 'Descripción',
        category: 'Categoría',
        brand: 'Marca',
        supplier: 'Proveedor',
        unit_price: 'Precio Unitario ($)',
        profit_margin: 'Margen de Ganancia (%)',
        stock_quantity: 'Stock Inicial',
        min_stock: 'Stock Mínimo',
        warehouse_location: 'Ubicación en Almacén',
        weight: 'Peso',
        dimensions: 'Dimensiones',
        product_status: 'Estado del Producto',
      },

      // Formulario de gestión de stock
      stockForm: {
        codigoProducto: '',
        tipoOperacion: '',
        cantidad: null,
        motivo: '',
        nuevoStockMinimo: null,
        nuevaUbicacion: '',
      },

      // Datos y estado
      operationsList: [],
      operationResults: [],
      foundProduct: null,
      validationErrors: {},

      // Mock data para simulación
      mockProducts: [
        {
          codigo: 'PROD-001',
          nombre: 'Laptop Gaming XYZ',
          categoria: 'Electrónicos',
          stockActual: 25,
          stockMinimo: 5,
        },
        {
          codigo: 'PROD-002',
          nombre: 'Mouse Inalámbrico Pro',
          categoria: 'Electrónicos',
          stockActual: 3,
          stockMinimo: 10,
        },
        {
          codigo: 'PROD-003',
          nombre: 'Teclado Mecánico RGB',
          categoria: 'Electrónicos',
          stockActual: 15,
          stockMinimo: 8,
        },
      ],
    }
  },

  computed: {
    totalOperations() {
      return this.operationsList.length
    },

    isProductFormValid() {
      return !!(
        this.productForm.code && // CAMBIO: era 'sku'
        this.productForm.name &&
        this.productForm.category &&
        this.productForm.unit_price > 0 &&
        this.productForm.stock_quantity >= 0
      )
    },

    isStockFormValid() {
      return !!(
        this.stockForm.codigoProducto &&
        this.stockForm.tipoOperacion &&
        this.stockForm.cantidad > 0
      )
    },

    calculatedResultingStock() {
      if (!this.foundProduct || !this.stockForm.cantidad) return 0

      const currentStock = this.foundProduct.stockActual
      const quantity = this.stockForm.cantidad

      switch (this.stockForm.tipoOperacion) {
        case 'entrada':
        case 'devolucion':
          return currentStock + quantity
        case 'salida':
          return Math.max(0, currentStock - quantity)
        case 'ajuste':
          return quantity
        default:
          return currentStock
      }
    },

    successfulOperations() {
      return this.operationResults.filter((r) => r.success).length
    },

    failedOperations() {
      return this.operationResults.filter((r) => !r.success).length
    },
  },

  methods: {
    // Cambio de operación
    switchOperation(operation) {
      this.currentOperation = operation
      this.clearValidationErrors()
    },

    // Validaciones
    validateProductForm() {
      this.validationErrors = {}

      if (!this.productForm.code) {
        // CAMBIO: era 'sku'
        this.validationErrors.code = 'El código es obligatorio'
      }

      if (!this.productForm.name) {
        this.validationErrors.name = 'El nombre es obligatorio'
      }

      if (!this.productForm.category) {
        this.validationErrors.category = 'La categoría es obligatoria'
      }

      if (!this.productForm.unit_price || this.productForm.unit_price <= 0) {
        this.validationErrors.unit_price = 'El precio debe ser mayor a 0'
      }

      if (this.productForm.stock_quantity === null || this.productForm.stock_quantity < 0) {
        this.validationErrors.stock_quantity = 'El stock inicial no puede ser negativo'
      }

      // Verificar si el código ya existe
      const existingProduct = this.operationsList.find((op) => op.code === this.productForm.code)
      if (existingProduct) {
        this.validationErrors.code = 'Ya existe una operación con este código'
      }

      return Object.keys(this.validationErrors).length === 0
    },

    validateStockForm() {
      this.validationErrors = {}

      if (!this.stockForm.codigoProducto) {
        this.validationErrors.codigoProducto = 'El código del producto es obligatorio'
      }

      if (!this.stockForm.tipoOperacion) {
        this.validationErrors.tipoOperacion = 'Debe seleccionar un tipo de operación'
      }

      if (!this.stockForm.cantidad || this.stockForm.cantidad <= 0) {
        this.validationErrors.cantidad = 'La cantidad debe ser mayor a 0'
      }

      return Object.keys(this.validationErrors).length === 0
    },

    clearValidationErrors() {
      this.validationErrors = {}
    },

    // Gestión de productos
    addProductToList() {
      if (!this.validateProductForm()) return

      const newProduct = {
        tipo: 'crear',
        // Usar 'code' en lugar de 'sku'
        code: this.productForm.code, // CAMBIO: era 'sku'
        name: this.productForm.name,
        description: this.productForm.description,
        category: this.productForm.category,
        brand: this.productForm.brand,
        supplier: this.productForm.supplier,
        unit_price: this.productForm.unit_price,
        profit_margin: this.productForm.profit_margin,
        stock_quantity: this.productForm.stock_quantity,
        min_stock: this.productForm.min_stock,
        warehouse_location: this.productForm.warehouse_location,
        weight: this.productForm.weight,
        dimensions: this.productForm.dimensions,
        product_status: this.productForm.product_status,
        timestamp: new Date().toISOString(),
      }

      this.operationsList.push(newProduct)
      this.clearProductForm()
      console.log('✅ Producto agregado a la lista:', newProduct.name)
    },

    clearProductForm() {
      this.productForm = {
        code: '', // CAMBIO: era 'sku'
        name: '',
        description: '',
        category: '',
        brand: '',
        supplier: '',
        unit_price: null,
        profit_margin: 25,
        stock_quantity: null,
        min_stock: 5,
        warehouse_location: '',
        weight: '',
        dimensions: '',
        product_status: 'active',
      }
      this.clearValidationErrors()
    },

    // Gestión de stock
    searchExistingProduct() {
      if (this.stockForm.codigoProducto.length < 3) {
        this.foundProduct = null
        return
      }

      // Simular búsqueda en productos existentes
      const product = this.mockProducts.find((p) =>
        p.codigo.toLowerCase().includes(this.stockForm.codigoProducto.toLowerCase()),
      )

      this.foundProduct = product || null

      if (this.foundProduct) {
        console.log('🔍 Producto encontrado:', this.foundProduct.nombre)
      }
    },

    addStockToList() {
      if (!this.validateStockForm()) return

      const stockOperation = {
        tipo: 'stock',
        codigo: this.stockForm.codigoProducto,
        nombre: this.foundProduct?.nombre || 'Producto no encontrado',
        categoria: this.foundProduct?.categoria || '',
        tipoOperacion: this.stockForm.tipoOperacion,
        cantidad: this.stockForm.cantidad,
        motivo: this.stockForm.motivo,
        nuevoStockMinimo: this.stockForm.nuevoStockMinimo,
        nuevaUbicacion: this.stockForm.nuevaUbicacion,
        stockActual: this.foundProduct?.stockActual || 0,
        stockResultante: this.calculatedResultingStock,
        timestamp: new Date().toISOString(),
      }

      this.operationsList.push(stockOperation)
      this.clearStockForm()
      console.log('✅ Operación de stock agregada:', stockOperation.tipoOperacion)
    },

    clearStockForm() {
      this.stockForm = {
        codigoProducto: '',
        tipoOperacion: '',
        cantidad: null,
        motivo: '',
        nuevoStockMinimo: null,
        nuevaUbicacion: '',
      }
      this.foundProduct = null
      this.clearValidationErrors()
    },

    // Gestión de operaciones
    editOperation(index) {
      const operation = this.operationsList[index]

      if (operation.tipo === 'crear') {
        this.currentOperation = 'create'
        // Mapear de vuelta al formulario
        this.productForm = {
          code: operation.code, // CAMBIO: era 'sku'
          name: operation.name,
          description: operation.description,
          category: operation.category,
          brand: operation.brand,
          supplier: operation.supplier,
          unit_price: operation.unit_price,
          profit_margin: operation.profit_margin,
          stock_quantity: operation.stock_quantity,
          min_stock: operation.min_stock,
          warehouse_location: operation.warehouse_location,
          weight: operation.weight,
          dimensions: operation.dimensions,
          product_status: operation.product_status,
        }
      } else {
        this.currentOperation = 'stock'
        this.stockForm = {
          codigoProducto: operation.codigo,
          tipoOperacion: operation.tipoOperacion,
          cantidad: operation.cantidad,
          motivo: operation.motivo,
          nuevoStockMinimo: operation.nuevoStockMinimo,
          nuevaUbicacion: operation.nuevaUbicacion,
        }
        this.searchExistingProduct()
      }

      this.removeOperation(index)
    },

    removeOperation(index) {
      const operation = this.operationsList[index]
      console.log('🗑️ Eliminando operación:', operation.code || operation.codigo)
      this.operationsList.splice(index, 1)
    },

    clearAllOperations() {
      if (confirm('¿Está seguro de eliminar todas las operaciones pendientes?')) {
        this.operationsList = []
        this.operationResults = []
        console.log('🗑️ Todas las operaciones eliminadas')
      }
    },

    // Ejecución de operaciones
    async executeAllOperations() {
      if (this.operationsList.length === 0) return

      this.isProcessing = true
      this.operationResults = []

      try {
        console.log('🚀 Ejecutando', this.operationsList.length, 'operaciones...')

        for (const operation of this.operationsList) {
          try {
            // Simular procesamiento
            await this.simulateOperation(operation)

            this.operationResults.push({
              success: true,
              operacion: `${operation.tipo}: ${operation.code || operation.codigo}`,
              message: 'Operación completada exitosamente',
            })
          } catch (error) {
            this.operationResults.push({
              success: false,
              operacion: `${operation.tipo}: ${operation.code || operation.codigo}`,
              error: error.message,
            })
          }
        }

        console.log('✅ Operaciones completadas:', this.successfulOperations, 'exitosas')

        // Limpiar operaciones exitosas
        this.operationsList = this.operationsList.filter(
          (_, index) => !this.operationResults[index]?.success,
        )
      } catch (error) {
        console.error('❌ Error ejecutando operaciones:', error)
        alert('Error al ejecutar las operaciones')
      } finally {
        this.isProcessing = false
      }
    },

    async simulateOperation(operation) {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simular posibles errores
      if (Math.random() < 0.1) {
        // 10% de probabilidad de error
        throw new Error('Error simulado de conexión')
      }

      if (operation.tipo === 'crear') {
        console.log('📝 Creando producto:', operation.name)
        // TODO: Aquí iría la llamada al API cuando conectes el backend:
        // const axios = await import('@/services/axios')
        // await axios.post('/products/', operation)
      } else {
        console.log('📦 Actualizando stock:', operation.codigo, operation.tipoOperacion)
        // TODO: Aquí iría la llamada al API cuando conectes el backend:
        // const axios = await import('@/services/axios')
        // await axios.put(`/products/${operation.codigo}/stock`, operation)
      }
    },

    // Utilidades
    formatNumber(number) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number || 0)
    },

    getOperationIcon(tipo) {
      const icons = {
        crear: '🆕',
        stock: '📦',
        entrada: '➕',
        salida: '➖',
        ajuste: '🔧',
        devolucion: '↩️',
      }
      return icons[tipo] || '📋'
    },

    getOperationText(tipo) {
      const texts = {
        crear: 'Crear Producto',
        stock: 'Gestión Stock',
        entrada: 'Entrada',
        salida: 'Salida',
        ajuste: 'Ajuste',
        devolucion: 'Devolución',
      }
      return texts[tipo] || tipo
    },

    getStockStatusClass(stock) {
      if (stock <= 5) return 'critical'
      if (stock <= 20) return 'low'
      if (stock <= 50) return 'medium'
      return 'high'
    },

    getStockStatusText(stock) {
      if (stock <= 5) return '(Crítico)'
      if (stock <= 20) return '(Bajo)'
      if (stock <= 50) return '(Medio)'
      return '(Alto)'
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

.stock-workspace {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  z-index: 100;
}

/* Header */
.stock-header {
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

.operation-counter {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.counter-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.counter-number {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Tabs de operación */
.operation-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.tab-button {
  background: white;
  border: 2px solid var(--border-color);
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 200px;
  justify-content: center;
}

.tab-button:hover {
  border-color: var(--primary-color);
  background: rgba(0, 51, 102, 0.05);
}

.tab-button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.tab-icon {
  font-size: 1.2rem;
}

/* Paneles principales */
.form-panel,
.operations-panel,
.results-panel {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 50;
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

.form-actions,
.panel-actions {
  display: flex;
  gap: 1rem;
}

.panel-content {
  padding: 2rem;
}

/* Formularios */
.form-grid {
  display: grid;
  gap: 2rem;
}

.stock-grid {
  grid-template-columns: 1fr;
}

.form-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-icon {
  font-size: 1rem;
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
  box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
}

.form-field input.error,
.form-field select.error {
  border-color: var(--error-color);
  background: rgba(231, 76, 60, 0.05);
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Inputs especiales */
.currency-input {
  display: flex;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.currency-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
}

.currency-symbol {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  font-weight: 600;
  border-right: 1px solid var(--border-color);
}

.currency-input input {
  border: none;
  flex: 1;
  margin: 0;
}

.calculated-price,
.calculated-stock {
  padding: 0.75rem 1rem;
  background: #e8f5e8;
  border: 2px solid #c3e6c3;
  border-radius: var(--radius-md);
  font-weight: 600;
  color: var(--success-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calculated-stock.critical {
  background: #fef2f2;
  border-color: #fecaca;
  color: var(--error-color);
}

.calculated-stock.low {
  background: #fffbeb;
  border-color: #fed7aa;
  color: var(--warning-color);
}

.stock-status {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Información de producto encontrado */
.product-info {
  margin-top: 1rem;
}

.product-card {
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: var(--radius-md);
  padding: 1rem;
}

.product-card h5 {
  margin: 0 0 0.5rem;
  color: var(--success-color);
  font-weight: 600;
}

.product-card p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Botones */
.btn-primary,
.btn-secondary,
.btn-success,
.btn-warning,
.btn-edit,
.btn-delete {
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

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-warning {
  background: var(--warning-color);
  color: white;
}

.btn-edit {
  background: var(--info-color);
  color: white;
  padding: 0.5rem;
  font-size: 0.8rem;
}

.btn-delete {
  background: var(--error-color);
  color: white;
  padding: 0.5rem;
  font-size: 0.8rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tabla de operaciones */
.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.operations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.operations-table th {
  background: linear-gradient(145deg, #f1f3f4, #e8eaed);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 20;
}

.operations-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.operations-table tr:hover {
  background: #f8f9fa;
}

/* Contenido de celdas */
.operation-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
}

.operation-type.crear {
  background: rgba(39, 174, 96, 0.1);
  color: var(--success-color);
}

.operation-type.stock {
  background: rgba(52, 152, 219, 0.1);
  color: var(--info-color);
}

.product-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--primary-color);
}

.product-info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: var(--text-primary);
}

.product-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.operation-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: block;
}

.operation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
}

.operation-status.pending {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: currentColor;
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

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.error-details {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
}

.error-details h4 {
  color: var(--error-color);
  margin: 0 0 0.5rem;
}

.error-details ul {
  margin: 0;
  padding-left: 1.5rem;
}

.error-details li {
  color: var(--error-color);
  margin-bottom: 0.25rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .operation-tabs {
    flex-direction: column;
  }

  .tab-button {
    min-width: unset;
  }

  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .form-actions,
  .panel-actions {
    justify-content: center;
  }

  .operations-table {
    font-size: 0.8rem;
  }

  .operations-table th,
  .operations-table td {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .stock-workspace {
    padding: 0.5rem;
  }

  .stock-header {
    padding: 1rem;
  }

  .panel-content {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>
