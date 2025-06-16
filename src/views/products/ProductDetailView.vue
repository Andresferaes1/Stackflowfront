<template>
  <div class="product-detail-workspace">
    <!-- Header con navegación de regreso -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        Volver al Catálogo
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-item">📦 Productos</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ product.name || 'Detalle del Producto' }}</span>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando información del producto...</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>Error al cargar el producto</h3>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <button @click="loadProduct" class="retry-btn">
          🔄 Reintentar
        </button>
        <button @click="goBack" class="back-error-btn">
          ← Volver al Catálogo
        </button>
      </div>
    </div>

    <!-- Estado de producto no encontrado -->
    <div v-else-if="!product.id" class="not-found-state">
      <div class="not-found-icon">🔍</div>
      <h3>Producto no encontrado</h3>
      <p>El producto solicitado no existe o ha sido eliminado del catálogo.</p>
      <button @click="goBack" class="back-btn-primary">
        ← Regresar al Catálogo
      </button>
    </div>

    <!-- Contenido principal del producto -->
    <div v-else class="product-detail-content">
      <!-- Panel principal con imagen y información básica -->
      <div class="product-main-panel">
        <div class="product-image-section">
          <!-- Imagen principal del producto -->
          <div class="main-image-container">
            <img 
              :src="product.image || getDefaultImage(product.category)" 
              :alt="product.name"
              class="main-product-image"
              @error="handleImageError"
            />
            <!-- Badge de categoría sobre la imagen -->
            <div class="category-badge">{{ getCategoryText(product.category) }}</div>
            <!-- Badge de estado de stock -->
            <div :class="['stock-badge-overlay', `stock-${getStockStatus(product.stock)}`]">
              <span class="stock-icon">{{ getStockIcon(getStockStatus(product.stock)) }}</span>
              <span class="stock-text">{{ getStockStatusText(getStockStatus(product.stock)) }}</span>
            </div>
          </div>
        </div>

        <!-- Información principal del producto -->
        <div class="product-info-section">
          <div class="product-header-info">
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-code">Código: <span class="code-highlight">{{ product.code }}</span></p>
            
            <!-- Precio destacado -->
            <div class="price-section">
              <span class="currency">$</span>
              <span class="price-amount">{{ formatNumber(product.price) }}</span>
              <span class="price-unit">COP</span>
            </div>

            <!-- Información de stock -->
            <div class="stock-info">
              <div :class="['stock-indicator', `stock-${getStockStatus(product.stock)}`]">
                <span class="stock-icon-large">{{ getStockIcon(getStockStatus(product.stock)) }}</span>
                <div class="stock-details">
                  <span class="stock-status">{{ getStockStatusText(getStockStatus(product.stock)) }}</span>
                  <span class="stock-quantity">{{ product.stock }} unidades disponibles</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones principales -->
          <div class="product-actions">
            <button 
              class="action-btn primary"
              :disabled="product.stock === 0"
              @click="addToQuote"
            >
              <span class="btn-icon">📋</span>
              {{ product.stock === 0 ? 'Sin Stock' : 'Agregar a Cotización' }}
            </button>
            <button class="action-btn secondary" @click="shareProduct">
              <span class="btn-icon">📤</span>
              Compartir Producto
            </button>
            <button class="action-btn outline" @click="printProduct">
              <span class="btn-icon">🖨️</span>
              Imprimir Ficha
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de descripción detallada -->
      <div class="product-description-panel">
        <h2 class="section-title">
          <span class="section-icon">📄</span>
          Descripción Detallada
        </h2>
        <div class="description-content">
          <p class="description-text">{{ product.description }}</p>
          
          <!-- Características adicionales (mock data) -->
          <div v-if="product.specifications" class="specifications">
            <h3>Especificaciones Técnicas:</h3>
            <ul class="specs-list">
              <li v-for="(value, key) in product.specifications" :key="key">
                <strong>{{ formatSpecKey(key) }}:</strong> {{ value }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Panel de información comercial -->
      <div class="commercial-info-panel">
        <div class="info-grid">
          <!-- Información de disponibilidad -->
          <div class="info-card availability">
            <div class="card-header">
              <span class="card-icon">📦</span>
              <h3>Disponibilidad</h3>
            </div>
            <div class="card-content">
              <div class="availability-item">
                <span class="label">Stock Actual:</span>
                <span :class="['value', `stock-${getStockStatus(product.stock)}`]">
                  {{ product.stock }} unidades
                </span>
              </div>
              <div class="availability-item">
                <span class="label">Estado:</span>
                <span :class="['status-badge', `status-${getStockStatus(product.stock)}`]">
                  {{ getStockStatusText(getStockStatus(product.stock)) }}
                </span>
              </div>
              <div v-if="getStockStatus(product.stock) === 'bajo'" class="availability-item warning">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">Stock limitado - Considere hacer pedido pronto</span>
              </div>
            </div>
          </div>

          <!-- Información de categoría -->
          <div class="info-card category">
            <div class="card-header">
              <span class="card-icon">📂</span>
              <h3>Categoría</h3>
            </div>
            <div class="card-content">
              <div class="category-info">
                <span class="category-name">{{ getCategoryText(product.category) }}</span>
                <p class="category-description">{{ getCategoryDescription(product.category) }}</p>
              </div>
            </div>
          </div>

          <!-- Información de proveedor (mock data) -->
          <div class="info-card supplier">
            <div class="card-header">
              <span class="card-icon">🏢</span>
              <h3>Proveedor</h3>
            </div>
            <div class="card-content">
              <div class="supplier-info">
                <span class="supplier-name">{{ product.supplier || 'Proveedor Principal' }}</span>
                <span class="supplier-code">Ref: {{ product.supplierCode || 'SUP-001' }}</span>
              </div>
            </div>
          </div>

          <!-- Información de ventas (mock data) -->
          <div class="info-card sales">
            <div class="card-header">
              <span class="card-icon">📊</span>
              <h3>Información de Ventas</h3>
            </div>
            <div class="card-content">
              <div class="sales-stats">
                <div class="stat-item">
                  <span class="stat-label">Unidades Vendidas (Mes):</span>
                  <span class="stat-value">{{ product.monthlySales || Math.floor(Math.random() * 50) + 10 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Última Venta:</span>
                  <span class="stat-value">{{ formatDate(product.lastSale || new Date()) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de productos relacionados -->
      <div class="related-products-panel">
        <h2 class="section-title">
          <span class="section-icon">🔗</span>
          Productos Relacionados
        </h2>
        <div class="related-products-grid">
          <div 
            v-for="relatedProduct in relatedProducts" 
            :key="relatedProduct.id"
            class="related-product-card"
            @click="navigateToProduct(relatedProduct.id)"
          >
            <img 
              :src="relatedProduct.image || getDefaultImage(relatedProduct.category)" 
              :alt="relatedProduct.name"
              class="related-product-image"
            />
            <div class="related-product-info">
              <h4 class="related-product-name">{{ truncateText(relatedProduct.name, 40) }}</h4>
              <p class="related-product-price">${{ formatNumber(relatedProduct.price) }}</p>
              <span :class="['related-stock-badge', `stock-${getStockStatus(relatedProduct.stock)}`]">
                {{ getStockIcon(getStockStatus(relatedProduct.stock)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetailView',
  data() {
    return {
      isLoading: false,
      error: null,
      product: {}, // Producto principal
      relatedProducts: [], // Productos relacionados
      
      // Datos mock temporales (se reemplazarán con backend)
      mockProducts: [
        {
          id: 1,
          name: 'Taladro Percutor Profesional 1200W',
          code: 'TLD-1200-PRO',
          description: 'Taladro percutor profesional con sistema SDS-Plus, ideal para trabajos pesados en mampostería y metal. Incluye maletín de transporte, brocas variadas y manual de usuario. Motor de alta potencia con control de velocidad variable y función de percusión ajustable.',
          category: 'herramientas',
          price: 450000,
          stock: 15,
          image: null,
          supplier: 'Herramientas Industriales S.A.',
          supplierCode: 'HER-TLD-001',
          specifications: {
            potencia: '1200W',
            velocidad: '0-3000 RPM',
            capacidad: 'Hasta 13mm en metal',
            peso: '2.8 kg',
            garantia: '2 años'
          },
          monthlySales: 25,
          lastSale: new Date(2024, 11, 10)
        },
        {
          id: 2,
          name: 'Cemento Portland Tipo I - 50kg',
          code: 'CEM-POR-50K',
          description: 'Cemento Portland de alta calidad para construcción general, ideal para cimientos y estructuras.',
          category: 'materiales',
          price: 35000,
          stock: 120,
          image: null
        },
        {
          id: 3,
          name: 'Sierra Circular 1400W 7.25"',
          code: 'SIR-CIR-1400',
          description: 'Sierra circular profesional con disco de 7.25 pulgadas, ideal para cortes precisos en madera.',
          category: 'herramientas',
          price: 320000,
          stock: 8,
          image: null
        },
        {
          id: 4,
          name: 'Tubo PVC 4" x 6m',
          code: 'TUB-PVC-4X6',
          description: 'Tubo PVC sanitario de 4 pulgadas por 6 metros, ideal para sistemas de drenaje y alcantarillado.',
          category: 'plomeria',
          price: 85000,
          stock: 45,
          image: null
        }
      ]
    }
  },
  
  computed: {
    // Obtener ID del producto desde la ruta
    productId() {
      return parseInt(this.$route.params.id)
    }
  },
  
  methods: {
    // Cargar datos del producto (mock temporal)
    async loadProduct() {
      this.isLoading = true
      this.error = null
      
      try {
        console.log(`🔍 Cargando producto con ID: ${this.productId}`)
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Buscar producto en datos mock
        const foundProduct = this.mockProducts.find(p => p.id === this.productId)
        
        if (foundProduct) {
          this.product = { ...foundProduct }
          this.loadRelatedProducts()
          console.log('✅ Producto cargado exitosamente:', this.product.name)
        } else {
          this.product = {}
          console.log('❌ Producto no encontrado')
        }
        
        // TODO: Reemplazar con llamada real al backend
        // const response = await axios.get(`/api/products/${this.productId}/`)
        // this.product = response.data
        
      } catch (error) {
        console.error('❌ Error cargando producto:', error)
        this.error = 'No se pudo cargar la información del producto. Verifique su conexión e intente nuevamente.'
      } finally {
        this.isLoading = false
      }
    },
    
    // Cargar productos relacionados (mock temporal)
    loadRelatedProducts() {
      // Filtrar productos de la misma categoría, excluyendo el actual
      this.relatedProducts = this.mockProducts
        .filter(p => p.id !== this.productId && p.category === this.product.category)
        .slice(0, 4) // Máximo 4 productos relacionados
      
      console.log(`🔗 ${this.relatedProducts.length} productos relacionados cargados`)
    },
    
    // Navegación de regreso al catálogo
    goBack() {
      console.log('← Regresando al catálogo de productos')
      this.$router.push('/dashboard/products/read')
    },
    
    // Navegar a otro producto
    navigateToProduct(productId) {
      console.log(`👁️ Navegando al producto ID: ${productId}`)
      this.$router.push(`/dashboard/products/detail/${productId}`)
    },
    
    // Acciones de producto
    addToQuote() {
      if (this.product.stock > 0) {
        console.log(`📋 Agregando producto "${this.product.name}" a cotización`)
        // TODO: Implementar lógica de cotización
        alert(`Producto "${this.product.name}" agregado a la cotización`)
      }
    },
    
    shareProduct() {
      console.log(`📤 Compartiendo producto: ${this.product.name}`)
      // TODO: Implementar funcionalidad de compartir
      const shareData = {
        title: this.product.name,
        text: `Mira este producto: ${this.product.name} - $${this.formatNumber(this.product.price)}`,
        url: window.location.href
      }
      
      if (navigator.share) {
        navigator.share(shareData)
      } else {
        // Fallback para navegadores sin soporte nativo
        navigator.clipboard.writeText(window.location.href)
        alert('Enlace copiado al portapapeles')
      }
    },
    
    printProduct() {
      console.log(`🖨️ Imprimiendo ficha del producto: ${this.product.name}`)
      // TODO: Implementar vista de impresión
      window.print()
    },
    
    // Funciones auxiliares para estado de stock
    getStockStatus(stock) {
      if (stock === 0) return 'agotado'
      if (stock <= 10) return 'bajo'
      return 'disponible'
    },
    
    getStockIcon(status) {
      const icons = {
        disponible: '✅',
        bajo: '⚠️',
        agotado: '❌'
      }
      return icons[status] || '❓'
    },
    
    getStockStatusText(status) {
      const texts = {
        disponible: 'Disponible',
        bajo: 'Stock Bajo',
        agotado: 'Agotado'
      }
      return texts[status] || 'Desconocido'
    },
    
    // Funciones auxiliares para categorías
    getCategoryText(category) {
      const texts = {
        herramientas: '🔧 Herramientas',
        materiales: '🧱 Materiales',
        equipos: '⚙️ Equipos',
        accesorios: '🔩 Accesorios',
        electricidad: '⚡ Electricidad',
        plomeria: '🚿 Plomería'
      }
      return texts[category] || category
    },
    
    getCategoryDescription(category) {
      const descriptions = {
        herramientas: 'Herramientas profesionales para construcción y reparación',
        materiales: 'Materiales básicos para construcción y acabados',
        equipos: 'Equipos especializados para trabajo industrial',
        accesorios: 'Accesorios y complementos para instalaciones',
        electricidad: 'Productos para instalaciones eléctricas',
        plomeria: 'Productos para sistemas hidráulicos y sanitarios'
      }
      return descriptions[category] || 'Categoría de productos'
    },
    
    // Funciones auxiliares de formato
    formatNumber(number) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(number || 0)
    },
    
    formatDate(date) {
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(date))
    },
    
    formatSpecKey(key) {
      return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    },
    
    truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    
    getDefaultImage(category) {
      const defaults = {
        herramientas: '/images/default-tools.jpg',
        materiales: '/images/default-materials.jpg',
        equipos: '/images/default-equipment.jpg',
        accesorios: '/images/default-accessories.jpg',
        electricidad: '/images/default-electrical.jpg',
        plomeria: '/images/default-plumbing.jpg'
      }
      return defaults[category] || '/images/default-product.jpg'
    },
    
    handleImageError(event) {
      event.target.src = '/images/product-placeholder.jpg'
    }
  },
  
  // Cargar producto al montar el componente
  async mounted() {
    console.log('📍 ProductDetailView montado - ID del producto:', this.productId)
    await this.loadProduct()
  },
  
  // Recargar cuando cambie el ID en la ruta
  async beforeRouteUpdate(to, from, next) {
    console.log(`🔄 Actualizando producto: ${from.params.id} → ${to.params.id}`)
    next()
    await this.loadProduct()
  }
}
</script>

<style scoped>
/* Variables CSS para consistencia */
:root {
  --primary-color: #003366;
  --secondary-color: #d0e229;
  --accent-color: #0fac21;
  --blue-color: #1e88e5;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --text-dark: #2c3e50;
  --text-light: #64748b;
  --background-light: #f8f9fa;
  --white: #ffffff;
  --border-color: #e2e8f0;
  --shadow-light: 0 2px 10px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Contenedor principal */
.product-detail-workspace {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* Header con navegación */
.detail-header {
  background: var(--primary-color);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-medium);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.2rem;
}

.breadcrumb {
  font-size: 0.9rem;
  opacity: 0.9;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
}

.breadcrumb-current {
  font-weight: 600;
}

/* Estados de carga, error y no encontrado */
.loading-state,
.error-state,
.not-found-state {
  background: white;
  border-radius: 0.75rem;
  box-shadow: var(--shadow-light);
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.not-found-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.retry-btn,
.back-error-btn,
.back-btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn {
  background: var(--primary-color);
  color: white;
}

.back-error-btn,
.back-btn-primary {
  background: var(--text-light);
  color: white;
}

/* Panel principal del producto */
.product-main-panel {
  background: white;
  border-radius: 0.75rem;
  box-shadow: var(--shadow-light);
  overflow: hidden;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
}

/* Sección de imagen */
.product-image-section {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.main-image-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 400px;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: var(--shadow-medium);
}

.main-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-product-image:hover {
  transform: scale(1.05);
}

.category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 51, 102, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.stock-badge-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.stock-disponible {
  background: rgba(39, 174, 96, 0.9);
  color: white;
}

.stock-bajo {
  background: rgba(243, 156, 18, 0.9);
  color: white;
}

.stock-agotado {
  background: rgba(231, 76, 60, 0.9);
  color: white;
}

/* Sección de información del producto */
.product-info-section {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 1rem;
  line-height: 1.3;
}

.product-code {
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.code-highlight {
  font-family: monospace;
  background: var(--background-light);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: var(--text-dark);
  font-weight: 600;
}

/* Sección de precio */
.price-section {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.currency {
  font-size: 1.5rem;
  color: var(--success-color);
  font-weight: 600;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--success-color);
}

.price-unit {
  font-size: 1rem;
  color: var(--text-light);
  font-weight: 600;
}

/* Información de stock */
.stock-info {
  margin-bottom: 2rem;
}

.stock-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid;
}

.stock-indicator.stock-disponible {
  background: rgba(39, 174, 96, 0.1);
  border-color: var(--success-color);
  color: var(--success-color);
}

.stock-indicator.stock-bajo {
  background: rgba(243, 156, 18, 0.1);
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.stock-indicator.stock-agotado {
  background: rgba(231, 76, 60, 0.1);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.stock-icon-large {
  font-size: 2rem;
}

.stock-details {
  display: flex;
  flex-direction: column;
}

.stock-status {
  font-weight: 600;
  font-size: 1.1rem;
}

.stock-quantity {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Acciones del producto */
.product-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #004080;
  transform: translateY(-2px);
}

.action-btn.primary:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn.secondary {
  background: var(--blue-color);
  color: white;
}

.action-btn.secondary:hover {
  background: #1565c0;
  transform: translateY(-2px);
}

.action-btn.outline {
  background: white;
  color: var(--text-dark);
  border: 2px solid var(--border-color);
}

.action-btn.outline:hover {
  background: var(--background-light);
  border-color: var(--text-dark);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Panel de descripción */
.product-description-panel,
.commercial-info-panel,
.related-products-panel {
  background: white;
  border-radius: 0.75rem;
  box-shadow: var(--shadow-light);
  margin-bottom: 2rem;
}

.section-title {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  border-radius: 0.75rem 0.75rem 0 0;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.5rem;
}

.description-content {
  padding: 2rem;
}

.description-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-dark);
  margin-bottom: 2rem;
}

.specifications h3 {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.specs-list {
  list-style: none;
  padding: 0;
}

.specs-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-dark);
}

.specs-list li:last-child {
  border-bottom: none;
}

/* Panel de información comercial */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.info-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.card-header {
  background: var(--background-light);
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-dark);
}

.card-icon {
  font-size: 1.5rem;
}

.card-content {
  padding: 1rem;
}

.availability-item,
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.availability-item:last-child,
.stat-item:last-child {
  margin-bottom: 0;
}

.availability-item.warning {
  background: rgba(243, 156, 18, 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-top: 1rem;
}

.warning-icon {
  margin-right: 0.5rem;
}

.warning-text {
  font-size: 0.875rem;
  color: var(--warning-color);
  font-weight: 600;
}

.label,
.stat-label {
  font-weight: 600;
  color: var(--text-dark);
}

.value,
.stat-value {
  color: var(--text-light);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-disponible {
  background: rgba(39, 174, 96, 0.1);
  color: var(--success-color);
}

.status-bajo {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.status-agotado {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
}

.category-info,
.supplier-info {
  text-align: center;
}

.category-name,
.supplier-name {
  display: block;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.category-description {
  font-size: 0.875rem;
  color: var(--text-light);
  margin: 0;
}

.supplier-code {
  font-size: 0.875rem;
  color: var(--text-light);
  font-family: monospace;
}

/* Productos relacionados */
.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.related-product-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-product-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
}

.related-product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: var(--background-light);
}

.related-product-info {
  padding: 1rem;
  position: relative;
}

.related-product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.related-product-price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--success-color);
  margin: 0;
}

.related-stock-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 968px) {
  .detail-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .product-main-panel {
    grid-template-columns: 1fr;
  }
  
  .product-image-section {
    order: 2;
  }
  
  .product-info-section {
    order: 1;
  }
  
  .main-image-container {
    max-width: 300px;
    height: 300px;
  }
  
  .product-title {
    font-size: 1.5rem;
  }
  
  .price-amount {
    font-size: 2rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .related-products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .product-detail-workspace {
    padding: 0 1rem;
  }
  
  .detail-header {
    padding: 1rem;
  }
  
  .product-info-section {
    padding: 1rem;
  }
  
  .description-content {
    padding: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>