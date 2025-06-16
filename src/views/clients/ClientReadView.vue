<template>
  <div class="client-read-workspace">
    <!-- Header Principal -->
    <div class="client-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-icon">🏢</span>
            Gestión de Clientes
          </h1>
          <p class="subtitle">Busca, consulta y administra todos los clientes registrados en tiempo real</p>
        </div>
        <div class="stats-badge">
          <span class="badge-label">Total:</span>
          <span class="badge-number">{{ totalClients }}</span>
        </div>
      </div>
    </div>

    <!-- Panel de Búsqueda -->
    <div class="search-panel">
      <div class="panel-header">
        <h3><span class="section-icon">🔍</span>Búsqueda de Clientes</h3>
        <div class="search-actions">
          <button class="btn-clear" @click="clearSearch" v-if="searchQuery">
            <span class="btn-icon">🗑️</span>
            Limpiar
          </button>
          <button class="btn-add" @click="goToCreateClient">
            <span class="btn-icon">➕</span>
            Nuevo Cliente
          </button>
        </div>
      </div>
      
      <div class="search-content">
        <div class="unified-search">
          <div class="search-field">
            <label for="clientSearch">
              <span class="field-icon">🔍</span>
              Búsqueda Inteligente
            </label>
            <div class="search-input-wrapper">
              <input
                id="clientSearch"
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre de empresa, NIT, representante legal, email o teléfono..."
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
            <small class="field-help">
              Escribe cualquier información del cliente: razón social, NIT, nombre del representante, email o teléfono
            </small>
          </div>

          <!-- Filtros Rápidos -->
          <div class="quick-filters">
            <button 
              v-for="status in quickStatusFilters" 
              :key="status.value"
              :class="['quick-filter-btn', { active: filters.status === status.value }]"
              @click="setQuickFilter(status.value)"
            >
              <span class="filter-icon">{{ status.icon }}</span>
              <span class="filter-label">{{ status.label }}</span>
              <span class="filter-count">({{ getStatusCount(status.value) }})</span>
            </button>
          </div>

          <!-- Indicador de búsqueda activa -->
          <div v-if="searchQuery || filters.status" class="search-indicator">
            <span class="indicator-text">
              {{ searchQuery ? `Buscando: "${searchQuery}"` : `Filtrando por: ${getStatusText(filters.status)}` }}
            </span>
            <span class="results-count">{{ filteredClients.length }} resultados</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Resultados -->
    <div class="results-panel">
      <div class="panel-header">
        <h3>
          <span class="section-icon">📋</span>
          {{ searchQuery || filters.status ? 'Resultados de Búsqueda' : 'Todos los Clientes' }} 
          ({{ filteredClients.length }})
        </h3>
        <div class="panel-actions">
          <div class="sort-controls">
            <label>Ordenar por:</label>
            <select v-model="sortBy" class="sort-select" @change="applySorting">
              <option value="name">🏢 Razón Social</option>
              <option value="nit">🆔 NIT</option>
              <option value="legalRepresentative">👤 Representante</option>
              <option value="status">📊 Estado</option>
              <option value="created_at">📅 Fecha Registro</option>
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
          <p>Buscando clientes...</p>
        </div>

        <!-- Estado Sin Resultados -->
        <div v-else-if="filteredClients.length === 0" class="empty-state">
          <div class="empty-icon">🏢</div>
          <h3>{{ hasActiveSearch ? 'No se encontraron clientes' : 'No hay clientes registrados' }}</h3>
          <p v-if="hasActiveSearch">
            No hay clientes que coincidan con la búsqueda "{{ searchQuery }}"
          </p>
          <p v-else>
            El directorio de clientes está vacío. Comienza registrando tu primer cliente.
          </p>
          <button class="btn-primary" @click="hasActiveSearch ? clearSearch() : goToCreateClient()">
            {{ hasActiveSearch ? '🔄 Limpiar Búsqueda' : '➕ Crear Primer Cliente' }}
          </button>
        </div>

        <!-- Lista de Clientes con Detalles Completos -->
        <div v-else class="clients-detailed-list">
          <div 
            v-for="client in paginatedClients" 
            :key="client.id" 
            class="client-detailed-card"
          >
            <!-- Header del Cliente -->
            <div class="client-card-header">
              <div class="client-main-info">
                <div class="client-avatar">
                  <span class="avatar-text">{{ getInitials(client.name) }}</span>
                </div>
                <div class="client-basic-info">
                  <h3 class="client-company-name">{{ client.name }}</h3>
                  <p class="client-representative">
                    <span class="rep-icon">👤</span>
                    {{ client.legalRepresentative }}
                  </p>
                  <p class="client-nit">
                    <span class="nit-icon">🆔</span>
                    NIT: {{ client.nit }}
                  </p>
                </div>
              </div>
              <div class="client-status-actions">
                <div :class="['client-status-badge', `status-${client.status}`]">
                  <span class="status-icon">{{ getStatusIcon(client.status) }}</span>
                  <span class="status-text">{{ getStatusText(client.status) }}</span>
                </div>
                <div class="client-actions-menu">
                  <button 
                    class="action-btn primary"
                    @click="toggleClientDetails(client.id)"
                    :title="expandedClients.includes(client.id) ? 'Ocultar detalles' : 'Ver detalles'"
                  >
                    <span class="action-icon">{{ expandedClients.includes(client.id) ? '👁️‍🗨️' : '👁️' }}</span>
                    {{ expandedClients.includes(client.id) ? 'Ocultar' : 'Ver Más' }}
                  </button>
                  <button 
                    class="action-btn secondary"
                    @click="editClient(client)"
                    title="Editar cliente"
                  >
                    <span class="action-icon">✏️</span>
                    Editar
                  </button>
                  <button 
                    class="action-btn danger"
                    @click="confirmDeleteClient(client)"
                    title="Eliminar cliente"
                  >
                    <span class="action-icon">🗑️</span>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>

            <!-- Información de Contacto Siempre Visible -->
            <div class="client-contact-info">
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <span class="contact-label">Email:</span>
                <a :href="`mailto:${client.email}`" class="contact-value email">{{ client.email }}</a>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span class="contact-label">Teléfono:</span>
                <a :href="`tel:${client.phone}`" class="contact-value phone">{{ client.phone }}</a>
              </div>
              <div v-if="client.altPhone" class="contact-item">
                <span class="contact-icon">📱</span>
                <span class="contact-label">Teléfono Alt:</span>
                <a :href="`tel:${client.altPhone}`" class="contact-value phone">{{ client.altPhone }}</a>
              </div>
            </div>

            <!-- Detalles Expandibles -->
            <div v-if="expandedClients.includes(client.id)" class="client-expanded-details">
              <div class="details-section">
                <h4 class="details-title">
                  <span class="details-icon">📍</span>
                  Información de Ubicación
                </h4>
                <div class="details-content">
                  <div class="detail-item">
                    <span class="detail-label">Dirección:</span>
                    <span class="detail-value">{{ client.address }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Ciudad:</span>
                    <span class="detail-value">{{ getCityText(client.city) }}</span>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <h4 class="details-title">
                  <span class="details-icon">📊</span>
                  Información Comercial
                </h4>
                <div class="details-content">
                  <div class="detail-item">
                    <span class="detail-label">Estado:</span>
                    <span :class="['detail-badge', `badge-${client.status}`]">
                      {{ getStatusIcon(client.status) }} {{ getStatusText(client.status) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Fecha de Registro:</span>
                    <span class="detail-value">{{ formatDate(client.created_at) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Total Cotizaciones:</span>
                    <span class="detail-value">{{ client.totalQuotations || 0 }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Última Cotización:</span>
                    <span class="detail-value">{{ client.lastQuotation || 'Sin cotizaciones' }}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones Adicionales en Vista Expandida -->
              <div class="expanded-actions">
                <button class="expanded-action-btn create-quotation" @click="createQuotationForClient(client)">
                  <span class="action-icon">📝</span>
                  Nueva Cotización
                </button>
                <button class="expanded-action-btn view-history" @click="viewClientHistory(client)">
                  <span class="action-icon">📚</span>
                  Ver Historial
                </button>
                <button class="expanded-action-btn send-email" @click="sendEmailToClient(client)">
                  <span class="action-icon">✉️</span>
                  Enviar Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination-panel">
      <div class="pagination-info">
        <span>Mostrando {{ startItem }} - {{ endItem }} de {{ filteredClients.length }} clientes</span>
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
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span>por página</span>
      </div>
    </div>

    <!-- Modal de Edición de Cliente -->
    <div v-if="clientToEdit" class="edit-modal-overlay" @click="cancelEdit">
      <div class="edit-modal-content" @click.stop>
        <div class="edit-modal-header">
          <h3>✏️ Editar Cliente</h3>
          <button class="modal-close" @click="cancelEdit">✕</button>
        </div>
        
        <div class="edit-modal-body">
          <form @submit.prevent="saveClientChanges" class="edit-client-form">
            <!-- Información básica -->
            <div class="form-section">
              <h4>📋 Información Básica</h4>
              <div class="form-grid">
                <div class="form-field">
                  <label for="editName">Razón Social *</label>
                  <input 
                    id="editName"
                    v-model="editForm.name" 
                    type="text" 
                    required 
                    class="form-input"
                  />
                </div>
                <div class="form-field">
                  <label for="editNit">NIT *</label>
                  <input 
                    id="editNit"
                    v-model="editForm.nit" 
                    type="text" 
                    required 
                    class="form-input"
                  />
                </div>
                <div class="form-field">
                  <label for="editRepresentative">Representante Legal *</label>
                  <input 
                    id="editRepresentative"
                    v-model="editForm.legalRepresentative" 
                    type="text" 
                    required 
                    class="form-input"
                  />
                </div>
                <div class="form-field">
                  <label for="editStatus">Estado</label>
                  <select id="editStatus" v-model="editForm.status" class="form-select">
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">⚠️ Inactivo</option>
                    <option value="pendiente">🔄 Pendiente</option>
                    <option value="bloqueado">❌ Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Información de contacto -->
            <div class="form-section">
              <h4>📞 Información de Contacto</h4>
              <div class="form-grid">
                <div class="form-field">
                  <label for="editEmail">Email *</label>
                  <input 
                    id="editEmail"
                    v-model="editForm.email" 
                    type="email" 
                    required 
                    class="form-input"
                  />
                </div>
                <div class="form-field">
                  <label for="editPhone">Teléfono Principal *</label>
                  <input 
                    id="editPhone"
                    v-model="editForm.phone" 
                    type="tel" 
                    required 
                    class="form-input"
                  />
                </div>
                <div class="form-field">
                  <label for="editAltPhone">Teléfono Alternativo</label>
                  <input 
                    id="editAltPhone"
                    v-model="editForm.altPhone" 
                    type="tel" 
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Información de ubicación -->
            <div class="form-section">
              <h4>📍 Información de Ubicación</h4>
              <div class="form-grid">
                <div class="form-field form-field-full">
                  <label for="editAddress">Dirección *</label>
                  <textarea 
                    id="editAddress"
                    v-model="editForm.address" 
                    required 
                    class="form-textarea"
                    rows="2"
                  ></textarea>
                </div>
                <div class="form-field">
                  <label for="editCity">Ciudad</label>
                  <select id="editCity" v-model="editForm.city" class="form-select">
                    <option value="bogota">Bogotá D.C.</option>
                    <option value="medellin">Medellín</option>
                    <option value="cali">Cali</option>
                    <option value="barranquilla">Barranquilla</option>
                    <option value="cartagena">Cartagena</option>
                    <option value="bucaramanga">Bucaramanga</option>
                    <option value="otra">Otra Ciudad</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="edit-modal-actions">
          <button type="button" class="btn-cancel" @click="cancelEdit">
            ❌ Cancelar
          </button>
          <button type="button" class="btn-save" @click="saveClientChanges" :disabled="isSaving">
            {{ isSaving ? '💾 Guardando...' : '💾 Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación para Eliminar -->
    <div v-if="clientToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>⚠️ Confirmar Eliminación</h3>
          <button class="modal-close" @click="cancelDelete">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar el cliente?</p>
          <div class="client-to-delete-info">
            <strong>{{ clientToDelete.name }}</strong><br>
            <span>NIT: {{ clientToDelete.nit }}</span><br>
            <span>Representante: {{ clientToDelete.legalRepresentative }}</span>
          </div>
          <p class="warning-text">
            ⚠️ Esta acción no se puede deshacer y eliminará toda la información asociada al cliente.
          </p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="cancelDelete">
            ❌ Cancelar
          </button>
          <button class="btn-confirm-delete" @click="confirmDelete">
            🗑️ Eliminar Cliente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientReadView',
  data() {
    return {
      isLoading: false,
      searchQuery: '', // Búsqueda unificada
      expandedClients: [], // IDs de clientes con detalles expandidos
      clientToDelete: null, // Cliente pendiente de eliminación
      clientToEdit: null, // Cliente que se está editando
      isSaving: false, // Estado de guardado
      
      // Formulario de edición
      editForm: {
        name: '',
        nit: '',
        legalRepresentative: '',
        email: '',
        phone: '',
        altPhone: '',
        address: '',
        city: '',
        status: 'activo'
      },
      
      // Filtros simplificados
      filters: {
        status: '' // Solo filtro por estado
      },
      
      // Filtros rápidos para estado
      quickStatusFilters: [
        { value: '', label: 'Todos', icon: '🏢' },
        { value: 'activo', label: 'Activos', icon: '✅' },
        { value: 'inactivo', label: 'Inactivos', icon: '⚠️' },
        { value: 'pendiente', label: 'Pendientes', icon: '🔄' },
        { value: 'bloqueado', label: 'Bloqueados', icon: '❌' }
      ],
      
      // Ordenamiento
      sortBy: 'name',
      sortDirection: 'asc',
      
      // Paginación
      currentPage: 1,
      itemsPerPage: 20,
      
      // Datos mock mejorados con información adicional
      clients: [
        {
          id: 1,
          name: 'Constructora Los Andes S.A.S',
          nit: '900123456-7',
          legalRepresentative: 'Carlos Mendoza',
          email: 'contacto@losandes.com',
          phone: '+57 320 456 7890',
          altPhone: '(1) 234-5678',
          address: 'Calle 123 #45-67, Oficina 301, Centro Empresarial Torre Norte, Bogotá D.C.',
          city: 'bogota',
          status: 'activo',
          created_at: '2024-01-15',
          totalQuotations: 15,
          lastQuotation: '2024-12-10'
        },
        {
          id: 2,
          name: 'Ferreterías del Valle LTDA',
          nit: '800987654-3',
          legalRepresentative: 'María Rodríguez',
          email: 'info@ferreteriavalle.com',
          phone: '+57 310 123 4567',
          altPhone: '(2) 567-8901',
          address: 'Carrera 45 #67-89, Local 102, Centro Comercial La Plaza, Cali',
          city: 'cali',
          status: 'activo',
          created_at: '2024-02-20',
          totalQuotations: 8,
          lastQuotation: '2024-11-28'
        },
        {
          id: 3,
          name: 'Distribuidora Industrial del Norte',
          nit: '700456789-1',
          legalRepresentative: 'Luis Fernando García',
          email: 'ventas@distinorte.com',
          phone: '+57 305 987 6543',
          altPhone: '(4) 345-6789',
          address: 'Avenida Industrial #12-34, Sector Empresarial, Medellín',
          city: 'medellin',
          status: 'inactivo',
          created_at: '2024-01-30',
          totalQuotations: 3,
          lastQuotation: '2024-08-15'
        },
        {
          id: 4,
          name: 'Comercializadora Caribe S.A.',
          nit: '600321654-9',
          legalRepresentative: 'Ana Sofía López',
          email: 'administracion@comercaribe.com',
          phone: '+57 315 654 3210',
          altPhone: '(5) 123-4567',
          address: 'Calle 72 #3B-45, Edificio Empresarial del Caribe, Barranquilla',
          city: 'barranquilla',
          status: 'pendiente',
          created_at: '2024-03-05',
          totalQuotations: 0,
          lastQuotation: null
        },
        {
          id: 5,
          name: 'Suministros Técnicos Santander',
          nit: '500789123-2',
          legalRepresentative: 'Roberto Jiménez',
          email: 'roberto@sumitecnicos.com',
          phone: '+57 300 111 2233',
          altPhone: '(7) 890-1234',
          address: 'Carrera 27 #45-123, Zona Industrial Norte, Bucaramanga',
          city: 'bucaramanga',
          status: 'bloqueado',
          created_at: '2024-02-10',
          totalQuotations: 12,
          lastQuotation: '2024-09-20'
        },
        {
          id: 6,
          name: 'Inversiones Turísticas del Caribe',
          nit: '400555666-8',
          legalRepresentative: 'Patricia Hernández',
          email: 'patricia@invturcaribe.com',
          phone: '+57 318 777 8888',
          altPhone: '(5) 999-0000',
          address: 'Centro Histórico, Plaza de los Coches #2-15, Cartagena',
          city: 'cartagena',
          status: 'activo',
          created_at: '2024-03-12',
          totalQuotations: 5,
          lastQuotation: '2024-12-01'
        }
      ]
    }
  },
  
  computed: {
    // Filtrar clientes con búsqueda unificada
    filteredClients() {
      let filtered = [...this.clients]
      
      // Filtro por búsqueda unificada (todos los campos)
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.nit.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.toLowerCase().includes(query) ||
          c.legalRepresentative.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query)
        )
      }
      
      // Filtro por estado
      if (this.filters.status) {
        filtered = filtered.filter(c => c.status === this.filters.status)
      }
      
      // Ordenamiento
      filtered.sort((a, b) => {
        let aValue = a[this.sortBy] || ''
        let bValue = b[this.sortBy] || ''
        
        if (typeof aValue === 'string') {
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
    
    paginatedClients() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredClients.slice(start, end)
    },
    
    totalClients() {
      return this.clients.length
    },
    
    totalPages() {
      return Math.ceil(this.filteredClients.length / this.itemsPerPage)
    },
    
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredClients.length)
    },
    
    hasActiveSearch() {
      return this.searchQuery.length > 0 || this.filters.status !== ''
    }
  },
  
  methods: {
    // Manejo de búsqueda unificada
    handleSearch() {
      this.currentPage = 1
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        console.log('🔍 Búsqueda unificada:', this.searchQuery)
      }, 300)
    },
    
    performSearch() {
      this.handleSearch()
      console.log('🔍 Búsqueda manual ejecutada')
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.filters.status = ''
      this.currentPage = 1
      console.log('🗑️ Búsqueda limpiada')
    },
    
    // Filtros rápidos por estado
    setQuickFilter(status) {
      this.filters.status = this.filters.status === status ? '' : status
      this.currentPage = 1
      console.log(`📊 Filtro rápido aplicado: ${status || 'todos'}`)
    },
    
    getStatusCount(status) {
      if (!status) return this.clients.length
      return this.clients.filter(c => c.status === status).length
    },
    
    // Manejo de detalles expandibles
    toggleClientDetails(clientId) {
      const index = this.expandedClients.indexOf(clientId)
      if (index > -1) {
        this.expandedClients.splice(index, 1)
        console.log(`👁️‍🗨️ Ocultando detalles del cliente ID: ${clientId}`)
      } else {
        this.expandedClients.push(clientId)
        console.log(`👁️ Expandiendo detalles del cliente ID: ${clientId}`)
      }
    },
    
    // ✅ MÉTODOS DE EDICIÓN
    
    // Abrir modal de edición
    editClient(client) {
      console.log('✏️ Abriendo formulario de edición para:', client.name)
      
      // Clonar datos del cliente al formulario
      this.editForm = {
        name: client.name,
        nit: client.nit,
        legalRepresentative: client.legalRepresentative,
        email: client.email,
        phone: client.phone,
        altPhone: client.altPhone || '',
        address: client.address,
        city: client.city,
        status: client.status
      }
      
      // Establecer cliente a editar
      this.clientToEdit = client
    },
    
    // Cancelar edición
    cancelEdit() {
      console.log('❌ Cancelando edición')
      this.clientToEdit = null
      this.resetEditForm()
    },
    
    // Limpiar formulario de edición
    resetEditForm() {
      this.editForm = {
        name: '',
        nit: '',
        legalRepresentative: '',
        email: '',
        phone: '',
        altPhone: '',
        address: '',
        city: '',
        status: 'activo'
      }
    },
    
    // Guardar cambios del cliente
    async saveClientChanges() {
      if (!this.clientToEdit) return
      
      this.isSaving = true
      
      try {
        console.log('💾 Guardando cambios del cliente:', this.clientToEdit.name)
        
        // Validación básica
        if (!this.editForm.name || !this.editForm.nit || !this.editForm.email) {
          alert('Por favor completa todos los campos obligatorios (*)')
          return
        }
        
        // TODO: Implementar guardado en backend
        // await axios.put(`/clients/${this.clientToEdit.id}/`, this.editForm)
        
        // Simular guardado (temporal)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Actualizar cliente en la lista local
        const clientIndex = this.clients.findIndex(c => c.id === this.clientToEdit.id)
        if (clientIndex > -1) {
          this.clients[clientIndex] = {
            ...this.clients[clientIndex],
            ...this.editForm
          }
        }
        
        console.log('✅ Cliente actualizado exitosamente')
        
        // Cerrar modal
        this.cancelEdit()
        
        // Mostrar notificación de éxito (opcional)
        alert(`Cliente "${this.editForm.name}" actualizado exitosamente`)
        
      } catch (error) {
        console.error('❌ Error guardando cambios:', error)
        alert('Error al actualizar el cliente. Intenta nuevamente.')
      } finally {
        this.isSaving = false
      }
    },
    
    // ✅ MÉTODOS DE ELIMINACIÓN
    
    confirmDeleteClient(client) {
      this.clientToDelete = client
      console.log('🗑️ Solicitando confirmación para eliminar:', client.name)
    },
    
    cancelDelete() {
      this.clientToDelete = null
      console.log('❌ Eliminación cancelada')
    },
    
    async confirmDelete() {
      if (!this.clientToDelete) return
      
      const clientName = this.clientToDelete.name
      const clientId = this.clientToDelete.id
      
      try {
        console.log(`🗑️ Eliminando cliente: ${clientName}`)
        
        // TODO: Implementar eliminación en backend
        // await axios.delete(`/clients/${clientId}/`)
        
        // Simular eliminación local (temporal)
        const index = this.clients.findIndex(c => c.id === clientId)
        if (index > -1) {
          this.clients.splice(index, 1)
        }
        
        // Remover de expandidos si estaba
        const expandedIndex = this.expandedClients.indexOf(clientId)
        if (expandedIndex > -1) {
          this.expandedClients.splice(expandedIndex, 1)
        }
        
        this.clientToDelete = null
        console.log(`✅ Cliente "${clientName}" eliminado exitosamente`)
        
        // Mostrar notificación de éxito
        alert(`Cliente "${clientName}" eliminado exitosamente`)
        
      } catch (error) {
        console.error('❌ Error eliminando cliente:', error)
        alert('Error al eliminar el cliente. Intenta nuevamente.')
      }
    },
    
    // Navegación
    goToCreateClient() {
      console.log('➕ Navegando a crear nuevo cliente')
      this.$router.push('/dashboard/clientes/nuevo')
    },
    
    // Acciones adicionales
    createQuotationForClient(client) {
      console.log(`📝 Crear cotización para: ${client.name}`)
      // TODO: Implementar navegación a crear cotización con cliente preseleccionado
      // this.$router.push(`/dashboard/quotations/new?client=${client.id}`)
      alert(`Funcionalidad en desarrollo.\nCrear cotización para: ${client.name}`)
    },
    
    viewClientHistory(client) {
      console.log(`📚 Ver historial de: ${client.name}`)
      // TODO: Implementar vista de historial del cliente
      alert(`Funcionalidad en desarrollo.\nVer historial de: ${client.name}`)
    },
    
    sendEmailToClient(client) {
      console.log(`✉️ Enviar email a: ${client.email}`)
      window.location.href = `mailto:${client.email}`
    },
    
    // Ordenamiento
    applySorting() {
      console.log(`📊 Ordenando por ${this.sortBy} (${this.sortDirection})`)
    },
    
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      this.applySorting()
    },
    
    // Paginación
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        console.log(`📄 Navegando a página ${page}`)
      }
    },
    
    changeItemsPerPage() {
      this.currentPage = 1
      console.log(`📋 Mostrando ${this.itemsPerPage} clientes por página`)
    },
    
    // Funciones auxiliares
    getStatusIcon(status) {
      const icons = {
        activo: '✅',
        inactivo: '⚠️',
        pendiente: '🔄',
        bloqueado: '❌'
      }
      return icons[status] || '❓'
    },
    
    getStatusText(status) {
      const texts = {
        activo: 'Activo',
        inactivo: 'Inactivo',
        pendiente: 'Pendiente',
        bloqueado: 'Bloqueado'
      }
      return texts[status] || status
    },
    
    getCityText(city) {
      const texts = {
        bogota: 'Bogotá D.C.',
        medellin: 'Medellín',
        cali: 'Cali',
        barranquilla: 'Barranquilla',
        cartagena: 'Cartagena',
        bucaramanga: 'Bucaramanga',
        otra: 'Otra Ciudad'
      }
      return texts[city] || city
    },
    
    getInitials(name) {
      if (!name) return '??'
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    
    formatDate(dateStr) {
      if (!dateStr) return 'No registrado'
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(dateStr))
    },
    
    // Cargar clientes desde backend (preparado)
    async fetchClientsFromBackend() {
      this.isLoading = true
      try {
        console.log('🔄 Cargando clientes desde el backend...')
        
        // TODO: Implementar cuando el backend esté listo
        // const response = await axios.get('/clients/')
        // this.clients = response.data
        
        console.log('✅ Clientes cargados exitosamente')
      } catch (error) {
        console.error('❌ Error cargando clientes:', error)
      } finally {
        this.isLoading = false
      }
    }
  },
  
  mounted() {
    console.log('📍 ClientReadView unificado montado correctamente')
    // this.fetchClientsFromBackend()
  },
  
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
/* ========================================
   🎨 CLIENTREADVIEW - ESTILOS COMPLETOS
   ======================================== */

/* 🔹 Variables CSS */
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --secondary-color: #64748b;
  --success-color: #059669;
  --warning-color: #d97706;
  --error-color: #dc2626;
  --info-color: #0891b2;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-accent: #e2e8f0;
  
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  
  --border-color: #e2e8f0;
  --border-hover: #cbd5e1;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
}

/* 🔹 Contenedor Principal */
.client-read-workspace {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: var(--spacing-lg);
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ========================================
   📋 HEADER PRINCIPAL
   ======================================== */
.client-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.title-section {
  flex: 1;
}

.main-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.title-icon {
  font-size: 3rem;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}

.subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
}

.stats-badge {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  min-width: 120px;
}

.badge-label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
}

.badge-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

/* ========================================
   🔍 PANEL DE BÚSQUEDA
   ======================================== */
.search-panel {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.panel-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-icon {
  font-size: 1.5rem;
}

.search-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.btn-clear, .btn-add {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-clear {
  background: var(--warning-color);
  color: white;
}

.btn-clear:hover {
  background: #b45309;
  transform: translateY(-1px);
}

.btn-add {
  background: var(--success-color);
  color: white;
}

.btn-add:hover {
  background: #047857;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

/* 🔹 Contenido de Búsqueda */
.search-content {
  padding: var(--spacing-xl);
}

.unified-search {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.search-field label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.field-icon {
  font-size: 1.25rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-right: 3.5rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-button {
  position: absolute;
  right: var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background: var(--primary-hover);
  transform: scale(1.05);
}

.search-icon {
  width: 20px;
  height: 20px;
}

.field-help {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.4;
}

/* 🔹 Filtros Rápidos */
.quick-filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.quick-filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: var(--text-primary);
}

.quick-filter-btn:hover {
  background: var(--bg-accent);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.quick-filter-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.filter-icon {
  font-size: 1.125rem;
}

.filter-count {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* 🔹 Indicador de Búsqueda */
.search-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: var(--radius-lg);
  border: 1px solid #93c5fd;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.indicator-text {
  color: var(--primary-hover);
  font-weight: 500;
}

.results-count {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
}

/* ========================================
   📋 PANEL DE RESULTADOS
   ======================================== */
.results-panel {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

.panel-actions {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  flex-wrap: wrap;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
}

.sort-direction-btn {
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.sort-direction-btn:hover {
  background: var(--bg-accent);
}

/* 🔹 Contenido del Panel */
.panel-content {
  padding: var(--spacing-xl);
}

/* 🔹 Estados de Carga y Vacío */
.loading-state, .empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-accent);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg) auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  margin-top: var(--spacing-lg);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ========================================
   🏢 TARJETAS DETALLADAS DE CLIENTES
   ======================================== */
.clients-detailed-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.client-detailed-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  overflow: hidden;
}

.client-detailed-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

/* 🔹 Header de la Tarjeta */
.client-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.client-main-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
  min-width: 300px;
}

.client-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.avatar-text {
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.client-basic-info {
  flex: 1;
}

.client-company-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.2;
}

.client-representative, .client-nit {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0;
  font-size: 0.95rem;
}

.rep-icon, .nit-icon {
  font-size: 1rem;
}

/* 🔹 Estado y Acciones */
.client-status-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.client-status-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: var(--shadow-sm);
}

.status-activo { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.status-inactivo { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.status-pendiente { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.status-bloqueado { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.client-actions-menu {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.action-btn.primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: var(--secondary-color);
  color: white;
}

.action-btn.secondary:hover {
  background: #475569;
  transform: translateY(-1px);
}

.action-btn.danger {
  background: var(--error-color);
  color: white;
}

.action-btn.danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.action-icon {
  font-size: 1rem;
}

/* 🔹 Información de Contacto */
.client-contact-info {
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.contact-icon {
  font-size: 1.125rem;
}

.contact-label {
  font-weight: 500;
  color: var(--text-primary);
}

.contact-value {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.contact-value:hover {
  text-decoration: underline;
}

/* 🔹 Detalles Expandibles */
.client-expanded-details {
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-top: 2px solid var(--primary-color);
  animation: expandDetails 0.3s ease-out;
}

@keyframes expandDetails {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
    padding-top: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
  }
}

.details-section {
  margin-bottom: var(--spacing-xl);
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.details-icon {
  font-size: 1.25rem;
}

.details-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
}

.badge-activo { background: #dcfce7; color: #166534; }
.badge-inactivo { background: #fef3c7; color: #92400e; }
.badge-pendiente { background: #dbeafe; color: #1e40af; }
.badge-bloqueado { background: #fee2e2; color: #991b1b; }

/* 🔹 Acciones Expandidas */
.expanded-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.expanded-action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expanded-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.expanded-action-btn.create-quotation:hover {
  border-color: var(--success-color);
  background: #f0fdf4;
  color: var(--success-color);
}

.expanded-action-btn.view-history:hover {
  border-color: var(--info-color);
  background: #f0f9ff;
  color: var(--info-color);
}

.expanded-action-btn.send-email:hover {
  border-color: var(--primary-color);
  background: #eff6ff;
  color: var(--primary-color);
}

/* ========================================
   📄 PAGINACIÓN
   ======================================== */
.pagination-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.page-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-current {
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 600;
  color: var(--text-primary);
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.items-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
}

/* ========================================
   🔧 MODALES
   ======================================== */

/* 🔹 Modal de Edición */
.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.edit-modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid var(--border-color);
}

.edit-modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-accent);
  color: var(--text-primary);
}

.edit-modal-body {
  padding: var(--spacing-xl);
}

/* 🔹 Formulario de Edición */
.edit-client-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-section h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-input, .form-select, .form-textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 🔹 Acciones del Modal */
.edit-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.btn-cancel, .btn-save {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-cancel {
  background: var(--bg-accent);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: #cbd5e1;
}

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 🔹 Modal de Confirmación */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 500px;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-bottom: 1px solid #fca5a5;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--error-color);
}

.modal-body {
  padding: var(--spacing-xl);
  text-align: center;
}

.client-to-delete-info {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin: var(--spacing-lg) 0;
  border-left: 4px solid var(--error-color);
}

.warning-text {
  color: var(--error-color);
  font-weight: 500;
  margin-top: var(--spacing-lg);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.btn-confirm-delete {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-confirm-delete:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* ========================================
   📱 RESPONSIVE DESIGN
   ======================================== */
@media (max-width: 768px) {
  .client-read-workspace {
    padding: var(--spacing-md);
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .client-card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .client-main-info {
    min-width: auto;
  }
  
  .client-status-actions {
    align-items: stretch;
  }
  
  .client-actions-menu {
    justify-content: center;
  }
  
  .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .details-content {
    grid-template-columns: 1fr;
  }
  
  .pagination-panel {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .edit-modal-overlay {
    padding: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.75rem;
  }
  
  .quick-filters {
    justify-content: center;
  }
  
  .quick-filter-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
  
  .expanded-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
}

/* ========================================
   🎯 UTILIDADES Y MEJORAS
   ======================================== */

/* 🔹 Estados de enfoque mejorados */
.search-input:focus,
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  transform: translateY(-1px);
}

/* 🔹 Animaciones suaves */
.client-detailed-card,
.quick-filter-btn,
.action-btn,
.page-btn {
  will-change: transform;
}

/* 🔹 Scrollbar personalizado */
.edit-modal-content::-webkit-scrollbar {
  width: 8px;
}

.edit-modal-content::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.edit-modal-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.edit-modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* 🔹 Estados de impresión */
@media print {
  .client-read-workspace {
    background: white;
    box-shadow: none;
  }
  
  .search-panel,
  .pagination-panel,
  .client-actions-menu,
  .expanded-actions {
    display: none;
  }
}
</style>
