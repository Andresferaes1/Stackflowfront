<template>
  <div class="quotation-history-workspace">
    <!-- Header Principal -->
    <div class="history-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-icon">📋</span>
            Historial de Cotizaciones
          </h1>
          <p class="subtitle">Consulta y gestiona todas las cotizaciones creadas en el sistema</p>
        </div>
        <div class="stats-badge">
          <span class="badge-label">Total:</span>
          <span class="badge-number">{{ totalQuotations }}</span>
        </div>
      </div>
    </div>

    <!-- Panel de Filtros Avanzados -->
    <div class="filters-panel">
      <div class="panel-header">
        <h3><span class="section-icon">🔍</span>Filtros de Búsqueda</h3>
        <div class="filter-actions">
          <button class="btn-clear" @click="clearAllFilters">
            <span class="btn-icon">🗑️</span>
            Limpiar Filtros
          </button>
          <button class="btn-toggle" @click="toggleFiltersPanel">
            <span class="btn-icon">{{ showFilters ? '🔼' : '🔽' }}</span>
            {{ showFilters ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
      </div>
      
      <div v-show="showFilters" class="filters-content">
        <!-- Búsqueda Rápida -->
        <div class="quick-search">
          <div class="search-field">
            <label for="quickSearch">
              <span class="field-icon">🔍</span>
              Búsqueda Rápida
            </label>
            <input
              id="quickSearch"
              v-model="filters.quickSearch"
              type="text"
              placeholder="Buscar por número, cliente o cualquier término..."
              class="search-input"
              @input="applyFilters"
            />
            <small class="field-help">Busca en número de cotización, nombre del cliente o contenido general</small>
          </div>
        </div>

        <!-- Filtros Específicos -->
        <div class="specific-filters">
          <div class="filter-row">
            <div class="filter-field">
              <label for="quotationNumber">
                <span class="field-icon">🔢</span>
                Número de Cotización
              </label>
              <input
                id="quotationNumber"
                v-model="filters.quotationNumber"
                type="text"
                placeholder="Ej: COT-2024-001"
                class="filter-input"
                @input="applyFilters"
              />
              <small class="field-help">Número específico de cotización</small>
            </div>

            <div class="filter-field">
              <label for="clientName">
                <span class="field-icon">👤</span>
                Cliente
              </label>
              <input
                id="clientName"
                v-model="filters.clientName"
                type="text"
                placeholder="Nombre o razón social del cliente"
                class="filter-input"
                @input="applyFilters"
              />
              <small class="field-help">Nombre o razón social del cliente</small>
            </div>

            <div class="filter-field">
              <label for="status">
                <span class="field-icon">📊</span>
                Estado
              </label>
              <select
                id="status"
                v-model="filters.status"
                class="filter-select"
                @change="applyFilters"
              >
                <option value="">Todos los estados</option>
                <option value="borrador">📝 Borrador</option>
                <option value="enviada">📤 Enviada</option>
                <option value="aprobada">✅ Aprobada</option>
                <option value="facturada">🧾 Facturada</option>
                <option value="rechazada">❌ Rechazada</option>
                <option value="vencida">⏰ Vencida</option>
              </select>
              <small class="field-help">Filtra por estado de la cotización</small>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-field">
              <label for="dateFrom">
                <span class="field-icon">📅</span>
                Fecha Desde
              </label>
              <input
                id="dateFrom"
                v-model="filters.dateFrom"
                type="date"
                class="filter-input"
                @change="applyFilters"
              />
              <small class="field-help">Fecha inicial del periodo</small>
            </div>

            <div class="filter-field">
              <label for="dateTo">
                <span class="field-icon">📅</span>
                Fecha Hasta
              </label>
              <input
                id="dateTo"
                v-model="filters.dateTo"
                type="date"
                class="filter-input"
                @change="applyFilters"
              />
              <small class="field-help">Fecha final del periodo</small>
            </div>

            <div class="filter-field">
              <label for="amountRange">
                <span class="field-icon">💰</span>
                Rango de Monto
              </label>
              <select
                id="amountRange"
                v-model="filters.amountRange"
                class="filter-select"
                @change="applyFilters"
              >
                <option value="">Todos los montos</option>
                <option value="0-100000">💵 Hasta $100,000</option>
                <option value="100000-500000">💰 $100,000 - $500,000</option>
                <option value="500000-1000000">💸 $500,000 - $1,000,000</option>
                <option value="1000000+">💎 Más de $1,000,000</option>
              </select>
              <small class="field-help">Filtra por rango de valor total</small>
            </div>
          </div>
        </div>

        <!-- Indicadores de Filtros Activos -->
        <div v-if="activeFiltersCount > 0" class="active-filters">
          <span class="filters-label">Filtros Activos ({{ activeFiltersCount }}):</span>
          <div class="filter-tags">
            <span v-if="filters.quickSearch" class="filter-tag">
              🔍 "{{ filters.quickSearch }}"
              <button class="tag-remove" @click="clearFilter('quickSearch')">✕</button>
            </span>
            <span v-if="filters.quotationNumber" class="filter-tag">
              🔢 {{ filters.quotationNumber }}
              <button class="tag-remove" @click="clearFilter('quotationNumber')">✕</button>
            </span>
            <span v-if="filters.clientName" class="filter-tag">
              👤 {{ filters.clientName }}
              <button class="tag-remove" @click="clearFilter('clientName')">✕</button>
            </span>
            <span v-if="filters.status" class="filter-tag">
              📊 {{ getStatusText(filters.status) }}
              <button class="tag-remove" @click="clearFilter('status')">✕</button>
            </span>
            <span v-if="filters.dateFrom || filters.dateTo" class="filter-tag">
              📅 {{ formatDateRange() }}
              <button class="tag-remove" @click="clearDateFilters">✕</button>
            </span>
            <span v-if="filters.amountRange" class="filter-tag">
              💰 {{ getAmountRangeText(filters.amountRange) }}
              <button class="tag-remove" @click="clearFilter('amountRange')">✕</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Estadísticas -->
    <div class="stats-panel">
      <div class="stat-card borrador">
        <div class="stat-content">
          <span class="stat-icon">📝</span>
          <div class="stat-info">
            <span class="stat-number">{{ statistics.borrador }}</span>
            <span class="stat-label">Borradores</span>
          </div>
        </div>
      </div>
      <div class="stat-card enviada">
        <div class="stat-content">
          <span class="stat-icon">📤</span>
          <div class="stat-info">
            <span class="stat-number">{{ statistics.enviada }}</span>
            <span class="stat-label">Enviadas</span>
          </div>
        </div>
      </div>
      <div class="stat-card aprobada">
        <div class="stat-content">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-number">{{ statistics.aprobada }}</span>
            <span class="stat-label">Aprobadas</span>
          </div>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-content">
          <span class="stat-icon">💰</span>
          <div class="stat-info">
            <span class="stat-number">${{ formatNumber(statistics.totalValue) }}</span>
            <span class="stat-label">Valor Total</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Resultados -->
    <div class="results-panel">
      <div class="panel-header">
        <h3>
          <span class="section-icon">📊</span>
          Resultados ({{ filteredQuotations.length }})
        </h3>
        <div class="panel-actions">
          <div class="sort-controls">
            <label>Ordenar por:</label>
            <select v-model="sortBy" class="sort-select" @change="applySorting">
              <option value="created_at">📅 Fecha de Creación</option>
              <option value="quotation_number">🔢 Número</option>
              <option value="client_name">👤 Cliente</option>
              <option value="total">💰 Monto</option>
              <option value="status">📊 Estado</option>
            </select>
            <button class="sort-direction-btn" @click="toggleSortDirection">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
          <button class="btn-new-quotation" @click="createNewQuotation">
            <span class="btn-icon">➕</span>
            Nueva Cotización
          </button>
        </div>
      </div>

      <div class="panel-content">
        <!-- Estado de Carga -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando cotizaciones...</p>
        </div>

        <!-- Estado Sin Resultados -->
        <div v-else-if="filteredQuotations.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>{{ hasActiveFilters ? 'No se encontraron resultados' : 'No hay cotizaciones creadas' }}</h3>
          <p v-if="hasActiveFilters">
            Intenta ajustar los filtros de búsqueda para obtener resultados diferentes
          </p>
          <p v-else>
            Crea tu primera cotización para comenzar a gestionar tus ventas
          </p>
          <button class="btn-primary" @click="hasActiveFilters ? clearAllFilters() : createNewQuotation()">
            {{ hasActiveFilters ? '🔄 Limpiar Filtros' : '➕ Crear Primera Cotización' }}
          </button>
        </div>

        <!-- Tabla de Cotizaciones -->
        <div v-else class="quotations-table-wrapper">
          <table class="quotations-table">
            <thead>
              <tr>
                <th class="col-number">Número</th>
                <th class="col-client">Cliente</th>
                <th class="col-date">Fecha</th>
                <th class="col-amount">Monto</th>
                <th class="col-status">Estado</th>
                <th class="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quotation in paginatedQuotations" :key="quotation.id" class="quotation-row">
                <td class="col-number">
                  <div class="quotation-number">
                    <span class="number-text">{{ quotation.quotation_number || `COT-${String(quotation.id).padStart(3, '0')}` }}</span>
                    <span class="number-id">#{{ quotation.id }}</span>
                  </div>
                </td>
                <td class="col-client">
                  <div class="client-info">
                    <span class="client-name">{{ quotation.client_name }}</span>
                    <span v-if="quotation.client_email" class="client-email">{{ quotation.client_email }}</span>
                  </div>
                </td>
                <td class="col-date">
                  <div class="date-info">
                    <span class="date-created">{{ formatDate(quotation.created_at) }}</span>
                    <span class="date-relative">{{ getRelativeTime(quotation.created_at) }}</span>
                  </div>
                </td>
                <td class="col-amount">
                  <div class="amount-info">
                    <span class="amount-value">${{ formatNumber(quotation.total) }}</span>
                  </div>
                </td>
                <td class="col-status">
                  <span :class="['status-badge', `status-${quotation.status}`]">
                    <span class="status-icon">{{ getStatusIcon(quotation.status) }}</span>
                    <span class="status-text">{{ getStatusText(quotation.status) }}</span>
                  </span>
                </td>
                <td class="col-actions">
                  <div class="action-buttons">
                    <button 
                      class="action-btn view-btn"
                      title="Ver detalles completos"
                      @click="viewQuotationDetails(quotation)"
                    >
                      👁️
                    </button>
                    <button 
                      class="action-btn edit-btn"
                      :disabled="!canEditQuotation(quotation)"
                      :title="getEditTooltip(quotation)"
                      @click="editQuotation(quotation)"
                    >
                      ✏️
                    </button>
                    <button 
                      class="action-btn duplicate-btn"
                      title="Crear una copia de esta cotización"
                      @click="duplicateQuotation(quotation)"
                    >
                      📋
                    </button>
                    <button 
                      class="action-btn delete-btn"
                      :disabled="!canDeleteQuotation(quotation)"
                      :title="getDeleteTooltip(quotation)"
                      @click="deleteQuotation(quotation)"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination-panel">
      <div class="pagination-info">
        <span>Mostrando {{ startItem }} - {{ endItem }} de {{ filteredQuotations.length }} cotizaciones</span>
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
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>por página</span>
      </div>
    </div>

    <!-- Modal de Confirmación para Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>⚠️ Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar la cotización <strong>{{ quotationToDelete?.quotation_number }}</strong>?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelDelete">Cancelar</button>
          <button class="btn-danger" @click="confirmDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuotationHistoryView',
  data() {
    return {
      isLoading: false,
      showFilters: true,
      showDeleteModal: false,
      quotationToDelete: null,
      
      filters: {
        quickSearch: '',
        quotationNumber: '',
        clientName: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        amountRange: ''
      },
      
      sortBy: 'created_at',
      sortDirection: 'desc',
      
      currentPage: 1,
      itemsPerPage: 25,
      
      quotations: [
        {
          id: 1,
          quotation_number: 'COT-2024-001',
          client_name: 'Empresa ABC S.A.S.',
          client_email: 'contacto@empresaabc.com',
          total: 2500000,
          status: 'aprobada',
          created_at: '2024-01-15T10:30:00Z',
          items_count: 5
        },
        {
          id: 2,
          quotation_number: 'COT-2024-002',
          client_name: 'Comercializadora XYZ Ltda.',
          client_email: 'ventas@xyz.com',
          total: 850000,
          status: 'enviada',
          created_at: '2024-01-20T14:15:00Z',
          items_count: 3
        },
        {
          id: 3,
          quotation_number: 'COT-2024-003',
          client_name: 'Industrias DEF',
          client_email: 'compras@def.com',
          total: 1200000,
          status: 'borrador',
          created_at: '2024-01-22T09:45:00Z',
          items_count: 8
        },
        {
          id: 4,
          quotation_number: 'COT-2024-004',
          client_name: 'Servicios GHI',
          client_email: 'admin@ghi.com',
          total: 450000,
          status: 'rechazada',
          created_at: '2024-01-25T16:20:00Z',
          items_count: 2
        },
        {
          id: 5,
          quotation_number: 'COT-2024-005',
          client_name: 'Tecnología JKL',
          client_email: 'info@jkl.com',
          total: 3200000,
          status: 'facturada',
          created_at: '2024-01-28T11:10:00Z',
          items_count: 12
        }
      ]
    }
  },
  
  computed: {
    filteredQuotations() {
      let filtered = [...this.quotations]
      
      if (this.filters.quickSearch) {
        const query = this.filters.quickSearch.toLowerCase()
        filtered = filtered.filter(q => 
          q.quotation_number.toLowerCase().includes(query) ||
          q.client_name.toLowerCase().includes(query) ||
          q.client_email.toLowerCase().includes(query)
        )
      }
      
      if (this.filters.quotationNumber) {
        filtered = filtered.filter(q => 
          q.quotation_number.toLowerCase().includes(this.filters.quotationNumber.toLowerCase())
        )
      }
      
      if (this.filters.clientName) {
        filtered = filtered.filter(q => 
          q.client_name.toLowerCase().includes(this.filters.clientName.toLowerCase())
        )
      }
      
      if (this.filters.status) {
        filtered = filtered.filter(q => q.status === this.filters.status)
      }
      
      if (this.filters.dateFrom) {
        filtered = filtered.filter(q => 
          new Date(q.created_at) >= new Date(this.filters.dateFrom)
        )
      }
      
      if (this.filters.dateTo) {
        const dateTo = new Date(this.filters.dateTo)
        dateTo.setHours(23, 59, 59, 999)
        filtered = filtered.filter(q => 
          new Date(q.created_at) <= dateTo
        )
      }
      
      if (this.filters.amountRange) {
        filtered = this.filterByAmountRange(filtered, this.filters.amountRange)
      }
      
      filtered.sort((a, b) => {
        let aValue = a[this.sortBy]
        let bValue = b[this.sortBy]
        
        if (this.sortBy === 'total') {
          aValue = parseFloat(aValue) || 0
          bValue = parseFloat(bValue) || 0
        } else if (this.sortBy === 'created_at') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
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
    
    paginatedQuotations() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredQuotations.slice(start, end)
    },
    
    statistics() {
      const stats = {
        borrador: 0,
        enviada: 0,
        aprobada: 0,
        facturada: 0,
        rechazada: 0,
        totalValue: 0
      }
      
      this.quotations.forEach(q => {
        // ✅ CORRECCIÓN ESLint: Usar Object.prototype.hasOwnProperty.call()
        if (Object.prototype.hasOwnProperty.call(stats, q.status)) {
          stats[q.status]++
        }
        stats.totalValue += parseFloat(q.total) || 0
      })
      
      return stats
    },
    
    totalQuotations() {
      return this.quotations.length
    },
    
    totalPages() {
      return Math.ceil(this.filteredQuotations.length / this.itemsPerPage)
    },
    
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredQuotations.length)
    },
    
    activeFiltersCount() {
      return Object.values(this.filters).filter(value => value.trim() !== '').length
    },
    
    hasActiveFilters() {
      return this.activeFiltersCount > 0
    }
  },
  
  methods: {
    applyFilters() {
      this.currentPage = 1
      console.log('🔍 Aplicando filtros:', this.filters)
    },
    
    clearAllFilters() {
      this.filters = {
        quickSearch: '',
        quotationNumber: '',
        clientName: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        amountRange: ''
      }
      this.currentPage = 1
      console.log('🗑️ Filtros limpiados')
    },
    
    clearFilter(filterName) {
      this.filters[filterName] = ''
      this.applyFilters()
      console.log(`🗑️ Filtro ${filterName} eliminado`)
    },
    
    clearDateFilters() {
      this.filters.dateFrom = ''
      this.filters.dateTo = ''
      this.applyFilters()
    },
    
    toggleFiltersPanel() {
      this.showFilters = !this.showFilters
    },
    
    filterByAmountRange(quotations, range) {
      const [min, max] = this.parseAmountRange(range)
      return quotations.filter(q => {
        const amount = parseFloat(q.total) || 0
        return amount >= min && (max === null || amount <= max)
      })
    },
    
    parseAmountRange(range) {
      switch (range) {
        case '0-100000':
          return [0, 100000]
        case '100000-500000':
          return [100000, 500000]
        case '500000-1000000':
          return [500000, 1000000]
        case '1000000+':
          return [1000000, null]
        default:
          return [0, null]
      }
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
    
    viewQuotationDetails(quotation) {
      console.log('👁️ Ver detalles:', quotation.quotation_number)
      alert(`Ver detalles de ${quotation.quotation_number}\n\nCliente: ${quotation.client_name}\nMonto: $${this.formatNumber(quotation.total)}\nEstado: ${this.getStatusText(quotation.status)}`)
    },
    
    // ✅ NAVEGACIÓN CORREGIDA - CREAR NUEVA COTIZACIÓN
    createNewQuotation() {
      console.log('🚀 Navegando a crear nueva cotización...')
      try {
        // Usar exactamente la misma navegación que funciona en otras vistas
        this.$router.push({ name: 'quotation-create' })
      } catch (error) {
        console.error('❌ Error navegando a cotización nueva:', error)
        // Fallback: usar ruta completa
        window.location.href = '/dashboard/cotizacion/nueva'
      }
    },
    
    // ✅ NAVEGACIÓN CORREGIDA - EDITAR COTIZACIÓN
    editQuotation(quotation) {
      if (!this.canEditQuotation(quotation)) {
        alert('No se puede editar esta cotización porque ya ha sido facturada o está en un estado no editable.')
        return
      }
      
      console.log('✏️ Editando cotización:', quotation.quotation_number)
      try {
        // Usar exactamente la misma navegación que funciona en otras vistas
        this.$router.push({
          name: 'quotation-create',
          query: { edit: quotation.id }
        })
      } catch (error) {
        console.error('❌ Error navegando a editar cotización:', error)
        // Fallback: usar ruta completa
        window.location.href = `/dashboard/cotizacion/nueva?edit=${quotation.id}`
      }
    },
    
    // ✅ NAVEGACIÓN CORREGIDA - DUPLICAR COTIZACIÓN
    duplicateQuotation(quotation) {
      console.log('📋 Duplicando cotización:', quotation.quotation_number)
      try {
        // Usar exactamente la misma navegación que funciona en otras vistas
        this.$router.push({
          name: 'quotation-create',
          query: { duplicate: quotation.id }
        })
      } catch (error) {
        console.error('❌ Error navegando a duplicar cotización:', error)
        // Fallback: usar ruta completa
        window.location.href = `/dashboard/cotizacion/nueva?duplicate=${quotation.id}`
      }
    },
    
    deleteQuotation(quotation) {
      if (!this.canDeleteQuotation(quotation)) {
        alert('No se puede eliminar esta cotización porque ya ha sido facturada.')
        return
      }
      
      this.quotationToDelete = quotation
      this.showDeleteModal = true
    },
    
    confirmDelete() {
      if (this.quotationToDelete) {
        console.log('🗑️ Eliminando:', this.quotationToDelete.quotation_number)
        
        const index = this.quotations.findIndex(q => q.id === this.quotationToDelete.id)
        if (index > -1) {
          this.quotations.splice(index, 1)
          console.log('✅ Cotización eliminada exitosamente')
        }
        
        this.cancelDelete()
      }
    },
    
    cancelDelete() {
      this.showDeleteModal = false
      this.quotationToDelete = null
    },
    
    canEditQuotation(quotation) {
      return !['facturada', 'aprobada'].includes(quotation.status)
    },
    
    canDeleteQuotation(quotation) {
      return !['facturada'].includes(quotation.status)
    },
    
    getEditTooltip(quotation) {
      if (this.canEditQuotation(quotation)) {
        return 'Editar esta cotización'
      }
      return 'No se puede editar: cotización ya facturada o aprobada'
    },
    
    getDeleteTooltip(quotation) {
      if (this.canDeleteQuotation(quotation)) {
        return 'Eliminar esta cotización'
      }
      return 'No se puede eliminar: cotización ya facturada'
    },
    
    formatNumber(number) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(number || 0)
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return dateString
      }
    },
    
    getRelativeTime(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) return 'Hace 1 día'
        if (diffDays < 7) return `Hace ${diffDays} días`
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
        if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
        return `Hace ${Math.floor(diffDays / 365)} años`
      } catch {
        return ''
      }
    },
    
    formatDateRange() {
      if (this.filters.dateFrom && this.filters.dateTo) {
        return `${this.formatDate(this.filters.dateFrom)} - ${this.formatDate(this.filters.dateTo)}`
      } else if (this.filters.dateFrom) {
        return `Desde ${this.formatDate(this.filters.dateFrom)}`
      } else if (this.filters.dateTo) {
        return `Hasta ${this.formatDate(this.filters.dateTo)}`
      }
      return ''
    },
    
    getStatusIcon(status) {
      const icons = {
        borrador: '📝',
        enviada: '📤',
        aprobada: '✅',
        facturada: '🧾',
        rechazada: '❌',
        vencida: '⏰'
      }
      return icons[status] || '❓'
    },
    
    getStatusText(status) {
      const texts = {
        borrador: 'Borrador',
        enviada: 'Enviada',
        aprobada: 'Aprobada',
        facturada: 'Facturada',
        rechazada: 'Rechazada',
        vencida: 'Vencida'
      }
      return texts[status] || status
    },
    
    getAmountRangeText(range) {
      const texts = {
        '0-100000': 'Hasta $100,000',
        '100000-500000': '$100,000 - $500,000',
        '500000-1000000': '$500,000 - $1,000,000',
        '1000000+': 'Más de $1,000,000'
      }
      return texts[range] || range
    },
    
    async loadQuotationsFromBackend() {
      this.isLoading = true
      try {
        console.log('🔄 Cargando cotizaciones...')
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // TODO: Aquí irá la llamada real al backend cuando esté listo
        // const axios = await import('@/services/axios')
        // const response = await axios.get('/quotations/')
        // this.quotations = response.data
        
        console.log('✅ Cotizaciones cargadas exitosamente')
      } catch (error) {
        console.error('❌ Error cargando cotizaciones:', error)
      } finally {
        this.isLoading = false
      }
    }
  },
  
  // ✅ DEBUG: Agregar logs para verificar funcionamiento
  mounted() {
    console.log('📍 QuotationHistoryView montado correctamente')
    console.log('📍 Ruta actual:', this.$route.path)
    console.log('📍 Router disponible:', !!this.$router)
    console.log('📍 Rutas del router:', this.$router.getRoutes().map(r => r.name))
  },
  
  async created() {
    await this.loadQuotationsFromBackend()
  }
}
</script>

<style scoped>
.quotation-history-workspace {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* Header */
.history-header {
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
.filters-panel,
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

/* Botones */
.btn-clear,
.btn-toggle,
.btn-primary,
.btn-secondary,
.btn-danger,
.btn-new-quotation {
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

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-new-quotation {
  background: #27ae60;
  color: white;
}

.filter-actions {
  display: flex;
  gap: 1rem;
}

/* Filtros */
.filters-content {
  padding: 2rem;
}

.quick-search {
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

.search-input,
.filter-input,
.filter-select {
  padding: 0.75rem 1rem;
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

.field-help {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.specific-filters {
  margin-bottom: 2rem;
}

.filter-row {
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

.stat-card.borrador {
  border-left: 4px solid #f39c12;
}

.stat-card.enviada {
  border-left: 4px solid #3498db;
}

.stat-card.aprobada {
  border-left: 4px solid #27ae60;
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
  gap: 1rem;
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

/* Tabla */
.quotations-table-wrapper {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.quotations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.quotations-table th {
  background: linear-gradient(145deg, #f1f3f4, #e8eaed);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.875rem;
}

.quotations-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.quotation-row:hover {
  background: #f8f9fa;
}

/* Celdas */
.quotation-number {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.number-text {
  font-weight: 600;
  color: #003366;
}

.number-id {
  font-size: 0.8rem;
  color: #64748b;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.client-name {
  font-weight: 600;
  color: #2c3e50;
}

.client-email {
  font-size: 0.8rem;
  color: #64748b;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-created {
  font-weight: 500;
  color: #2c3e50;
}

.date-relative {
  font-size: 0.8rem;
  color: #64748b;
}

.amount-value {
  font-weight: 700;
  color: #27ae60;
  font-size: 1rem;
}

/* Status */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-borrador {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid #f39c12;
}

.status-enviada {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid #3498db;
}

.status-aprobada {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 1px solid #27ae60;
}

.status-facturada {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
  border: 1px solid #9b59b6;
}

.status-rechazada {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

/* Acciones */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.view-btn {
  background: #3498db;
  color: white;
}

.edit-btn {
  background: #f39c12;
  color: white;
}

.duplicate-btn {
  background: #9b59b6;
  color: white;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-body {
  padding: 2rem;
}

.warning-text {
  color: #e74c3c;
  font-weight: 500;
  margin-top: 1rem;
}

.modal-actions {
  padding: 1rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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
  
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .stats-panel {
    grid-template-columns: 1fr;
  }
  
  .panel-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-panel {
    flex-direction: column;
    gap: 1rem;
  }
  
  .quotations-table {
    font-size: 0.8rem;
  }
  
  .quotations-table th,
  .quotations-table td {
    padding: 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>