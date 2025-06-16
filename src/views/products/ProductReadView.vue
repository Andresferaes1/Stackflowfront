<template>
  <div class="product-read-workspace">
    <!-- Header Principal -->
    <div class="product-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-icon">📦</span>
            Catálogo de Productos
          </h1>
          <p class="subtitle">Busca y consulta información detallada de todos los productos disponibles</p>
        </div>
        <div class="stats-badge">
          <span class="badge-label">Total:</span>
          <span class="badge-number">{{ totalProducts }}</span>
        </div>
      </div>
    </div>

    <!-- Panel de Búsqueda Avanzada -->
    <div class="search-panel">
      <div class="panel-header">
        <h3><span class="section-icon">🔍</span>Búsqueda Inteligente</h3>
        <div class="search-actions">
          <button class="btn-clear" @click="clearSearch" v-if="searchQuery">
            <span class="btn-icon">🗑️</span>
            Limpiar
          </button>
          <button class="btn-toggle" @click="toggleSearchPanel">
            <span class="btn-icon">{{ showAdvancedSearch ? '🔼' : '🔽' }}</span>
            {{ showAdvancedSearch ? 'Básica' : 'Avanzada' }}
          </button>
        </div>
      </div>
      
      <div class="search-content">
        <!-- Búsqueda Principal -->
        <div class="main-search">
          <div class="search-field">
            <label for="mainSearch">
              <span class="field-icon">🔍</span>
              Búsqueda Rápida
            </label>
            <div class="search-input-wrapper">
              <input
                id="mainSearch"
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, código o descripción..."
                class="search-input"
                @input="handleSearch"
                @keyup.enter="performSearch"
              />
              <button class="search-button" @click="performSearch">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
            <small class="field-help">Escribe cualquier término para buscar en nombre, código o descripción</small>
          </div>
        </div>

        <!-- Filtros Avanzados -->
        <div v-show="showAdvancedSearch" class="advanced-filters">
          <div class="filters-row">
            <div class="filter-field">
              <label for="codeFilter">
                <span class="field-icon">🔢</span>
                Código de Producto
              </label>
              <input
                id="codeFilter"
                v-model="filters.code"
                type="text"
                placeholder="Ej: PRD-001"
                class="filter-input"
                @input="handleSearch"
              />
              <small class="field-help">Buscar por código específico</small>
            </div>

            <div class="filter-field">
              <label for="categoryFilter">
                <span class="field-icon">📂</span>
                Categoría
              </label>
              <select
                id="categoryFilter"
                v-model="filters.category"
                class="filter-select"
                @change="handleSearch"
              >
                <option value="">Todas las categorías</option>
                <option value="herramientas">🔧 Herramientas</option>
                <option value="materiales">🧱 Materiales</option>
                <option value="equipos">⚙️ Equipos</option>
                <option value="accesorios">🔩 Accesorios</option>
                <option value="electricidad">⚡ Electricidad</option>
                <option value="plomeria">🚿 Plomería</option>
              </select>
              <small class="field-help">Filtrar por categoría específica</small>
            </div>

            <div class="filter-field">
              <label for="stockFilter">
                <span class="field-icon">📊</span>
                Estado de Stock
              </label>
              <select
                id="stockFilter"
                v-model="filters.stockStatus"
                class="filter-select"
                @change="handleSearch"
              >
                <option value="">Todos los estados</option>
                <option value="disponible">✅ Disponible</option>
                <option value="bajo">⚠️ Stock Bajo</option>
                <option value="agotado">❌ Agotado</option>
                <option value="descontinuado">🚫 Descontinuado</option>
              </select>
              <small class="field-help">Filtrar por disponibilidad</small>
            </div>
          </div>

          <!-- Indicadores de Filtros Activos -->
          <div v-if="activeFiltersCount > 0" class="active-filters">
            <span class="filters-label">Filtros Activos ({{ activeFiltersCount }}):</span>
            <div class="filter-tags">
              <span v-if="searchQuery" class="filter-tag">
                🔍 "{{ searchQuery }}"
                <button class="tag-remove" @click="clearMainSearch">✕</button>
              </span>
              <span v-if="filters.code" class="filter-tag">
                🔢 {{ filters.code }}
                <button class="tag-remove" @click="clearFilter('code')">✕</button>
              </span>
              <span v-if="filters.category" class="filter-tag">
                📂 {{ getCategoryText(filters.category) }}
                <button class="tag-remove" @click="clearFilter('category')">✕</button>
              </span>
              <span v-if="filters.stockStatus" class="filter-tag">
                📊 {{ getStockStatusText(filters.stockStatus) }}
                <button class="tag-remove" @click="clearFilter('stockStatus')">✕</button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Estadísticas -->
    <div class="stats-panel">
      <div class="stat-card disponible">
        <div class="stat-content">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-number">{{ statistics.disponible }}</span>
            <span class="stat-label">Disponibles</span>
          </div>
        </div>
      </div>
      <div class="stat-card bajo">
        <div class="stat-content">
          <span class="stat-icon">⚠️</span>
          <div class="stat-info">
            <span class="stat-number">{{ statistics.bajo }}</span>
            <span class="stat-label">Stock Bajo</span>
          </div>
        </div>
      </div>
      <div class="stat-card agotado">
        <div class="stat-content">
          <span class="stat-icon">❌</span>
          <div class="stat-info">
            <span class="stat-number">{{ statistics.agotado }}</span>
            <span class="stat-label">Agotados</span>
          </div>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-content">
          <span class="stat-icon">📦</span>
          <div class="stat-info">
            <span class="stat-number">{{ statistics.total }}</span>
            <span class="stat-label">Total Productos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Resultados -->
    <div class="results-panel">
      <div class="panel-header">
        <h3>
          <span class="section-icon">📋</span>
          Resultados ({{ filteredProducts.length }})
        </h3>
        <div class="panel-actions">
          <div class="view-controls">
            <button 
              class="view-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="setViewMode('grid')"
              title="Vista en cuadrícula"
            >
              <span class="view-icon">⊞</span>
            </button>
            <button 
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              @click="setViewMode('list')"
              title="Vista en lista"
            >
              <span class="view-icon">☰</span>
            </button>
          </div>
          <div class="sort-controls">
            <label>Ordenar por:</label>
            <select v-model="sortBy" class="sort-select" @change="applySorting">
              <option value="name">📝 Nombre</option>
              <option value="code">🔢 Código</option>
              <option value="category">📂 Categoría</option>
              <option value="stock">📊 Stock</option>
              <option value="price">💰 Precio</option>
            </select>
            <button class="sort-direction-btn" @click="toggleSortDirection">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>
      </div>

      <div class="panel-content">
        <!-- Estado de Carga -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Buscando productos...</p>
        </div>

        <!-- Estado Sin Resultados -->
        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>{{ hasActiveFilters ? 'No se encontraron productos' : 'No hay productos disponibles' }}</h3>
          <p v-if="hasActiveFilters">
            Intenta ajustar los filtros de búsqueda para obtener resultados diferentes
          </p>
          <p v-else>
            El catálogo de productos está vacío o aún no se han cargado los datos
          </p>
          <button class="btn-primary" @click="hasActiveFilters ? clearAllFilters() : refreshProducts()">
            {{ hasActiveFilters ? '🔄 Limpiar Filtros' : '🔄 Actualizar Catálogo' }}
          </button>
        </div>

        <!-- Vista en Cuadrícula -->
        <div v-else-if="viewMode === 'grid'" class="products-grid">
          <div 
            v-for="product in paginatedProducts" 
            :key="product.id" 
            class="product-card"
            @click="selectProduct(product)"
          >
            <div class="product-image">
              <img 
                :src="product.image || getDefaultImage(product.category)" 
                :alt="product.name"
                @error="handleImageError"
              />
              <span class="product-category">{{ getCategoryText(product.category) }}</span>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-code">{{ product.code }}</p>
              <p class="product-description">{{ truncateText(product.description, 80) }}</p>
              <div class="product-details">
                <span class="product-price">${{ formatNumber(product.price) }}</span>
                <span :class="['product-stock', `stock-${getStockStatus(product.stock)}`]">
                  <span class="stock-icon">{{ getStockIcon(getStockStatus(product.stock)) }}</span>
                  <span class="stock-text">{{ product.stock }} unidades</span>
                </span>
              </div>
            </div>
            <div class="product-actions">
              <button class="action-btn primary" @click.stop="selectProduct(product)">
                👁️ Ver Detalles
              </button>
            </div>
          </div>
        </div>

        <!-- Vista en Lista -->
        <div v-else class="products-list">
          <div class="list-header">
            <span class="col-image">Imagen</span>
            <span class="col-name">Producto</span>
            <span class="col-code">Código</span>
            <span class="col-category">Categoría</span>
            <span class="col-price">Precio</span>
            <span class="col-stock">Stock</span>
            <span class="col-actions">Acciones</span>
          </div>
          <div 
            v-for="product in paginatedProducts" 
            :key="product.id" 
            class="product-row"
            @click="selectProduct(product)"
          >
            <div class="col-image">
              <img 
                :src="product.image || getDefaultImage(product.category)" 
                :alt="product.name"
                class="product-thumbnail"
                @error="handleImageError"
              />
            </div>
            <div class="col-name">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-description">{{ truncateText(product.description, 50) }}</p>
            </div>
            <div class="col-code">
              <span class="code-text">{{ product.code }}</span>
            </div>
            <div class="col-category">
              <span class="category-badge">{{ getCategoryText(product.category) }}</span>
            </div>
            <div class="col-price">
              <span class="price-text">${{ formatNumber(product.price) }}</span>
            </div>
            <div class="col-stock">
              <span :class="['stock-badge', `stock-${getStockStatus(product.stock)}`]">
                <span class="stock-icon">{{ getStockIcon(getStockStatus(product.stock)) }}</span>
                <span class="stock-text">{{ product.stock }}</span>
              </span>
            </div>
            <div class="col-actions">
              <button class="action-btn compact" @click.stop="selectProduct(product)">
                👁️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination-panel">
      <div class="pagination-info">
        <span>Mostrando {{ startItem }} - {{ endItem }} de {{ filteredProducts.length }} productos</span>
      </div>
      <div class="pagination-controls">
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          ⏮️
        </button>
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ◀️
        </button>
        <span class="page-current">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          ▶️
        </button>
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          ⏭️
        </button>
      </div>
      <div class="items-per-page">
        <label>Mostrar:</label>
        <select v-model="itemsPerPage" class="items-select" @change="changeItemsPerPage">
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="48">48</option>
          <option value="96">96</option>
        </select>
        <span>por página</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductReadView',
  data() {
    return {
      isLoading: false,
      showAdvancedSearch: false,
      searchQuery: '',
      viewMode: 'grid', // 'grid' o 'list'
      
      filters: {
        code: '',
        category: '',
        stockStatus: ''
      },
      
      sortBy: 'name',
      sortDirection: 'asc',
      
      currentPage: 1,
      itemsPerPage: 24,
      
      // Datos de ejemplo (se reemplazarán con datos del backend)
      products: [
        {
          id: 1,
          name: 'Taladro Percutor Profesional 1200W',
          code: 'TLD-1200-PRO',
          description: 'Taladro percutor profesional con sistema SDS-Plus, ideal para trabajos pesados en mampostería y metal.',
          category: 'herramientas',
          price: 450000,
          stock: 15,
          image: null
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
        },
        {
          id: 5,
          name: 'Cable THW 12 AWG - Rollo 100m',
          code: 'CAB-THW-12-100',
          description: 'Cable eléctrico THW calibre 12 AWG, rollo de 100 metros, ideal para instalaciones residenciales.',
          category: 'electricidad',
          price: 180000,
          stock: 0,
          image: null
        },
        {
          id: 6,
          name: 'Tornillos Autorroscantes 1/2" x 8',
          code: 'TOR-AUTO-12X8',
          description: 'Tornillos autorroscantes galvanizados de 1/2 pulgada por 8, caja con 100 unidades.',
          category: 'accesorios',
          price: 25000,
          stock: 200,
          image: null
        },
        {
          id: 7,
          name: 'Soldadora Inverter 200A',
          code: 'SOL-INV-200A',
          description: 'Soldadora inverter profesional de 200 amperios, incluye accesorios y maleta de transporte.',
          category: 'equipos',
          price: 850000,
          stock: 3,
          image: null
        },
        {
          id: 8,
          name: 'Ladrillo Tolete Común',
          code: 'LAD-TOL-COM',
          description: 'Ladrillo tolete común de arcilla cocida, ideal para construcción de muros y paredes.',
          category: 'materiales',
          price: 1200,
          stock: 5000,
          image: null
        }
      ]
    }
  },
  
  computed: {
    filteredProducts() {
      let filtered = [...this.products]
      
      // Filtro por búsqueda principal
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        )
      }
      
      // Filtro por código específico
      if (this.filters.code) {
        filtered = filtered.filter(p => 
          p.code.toLowerCase().includes(this.filters.code.toLowerCase())
        )
      }
      
      // Filtro por categoría
      if (this.filters.category) {
        filtered = filtered.filter(p => p.category === this.filters.category)
      }
      
      // Filtro por estado de stock
      if (this.filters.stockStatus) {
        filtered = filtered.filter(p => {
          const status = this.getStockStatus(p.stock)
          return status === this.filters.stockStatus
        })
      }
      
      // Ordenamiento
      filtered.sort((a, b) => {
        let aValue = a[this.sortBy]
        let bValue = b[this.sortBy]
        
        if (this.sortBy === 'price' || this.sortBy === 'stock') {
          aValue = parseFloat(aValue) || 0
          bValue = parseFloat(bValue) || 0
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return filtered
    },
    
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredProducts.slice(start, end)
    },
    
    statistics() {
      const stats = {
        disponible: 0,
        bajo: 0,
        agotado: 0,
        total: this.products.length
      }
      
      this.products.forEach(p => {
        const status = this.getStockStatus(p.stock)
        if (Object.prototype.hasOwnProperty.call(stats, status)) {
          stats[status]++
        }
      })
      
      return stats
    },
    
    totalProducts() {
      return this.products.length
    },
    
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    },
    
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length)
    },
    
    activeFiltersCount() {
      let count = 0
      if (this.searchQuery) count++
      if (this.filters.code) count++
      if (this.filters.category) count++
      if (this.filters.stockStatus) count++
      return count
    },
    
    hasActiveFilters() {
      return this.activeFiltersCount > 0
    }
  },
  
  methods: {
    handleSearch() {
      this.currentPage = 1
      // Simular delay de búsqueda
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        console.log('🔍 Buscando productos:', this.searchQuery)
      }, 300)
    },
    
    performSearch() {
      this.handleSearch()
      console.log('🔍 Búsqueda manual ejecutada')
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.handleSearch()
    },
    
    clearMainSearch() {
      this.searchQuery = ''
      this.handleSearch()
    },
    
    clearAllFilters() {
      this.searchQuery = ''
      this.filters = {
        code: '',
        category: '',
        stockStatus: ''
      }
      this.currentPage = 1
      console.log('🗑️ Todos los filtros limpiados')
    },
    
    clearFilter(filterName) {
      this.filters[filterName] = ''
      this.handleSearch()
      console.log(`🗑️ Filtro ${filterName} eliminado`)
    },
    
    toggleSearchPanel() {
      this.showAdvancedSearch = !this.showAdvancedSearch
    },
    
    setViewMode(mode) {
      this.viewMode = mode
      console.log(`👁️ Vista cambiada a: ${mode}`)
    },
    
    applySorting() {
      console.log(`📊 Ordenando por ${this.sortBy} (${this.sortDirection})`)
    },
    
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      this.applySorting()
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        console.log(`📄 Navegando a página ${page}`)
      }
    },
    
    changeItemsPerPage() {
      this.currentPage = 1
      console.log(`📋 Mostrando ${this.itemsPerPage} elementos por página`)
    },
    
    selectProduct(product) {
      console.log('👁️ Seleccionando producto:', product.name)
      // Navegar a la vista de detalles del producto
      this.$router.push(`/dashboard/products/detail/${product.id}`)
    },
    
    refreshProducts() {
      this.isLoading = true
      console.log('🔄 Actualizando catálogo de productos...')
      
      // Simular carga
      setTimeout(() => {
        this.isLoading = false
        console.log('✅ Catálogo actualizado')
      }, 1000)
    },
    
    // Funciones auxiliares
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
    
    getCategoryText(category) {
      const texts = {
        herramientas: 'Herramientas',
        materiales: 'Materiales',
        equipos: 'Equipos',
        accesorios: 'Accesorios',
        electricidad: 'Electricidad',
        plomeria: 'Plomería'
      }
      return texts[category] || category
    },
    
    getStockStatusText(status) {
      const texts = {
        disponible: 'Disponible',
        bajo: 'Stock Bajo',
        agotado: 'Agotado',
        descontinuado: 'Descontinuado'
      }
      return texts[status] || status
    },
    
    getDefaultImage(category) {
      // Retorna una imagen por defecto según la categoría
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
    },
    
    truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    
    formatNumber(number) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(number || 0)
    },
    
    async fetchProductsFromBackend() {
      this.isLoading = true
      try {
        console.log('🔄 Cargando productos desde el backend...')
        
        // TODO: Implementar cuando el backend esté listo
        // const axios = await import('@/services/axios')
        // const response = await axios.get('/products/', {
        //   params: {
        //     search: this.searchQuery,
        //     category: this.filters.category,
        //     stock_status: this.filters.stockStatus
        //   }
        // })
        // this.products = response.data
        
        console.log('✅ Productos cargados exitosamente')
      } catch (error) {
        console.error('❌ Error cargando productos:', error)
      } finally {
        this.isLoading = false
      }
    }
  },
  
  mounted() {
    console.log('📍 ProductReadView montado correctamente')
    // this.fetchProductsFromBackend()
  },
  
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
.product-read-workspace {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* Header */
.product-header {
  background: #003366;
  color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.title-icon {
  font-size: 2.5rem;
}

.subtitle {
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
  opacity: 0.9;
  color: white;
}

.stats-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.badge-number {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Panel Base */
.search-panel,
.results-panel {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.panel-header {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 0.75rem 0.75rem 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.5rem;
}

/* Botones */
.btn-clear,
.btn-toggle,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.btn-clear {
  background: white;
  color: #e74c3c;
  border: 1px solid #e2e8f0;
}

.btn-toggle {
  background: white;
  color: #3498db;
  border: 1px solid #e2e8f0;
}

.btn-primary {
  background: #003366;
  color: white;
}

.search-actions {
  display: flex;
  gap: 1rem;
}

/* Búsqueda */
.search-content {
  padding: 2rem;
}

.main-search {
  margin-bottom: 2rem;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-field label {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-icon {
  font-size: 1.2rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input,
.filter-input,
.filter-select {
  flex: 1;
  padding: 0.75rem 3.5rem 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus,
.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #003366;
  box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
}

.search-button {
  position: absolute;
  right: 0.5rem;
  padding: 0.6rem;
  background: #003366;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background: #004080;
  transform: scale(1.05);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: white;
}

.field-help {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Filtros Avanzados */
.advanced-filters {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-field label {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.filter-input,
.filter-select {
  padding: 0.75rem 1rem;
}

/* Filtros Activos */
.active-filters {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.filters-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: block;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  background: #003366;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-remove {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: background 0.3s ease;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Estadísticas */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.disponible {
  border-left: 4px solid #27ae60;
}

.stat-card.bajo {
  border-left: 4px solid #f39c12;
}

.stat-card.agotado {
  border-left: 4px solid #e74c3c;
}

.stat-card.total {
  border-left: 4px solid #003366;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

/* Panel de Resultados */
.panel-content {
  padding: 2rem;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: #003366;
  color: white;
  border-color: #003366;
}

.view-icon {
  font-size: 1rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}

.sort-direction-btn {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  font-size: 1rem;
}

/* Estados */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #003366;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

/* Vista en Cuadrícula */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 180px;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-category {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 51, 102, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.product-code {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.5rem;
  font-family: monospace;
}

.product-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0 0 1rem;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #27ae60;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.stock-disponible {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.stock-bajo {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.stock-agotado {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.product-actions {
  padding: 0 1rem 1rem;
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #003366;
  color: white;
}

.action-btn.primary:hover {
  background: #004080;
  transform: translateY(-1px);
}

.action-btn.compact {
  width: auto;
  padding: 0.5rem;
  min-width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Vista en Lista */
.products-list {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 100px 80px 100px;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(145deg, #f1f3f4, #e8eaed);
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
}

.product-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 100px 80px 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.product-row:hover {
  background: #f8f9fa;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.375rem;
  background: #f8f9fa;
}

.col-name .product-name {
  font-size: 0.9rem;
  margin: 0 0 0.25rem;
}

.col-name .product-description {
  font-size: 0.8rem;
  margin: 0;
}

.code-text {
  font-family: monospace;
  font-size: 0.875rem;
  color: #64748b;
}

.category-badge {
  background: #f8f9fa;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  border: 1px solid #e2e8f0;
}

.price-text {
  font-weight: 600;
  color: #27ae60;
}

.stock-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  justify-content: center;
}

/* Paginación */
.pagination-panel {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e2e8f0;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #003366;
  color: white;
  border-color: #003366;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-current {
  font-weight: 600;
  color: #2c3e50;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.items-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .panel-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-panel {
    flex-direction: column;
    gap: 1rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header,
  .product-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .list-header {
    display: none;
  }
  
  .product-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }
}
</style>