<template>
  <div class="client-read-container">
    <!-- Header con Estadísticas -->
    <div class="page-header">
      <div class="header-left">
        <h1>📋 Gestión de Clientes</h1>
        <p class="subtitle">{{ clients.length }} clientes registrados</p>
      </div>
      <div class="header-actions">
        <div class="stats-summary">
          <span class="stat-item">
            ✅ {{ getStatusCount('activo') }} Activos
          </span>
          <span class="stat-item">
            ⚠️ {{ getStatusCount('inactivo') }} Inactivos
          </span>
        </div>
        <button class="btn-primary" @click="goToCreateClient">
          ➕ Nuevo Cliente
        </button>
      </div>
    </div>

    <!-- Panel de Búsqueda Avanzada -->
    <div class="search-panel">
      <div class="search-header">
        <h3>🔍 Búsqueda y Filtros</h3>
        <div class="search-actions">
          <button v-if="hasActiveFilters" class="btn-clear" @click="clearAllFilters">
            🗑️ Limpiar Todo
          </button>
          <button class="btn-export" @click="exportClients">
            📊 Exportar
          </button>
        </div>
      </div>

      <!-- Búsqueda Principal -->
      <div class="search-main">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, NIT, email, teléfono o representante..."
            class="search-input"
            @input="handleSearch"
            @keyup.enter="performSearch"
          />
          <button class="search-btn" @click="performSearch">🔍</button>
        </div>
        
        <!-- Filtros Avanzados -->
        <div class="advanced-filters">
          <div class="filter-row">
            <!-- Filtros por Estado -->
            <div class="filter-group">
              <label>Estado:</label>
              <div class="filter-tabs">
                <button 
                  v-for="filter in statusFilters" 
                  :key="filter.value"
                  :class="['filter-tab', { active: selectedStatus === filter.value }]"
                  @click="setStatusFilter(filter.value)"
                >
                  {{ filter.icon }} {{ filter.label }} ({{ getStatusCount(filter.value) }})
                </button>
              </div>
            </div>

            <!-- Filtros por Ciudad -->
            <div class="filter-group">
              <label>Ciudad:</label>
              <select v-model="selectedCity" @change="applyFilters" class="filter-select">
                <option value="">Todas las ciudades</option>
                <option v-for="city in availableCities" :key="city.value" :value="city.value">
                  {{ city.label }}
                </option>
              </select>
            </div>

            <!-- Filtros por Fecha -->
            <div class="filter-group">
              <label>Registrado:</label>
              <select v-model="dateRange" @change="applyFilters" class="filter-select">
                <option value="">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>
          </div>

          <!-- Ordenamiento -->
          <div class="sort-controls">
            <label>Ordenar por:</label>
            <select v-model="sortBy" @change="applySorting" class="sort-select">
              <option value="name">Nombre</option>
              <option value="created_at">Fecha de registro</option>
              <option value="status">Estado</option>
              <option value="lastActivity">Última actividad</option>
            </select>
            <button class="sort-direction" @click="toggleSortDirection">
              {{ sortDirection === 'asc' ? '⬆️' : '⬇️' }}
            </button>
          </div>
        </div>

        <!-- Indicador de Resultados -->
        <div v-if="hasActiveFilters" class="search-results">
          <div class="results-info">
            📊 {{ filteredClients.length }} de {{ clients.length }} clientes
            <span v-if="searchQuery">" {{ searchQuery }}"</span>
          </div>
          <button class="clear-search" @click="clearAllFilters">✕</button>
        </div>
      </div>
    </div>

    <!-- Lista de Clientes con Vista Detallada -->
    <div class="clients-section">
      <!-- Controles de Vista -->
      <div class="view-controls">
        <div class="view-options">
          <button 
            :class="['view-btn', { active: viewMode === 'cards' }]"
            @click="setViewMode('cards')"
          >
            🃏 Tarjetas
          </button>
          <button 
            :class="['view-btn', { active: viewMode === 'table' }]"
            @click="setViewMode('table')"
          >
            📋 Tabla
          </button>
          <button 
            :class="['view-btn', { active: viewMode === 'compact' }]"
            @click="setViewMode('compact')"
          >
            📝 Compacto
          </button>
        </div>

        <div class="items-per-page">
          <label>Mostrar:</label>
          <select v-model="itemsPerPage" @change="changeItemsPerPage">
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="50">50</option>
          </select>
          <span>por página</span>
        </div>
      </div>

      <!-- Estados de Carga -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando clientes...</p>
      </div>
      
      <div v-else-if="filteredClients.length === 0" class="empty-state">
        <div class="empty-icon">🏢</div>
        <h3>{{ searchQuery ? 'No se encontraron coincidencias' : 'No hay clientes registrados' }}</h3>
        <p v-if="searchQuery">
          No hay clientes que coincidan con "{{ searchQuery }}"
        </p>
        <div class="empty-actions">
          <button v-if="searchQuery" class="btn-secondary" @click="clearAllFilters">
            🔄 Limpiar búsqueda
          </button>
          <button class="btn-primary" @click="goToCreateClient">
            ➕ {{ searchQuery ? 'Crear cliente' : 'Crear primer cliente' }}
          </button>
        </div>
      </div>

      <!-- Vista de Tarjetas -->
      <div v-else-if="viewMode === 'cards'" class="clients-cards">
        <div 
          v-for="client in paginatedClients" 
          :key="client.id" 
          class="client-card"
          :class="{ expanded: expandedClients.includes(client.id) }"
        >
          <!-- Header de la Tarjeta -->
          <div class="card-header">
            <div class="client-avatar">
              {{ getClientInitials(client.name) }}
            </div>
            <div class="client-basic-info">
              <h3>{{ client.name }}</h3>
              <p class="client-rep">👤 {{ client.legalRepresentative }}</p>
              <p class="client-nit">🆔 {{ client.nit }}</p>
            </div>
            <div class="card-actions">
              <span :class="['status-badge', `status-${client.status}`]">
                {{ getStatusIcon(client.status) }} {{ getStatusText(client.status) }}
              </span>
              <button 
                class="expand-btn"
                @click="toggleClientDetails(client.id)"
              >
                {{ expandedClients.includes(client.id) ? '⬆️' : '⬇️' }}
              </button>
            </div>
          </div>

          <!-- Información de Contacto -->
          <div class="card-contact">
            <div class="contact-item">
              <span class="contact-label">📧 Email:</span>
              <a :href="`mailto:${client.email}`" class="contact-value">{{ client.email }}</a>
            </div>
            <div class="contact-item">
              <span class="contact-label">📞 Teléfono:</span>
              <a :href="`tel:${client.phone}`" class="contact-value">{{ client.phone }}</a>
            </div>
          </div>

          <!-- Detalles Expandibles -->
          <div v-if="expandedClients.includes(client.id)" class="card-details">
            <div class="details-grid">
              <div class="detail-item">
                <strong>📍 Dirección:</strong>
                <p>{{ client.address || 'No registrada' }}</p>
              </div>
              <div class="detail-item">
                <strong>🏙️ Ciudad:</strong>
                <p>{{ getCityText(client.city) }}</p>
              </div>
              <div class="detail-item">
                <strong>📅 Registro:</strong>
                <p>{{ formatDate(client.created_at) }}</p>
              </div>
              <div class="detail-item">
                <strong>📊 Cotizaciones:</strong>
                <p>{{ client.totalQuotations || 0 }} realizadas</p>
              </div>
            </div>

            <!-- Acciones Expandidas -->
            <div class="expanded-actions">
              <button class="action-btn primary" @click="editClient(client)">
                ✏️ Editar Cliente
              </button>
              <button class="action-btn success" @click="createQuotationForClient(client)">
                📝 Nueva Cotización
              </button>
              <button class="action-btn info" @click="viewClientHistory(client)">
                📚 Ver Historial
              </button>
              <button class="action-btn warning" @click="sendEmailToClient(client)">
                ✉️ Enviar Email
              </button>
              <button class="action-btn danger" @click="confirmDeleteClient(client)">
                🗑️ Eliminar
              </button>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div v-else class="card-quick-actions">
            <button class="quick-btn edit" @click="editClient(client)">✏️</button>
            <button class="quick-btn delete" @click="confirmDeleteClient(client)">🗑️</button>
            <button class="quick-btn quotation" @click="createQuotationForClient(client)">📝</button>
          </div>
        </div>
      </div>

      <!-- Vista de Tabla -->
      <div v-else-if="viewMode === 'table'" class="clients-table">
        <table>
          <thead>
            <tr>
              <th @click="setSortBy('name')">
                Empresa {{ sortBy === 'name' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th @click="setSortBy('nit')">
                NIT {{ sortBy === 'nit' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th>Representante</th>
              <th>Contacto</th>
              <th @click="setSortBy('status')">
                Estado {{ sortBy === 'status' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in paginatedClients" :key="client.id">
              <td>
                <strong>{{ client.name }}</strong>
                <br><small>{{ getCityText(client.city) }}</small>
              </td>
              <td>{{ client.nit }}</td>
              <td>{{ client.legalRepresentative }}</td>
              <td>
                <div>📧 <a :href="`mailto:${client.email}`">{{ client.email }}</a></div>
                <div>📞 <a :href="`tel:${client.phone}`">{{ client.phone }}</a></div>
              </td>
              <td>
                <span :class="['status-badge', `status-${client.status}`]">
                  {{ getStatusIcon(client.status) }} {{ getStatusText(client.status) }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="table-btn edit" @click="editClient(client)">✏️</button>
                  <button class="table-btn delete" @click="confirmDeleteClient(client)">🗑️</button>
                  <button class="table-btn quotation" @click="createQuotationForClient(client)">📝</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vista Compacta -->
      <div v-else-if="viewMode === 'compact'" class="clients-compact">
        <div 
          v-for="client in paginatedClients" 
          :key="client.id" 
          class="compact-item"
        >
          <div class="compact-main">
            <span :class="['status-dot', `status-${client.status}`]"></span>
            <div class="compact-info">
              <strong>{{ client.name }}</strong>
              <span class="compact-details">{{ client.nit }} • {{ client.legalRepresentative }}</span>
            </div>
          </div>
          <div class="compact-actions">
            <button class="compact-btn" @click="editClient(client)" title="Editar">✏️</button>
            <button class="compact-btn" @click="createQuotationForClient(client)" title="Cotizar">📝</button>
            <button class="compact-btn delete" @click="confirmDeleteClient(client)" title="Eliminar">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación Avanzada -->
    <div v-if="totalPages > 1" class="pagination-panel">
      <div class="pagination-info">
        Mostrando {{ startItem }} - {{ endItem }} de {{ filteredClients.length }} clientes
      </div>
      <div class="pagination-controls">
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          ⏮️ Primera
        </button>
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ◀️ Anterior
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            :class="['page-number', { active: currentPage === page }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Siguiente ▶️
        </button>
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          Última ⏭️
        </button>
      </div>
    </div>

    <!-- Modal de Edición Completo -->
    <div v-if="clientToEdit" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✏️ Editar Cliente</h3>
          <button class="modal-close" @click="cancelEdit">✕</button>
        </div>
        
        <form @submit.prevent="saveClientChanges" class="edit-form">
          <div class="form-sections">
            <!-- Información Básica -->
            <div class="form-section">
              <h4>🏢 Información de la Empresa</h4>
              <div class="form-grid">
                <div class="form-field">
                  <label>Razón Social *</label>
                  <input v-model="editForm.name" type="text" required />
                </div>
                <div class="form-field">
                  <label>NIT *</label>
                  <input v-model="editForm.nit" type="text" required />
                </div>
                <div class="form-field">
                  <label>Representante Legal *</label>
                  <input v-model="editForm.legalRepresentative" type="text" required />
                </div>
                <div class="form-field">
                  <label>Estado</label>
                  <select v-model="editForm.status" required>
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">⚠️ Inactivo</option>
                    <option value="pendiente">🔄 Pendiente</option>
                    <option value="bloqueado">❌ Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Información de Contacto -->
            <div class="form-section">
              <h4>📞 Información de Contacto</h4>
              <div class="form-grid">
                <div class="form-field">
                  <label>Email *</label>
                  <input v-model="editForm.email" type="email" required />
                </div>
                <div class="form-field">
                  <label>Teléfono Principal *</label>
                  <input v-model="editForm.phone" type="tel" required />
                </div>
                <div class="form-field">
                  <label>Teléfono Alternativo</label>
                  <input v-model="editForm.altPhone" type="tel" />
                </div>
                <div class="form-field">
                  <label>Ciudad</label>
                  <select v-model="editForm.city">
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
              <div class="form-field full-width">
                <label>Dirección</label>
                <textarea v-model="editForm.address" rows="3" placeholder="Dirección completa..."></textarea>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="cancelEdit">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? '💾 Guardando...' : '💾 Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="clientToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>⚠️ Confirmar Eliminación</h3>
          <button class="modal-close" @click="cancelDelete">✕</button>
        </div>
        
        <div class="confirm-content">
          <div class="warning-icon">🗑️</div>
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
          
          <div class="client-preview">
            <h4>{{ clientToDelete.name }}</h4>
            <p>NIT: {{ clientToDelete.nit }}</p>
            <p>Representante: {{ clientToDelete.legalRepresentative }}</p>
          </div>
          
          <div class="warning-text">
            <p><strong>⚠️ Esta acción no se puede deshacer.</strong></p>
            <p>Se eliminará toda la información del cliente y su historial.</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn-cancel" @click="cancelDelete">
            Cancelar
          </button>
          <button class="btn-danger" @click="confirmDelete">
            🗑️ Sí, Eliminar Cliente
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
      // Estados de carga y UI
      isLoading: false,
      isSaving: false,
      
      // Búsqueda y filtros
      searchQuery: '',
      selectedStatus: '',
      selectedCity: '',
      dateRange: '',
      
      // Ordenamiento
      sortBy: 'name',
      sortDirection: 'asc',
      
      // Paginación
      currentPage: 1,
      itemsPerPage: 12,
      
      // Vista y comportamiento
      viewMode: 'cards', // 'cards', 'table', 'compact'
      expandedClients: [],
      
      // Modales
      clientToEdit: null,
      clientToDelete: null,
      editForm: {},
      
      // Configuración de filtros
      statusFilters: [
        { value: '', label: 'Todos', icon: '📋' },
        { value: 'activo', label: 'Activos', icon: '✅' },
        { value: 'inactivo', label: 'Inactivos', icon: '⚠️' },
        { value: 'pendiente', label: 'Pendientes', icon: '🔄' },
        { value: 'bloqueado', label: 'Bloqueados', icon: '❌' },
      ],
      
      availableCities: [
        { value: 'bogota', label: 'Bogotá D.C.' },
        { value: 'medellin', label: 'Medellín' },
        { value: 'cali', label: 'Cali' },
        { value: 'barranquilla', label: 'Barranquilla' },
        { value: 'cartagena', label: 'Cartagena' },
        { value: 'bucaramanga', label: 'Bucaramanga' },
        { value: 'otra', label: 'Otra Ciudad' },
      ],
      
      // Datos de clientes (simulados)
      clients: [
        {
          id: 1,
          name: 'Constructora Los Andes S.A.S',
          nit: '900123456-7',
          legalRepresentative: 'Carlos Mendoza Ruiz',
          email: 'contacto@losandes.com',
          phone: '+57 320 456 7890',
          altPhone: '(1) 234-5678',
          address: 'Calle 123 #45-67, Centro Empresarial Torre Norte, Oficina 1205',
          city: 'bogota',
          status: 'activo',
          created_at: '2024-01-15T10:30:00Z',
          lastActivity: '2024-06-10T14:22:00Z',
          totalQuotations: 15
        },
        {
          id: 2,
          name: 'Ferreterías del Valle LTDA',
          nit: '800987654-3',
          legalRepresentative: 'María Elena Rodríguez',
          email: 'info@ferreteriavalle.com',
          phone: '+57 310 123 4567',
          altPhone: '(2) 567-8901',
          address: 'Carrera 45 #67-89, Local 102, Centro Comercial Valle Plaza',
          city: 'cali',
          status: 'activo',
          created_at: '2024-02-20T08:15:00Z',
          lastActivity: '2024-06-14T16:45:00Z',
          totalQuotations: 8
        },
        {
          id: 3,
          name: 'Distribuidora Industrial del Norte',
          nit: '700456789-1',
          legalRepresentative: 'Luis Fernando García Torres',
          email: 'ventas@distinorte.com',
          phone: '+57 305 987 6543',
          altPhone: '(4) 345-6789',
          address: 'Avenida Industrial #12-34, Zona Franca La Cayena',
          city: 'medellin',
          status: 'inactivo',
          created_at: '2024-01-30T12:45:00Z',
          lastActivity: '2024-05-20T09:30:00Z',
          totalQuotations: 3
        },
        {
          id: 4,
          name: 'Comercializadora Caribe S.A.',
          nit: '600321654-9',
          legalRepresentative: 'Ana Sofía López Martínez',
          email: 'administracion@comercaribe.com',
          phone: '+57 315 654 3210',
          altPhone: '(5) 123-4567',
          address: 'Calle 72 #3B-45, Edificio Empresarial Caribe, Piso 8',
          city: 'barranquilla',
          status: 'pendiente',
          created_at: '2024-03-05T15:20:00Z',
          lastActivity: '2024-06-12T11:15:00Z',
          totalQuotations: 0
        },
        {
          id: 5,
          name: 'Suministros Técnicos Santander',
          nit: '500789123-2',
          legalRepresentative: 'Roberto Jiménez Peña',
          email: 'roberto@sumitecnicos.com',
          phone: '+57 300 111 2233',
          altPhone: '(7) 890-1234',
          address: 'Carrera 27 #45-123, Sector Industrial Café Madrid',
          city: 'bucaramanga',
          status: 'bloqueado',
          created_at: '2024-02-10T14:00:00Z',
          lastActivity: '2024-04-15T10:20:00Z',
          totalQuotations: 2
        },
        {
          id: 6,
          name: 'Importaciones y Exportaciones del Pacífico',
          nit: '900555666-4',
          legalRepresentative: 'Diana Patricia Vargas',
          email: 'gerencia@imexpacifico.com',
          phone: '+57 312 888 9999',
          altPhone: '(2) 444-5555',
          address: 'Puerto de Buenaventura, Zona Portuaria Lote 15',
          city: 'otra',
          status: 'activo',
          created_at: '2024-03-18T09:30:00Z',
          lastActivity: '2024-06-15T13:40:00Z',
          totalQuotations: 12
        },
        {
          id: 7,
          name: 'Textiles y Confecciones Andinas',
          nit: '800222333-8',
          legalRepresentative: 'Alejandro Morales Sánchez',
          email: 'ventas@textilesandinas.com',
          phone: '+57 318 777 4444',
          altPhone: '(4) 666-7777',
          address: 'Itagüí, Carrera 50 #23-67, Parque Industrial Zona Sur',
          city: 'medellin',
          status: 'activo',
          created_at: '2024-01-08T11:25:00Z',
          lastActivity: '2024-06-13T15:50:00Z',
          totalQuotations: 7
        }
      ]
    }
  },
  
  computed: {
    // Filtrado principal de clientes
    filteredClients() {
      let filtered = [...this.clients]
      
      // Filtro por búsqueda de texto
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(client => 
          client.name.toLowerCase().includes(query) ||
          client.nit.includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.phone.includes(query) ||
          client.legalRepresentative.toLowerCase().includes(query)
        )
      }
      
      // Filtro por estado
      if (this.selectedStatus) {
        filtered = filtered.filter(client => client.status === this.selectedStatus)
      }
      
      // Filtro por ciudad
      if (this.selectedCity) {
        filtered = filtered.filter(client => client.city === this.selectedCity)
      }
      
      // Filtro por rango de fechas
      if (this.dateRange) {
        const now = new Date()
        const clientDate = (client) => new Date(client.created_at)
        
        filtered = filtered.filter(client => {
          const date = clientDate(client)
          
          switch (this.dateRange) {
            case 'today':
              return date.toDateString() === now.toDateString()
            case 'week': {
              const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
              return date >= weekAgo
            }
            case 'month': {
              const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
              return date >= monthAgo
            }
            case 'year': {
              const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
              return date >= yearAgo
            }
            default:
              return true
          }
        })
      }
      
      // Aplicar ordenamiento
      return this.sortClients(filtered)
    },
    
    // Ordenamiento de clientes
    sortClients() {
      return (clients) => {
        return [...clients].sort((a, b) => {
          let aValue, bValue
          
          switch (this.sortBy) {
            case 'name':
              aValue = a.name.toLowerCase()
              bValue = b.name.toLowerCase()
              break
            case 'created_at':
              aValue = new Date(a.created_at)
              bValue = new Date(b.created_at)
              break
            case 'status':
              aValue = a.status
              bValue = b.status
              break
            case 'lastActivity':
              aValue = new Date(a.lastActivity || a.created_at)
              bValue = new Date(b.lastActivity || b.created_at)
              break
            default:
              aValue = a[this.sortBy]
              bValue = b[this.sortBy]
          }
          
          if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1
          if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1
          return 0
        })
      }
    },
    
    // Clientes paginados
    paginatedClients() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredClients.slice(start, start + this.itemsPerPage)
    },
    
    // Información de paginación
    totalPages() {
      return Math.ceil(this.filteredClients.length / this.itemsPerPage)
    },
    
    startItem() {
      return Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.filteredClients.length)
    },
    
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredClients.length)
    },
    
    visiblePages() {
      const pages = []
      const totalPages = this.totalPages
      const current = this.currentPage
      
      // Mostrar máximo 5 páginas
      let start = Math.max(1, current - 2)
      let end = Math.min(totalPages, start + 4)
      
      // Ajustar si estamos cerca del final
      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    },
    
    // Estado de filtros activos
    hasActiveFilters() {
      return !!(this.searchQuery || this.selectedStatus || this.selectedCity || this.dateRange)
    }
  },
  
  methods: {
    // === MÉTODOS DE BÚSQUEDA Y FILTROS ===
    
    handleSearch() {
      this.currentPage = 1
      console.log('🔍 Búsqueda actualizada:', this.searchQuery)
    },
    
    performSearch() {
      this.handleSearch()
      console.log('🎯 Búsqueda ejecutada:', this.searchQuery)
    },
    
    setStatusFilter(status) {
      this.selectedStatus = this.selectedStatus === status ? '' : status
      this.currentPage = 1
      console.log('📊 Filtro de estado:', status || 'todos')
    },
    
    applyFilters() {
      this.currentPage = 1
      console.log('🔧 Filtros aplicados')
    },
    
    clearAllFilters() {
      this.searchQuery = ''
      this.selectedStatus = ''
      this.selectedCity = ''
      this.dateRange = ''
      this.currentPage = 1
      console.log('🗑️ Todos los filtros limpiados')
    },
    
    // === MÉTODOS DE ORDENAMIENTO ===
    
    applySorting() {
      console.log('📊 Ordenando por:', this.sortBy, this.sortDirection)
    },
    
    setSortBy(field) {
      if (this.sortBy === field) {
        this.toggleSortDirection()
      } else {
        this.sortBy = field
        this.sortDirection = 'asc'
      }
      console.log('🔀 Orden cambiado:', field, this.sortDirection)
    },
    
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      console.log('🔄 Dirección de orden:', this.sortDirection)
    },
    
    // === MÉTODOS DE VISTA ===
    
    setViewMode(mode) {
      this.viewMode = mode
      this.expandedClients = [] // Colapsar todos al cambiar vista
      console.log('👁️ Modo de vista:', mode)
    },
    
    changeItemsPerPage() {
      this.currentPage = 1
      console.log('📄 Items por página:', this.itemsPerPage)
    },
    
    toggleClientDetails(clientId) {
      const index = this.expandedClients.indexOf(clientId)
      if (index > -1) {
        this.expandedClients.splice(index, 1)
      } else {
        this.expandedClients.push(clientId)
      }
      console.log('🔍 Detalles cliente:', clientId)
    },
    
    // === MÉTODOS DE PAGINACIÓN ===
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        console.log('📄 Página:', page)
        
        // Scroll suave al inicio de la lista
        this.$nextTick(() => {
          const clientsSection = this.$el.querySelector('.clients-section')
          if (clientsSection) {
            clientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    },
    
    // === MÉTODOS DE DATOS AUXILIARES ===
    
    getStatusCount(status) {
      return status ? this.clients.filter(c => c.status === status).length : this.clients.length
    },
    
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
      const cityObj = this.availableCities.find(c => c.value === city)
      return cityObj ? cityObj.label : 'Ciudad no especificada'
    },
    
    getClientInitials(name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 3)
        .toUpperCase()
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Sin fecha'
      
      const date = new Date(dateString)
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      
      return date.toLocaleDateString('es-ES', options)
    },
    
    // === MÉTODOS DE ACCIONES DE CLIENTE ===
    
    editClient(client) {
      console.log('✏️ Editando cliente:', client.name)
      this.editForm = { ...client }
      this.clientToEdit = client
    },
    
    cancelEdit() {
      this.clientToEdit = null
      this.editForm = {}
      this.isSaving = false
      console.log('❌ Edición cancelada')
    },
    
    async saveClientChanges() {
      this.isSaving = true
      
      try {
        console.log('💾 Guardando cambios del cliente:', this.editForm.name)
        
        // Validaciones básicas
        if (!this.editForm.name || !this.editForm.nit || !this.editForm.email) {
          throw new Error('Campos obligatorios faltantes')
        }
        
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Actualizar cliente en la lista
        const index = this.clients.findIndex(c => c.id === this.clientToEdit.id)
        if (index > -1) {
          this.clients[index] = { ...this.editForm }
          console.log('✅ Cliente actualizado exitosamente')
        }
        
        this.cancelEdit()
        
      } catch (error) {
        console.error('❌ Error guardando cliente:', error)
        alert('Error al actualizar el cliente: ' + error.message)
      } finally {
        this.isSaving = false
      }
    },
    
    confirmDeleteClient(client) {
      console.log('🗑️ Solicitud de eliminación:', client.name)
      this.clientToDelete = client
    },
    
    cancelDelete() {
      this.clientToDelete = null
      console.log('❌ Eliminación cancelada')
    },
    
    confirmDelete() {
      if (!this.clientToDelete) return
      
      const clientName = this.clientToDelete.name
      const index = this.clients.findIndex(c => c.id === this.clientToDelete.id)
      
      if (index > -1) {
        this.clients.splice(index, 1)
        console.log('✅ Cliente eliminado:', clientName)
        
        // Ajustar página si es necesario
        if (this.paginatedClients.length === 0 && this.currentPage > 1) {
          this.currentPage--
        }
      }
      
      this.clientToDelete = null
    },
    
    // === MÉTODOS DE NAVEGACIÓN ===
    
    goToCreateClient() {
      console.log('➕ Navegando a crear cliente')
      this.$router.push('/dashboard/clients/create')
    },
    
    createQuotationForClient(client) {
      console.log('📝 Crear cotización para:', client.name)
      // Navegar con parámetros del cliente
      this.$router.push({
        path: '/dashboard/quotation/create',
        query: { client_id: client.id, client_name: client.name }
      })
    },
    
    // === MÉTODOS DE FUNCIONALIDADES AVANZADAS ===
    
    viewClientHistory(client) {
      console.log('📚 Ver historial de:', client.name)
      // Implementar vista de historial
      alert(`Historial de ${client.name}\n\n📊 Cotizaciones: ${client.totalQuotations || 0}\n📅 Registro: ${this.formatDate(client.created_at)}\n📞 Última actividad: ${this.formatDate(client.lastActivity)}`)
    },
    
    sendEmailToClient(client) {
      console.log('✉️ Enviar email a:', client.email)
      // Abrir cliente de email
      const subject = encodeURIComponent('Contacto desde StackFlow')
      const body = encodeURIComponent(`Estimado/a ${client.legalRepresentative},\n\nEsperamos que se encuentre bien.\n\nSaludos cordiales,\nEquipo StackFlow`)
      
      window.open(`mailto:${client.email}?subject=${subject}&body=${body}`)
    },
    
    exportClients() {
      console.log('📊 Exportando clientes:', this.filteredClients.length)
      
      try {
        // Crear CSV con los datos filtrados
        const headers = ['Empresa', 'NIT', 'Representante', 'Email', 'Teléfono', 'Ciudad', 'Estado', 'Fecha Registro']
        const csvData = [
          headers.join(','),
          ...this.filteredClients.map(client => [
            `"${client.name}"`,
            client.nit,
            `"${client.legalRepresentative}"`,
            client.email,
            client.phone,
            this.getCityText(client.city),
            this.getStatusText(client.status),
            this.formatDate(client.created_at)
          ].join(','))
        ].join('\n')
        
        // Descargar archivo
        const blob = new Blob([csvData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `clientes_stackflow_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log('✅ Exportación completada')
        
      } catch (error) {
        console.error('❌ Error en exportación:', error)
        alert('Error al exportar los datos')
      }
    }
  },
  
  // === CICLO DE VIDA ===
  
  mounted() {
    console.log('📋 ClientReadView cargado con', this.clients.length, 'clientes')
    
    // Cargar datos reales si existe API
    // this.loadClientsFromAPI()
  },
  
  // === WATCHERS ===
  
  watch: {
    // Resetear página cuando cambian los filtros
    filteredClients() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages)
      }
    }
  }
}
</script>

<style scoped>
/* === VARIABLES Y BASE === */
.client-read-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #374151;
}

/* === HEADER === */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.header-left h1 {
  font-size: 1.75rem;
  color: #1e40af;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.stats-summary {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.stat-item {
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  color: #374151;
}

/* === PANEL DE BÚSQUEDA === */
.search-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-header h3 {
  margin: 0;
  color: #1e40af;
  font-size: 1.1rem;
}

.search-actions {
  display: flex;
  gap: 0.5rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-btn {
  padding: 0.75rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* === FILTROS AVANZADOS === */
.advanced-filters {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.filter-tabs {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.4rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #e5e7eb;
}

.filter-tab.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.sort-select {
  padding: 0.4rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.sort-direction {
  padding: 0.4rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.search-results {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-top: 1rem;
}

.clear-search {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  cursor: pointer;
}

/* === CONTROLES DE VISTA === */
.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.view-options {
  display: flex;
  gap: 0.25rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.view-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.items-per-page select {
  padding: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 3px;
}

/* === ESTADOS DE CARGA === */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

/* === VISTA DE TARJETAS === */
.clients-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.client-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
  border-left: 4px solid #2563eb;
}

.client-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.client-avatar {
  width: 50px;
  height: 50px;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.client-basic-info {
  flex: 1;
}

.client-basic-info h3 {
  margin: 0 0 0.25rem 0;
  color: #1e40af;
  font-size: 1.1rem;
  line-height: 1.3;
}

.client-rep, .client-nit {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-activo { background: #dcfce7; color: #166534; }
.status-inactivo { background: #fef3c7; color: #92400e; }
.status-pendiente { background: #dbeafe; color: #1e40af; }
.status-bloqueado { background: #fee2e2; color: #991b1b; }

.expand-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.card-contact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.contact-item {
  font-size: 0.85rem;
}

.contact-label {
  color: #6b7280;
  display: block;
  margin-bottom: 0.25rem;
}

.contact-value {
  color: #2563eb;
  text-decoration: none;
}

.contact-value:hover {
  text-decoration: underline;
}

/* === DETALLES EXPANDIBLES === */
.card-details {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
  margin-top: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  font-size: 0.85rem;
}

.detail-item strong {
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
}

.detail-item p {
  margin: 0;
  color: #6b7280;
}

.expanded-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.action-btn.primary { background: #2563eb; color: white; }
.action-btn.success { background: #059669; color: white; }
.action-btn.info { background: #0891b2; color: white; }
.action-btn.warning { background: #d97706; color: white; }
.action-btn.danger { background: #dc2626; color: white; }

.card-quick-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.quick-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-btn.edit { background: #f3f4f6; }
.quick-btn.delete { background: #fee2e2; color: #991b1b; }
.quick-btn.quotation { background: #dcfce7; color: #166534; }

/* === VISTA DE TABLA === */
.clients-table {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.clients-table table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table th {
  background: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 0.85rem;
}

.clients-table th:hover {
  background: #f3f4f6;
}

.clients-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.85rem;
}

.clients-table tr:hover {
  background: #f9fafb;
}

.table-actions {
  display: flex;
  gap: 0.25rem;
}

.table-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-btn.edit { background: #f3f4f6; }
.table-btn.delete { background: #fee2e2; color: #991b1b; }
.table-btn.quotation { background: #dcfce7; color: #166534; }

/* === VISTA COMPACTA === */
.clients-compact {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.compact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.compact-item:hover {
  background: #f9fafb;
}

.compact-item:last-child {
  border-bottom: none;
}

.compact-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.status-activo { background: #22c55e; }
.status-dot.status-inactivo { background: #f59e0b; }
.status-dot.status-pendiente { background: #3b82f6; }
.status-dot.status-bloqueado { background: #ef4444; }

.compact-info {
  flex: 1;
}

.compact-info strong {
  display: block;
  color: #374151;
  font-size: 0.9rem;
}

.compact-details {
  color: #6b7280;
  font-size: 0.8rem;
}

.compact-actions {
  display: flex;
  gap: 0.25rem;
}

.compact-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compact-btn.delete {
  background: #fee2e2;
  color: #991b1b;
}

/* === PAGINACIÓN === */
.pagination-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.pagination-info {
  font-size: 0.85rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.page-number.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* === BOTONES GENERALES === */
.btn-primary, .btn-secondary, .btn-danger, .btn-cancel, .btn-clear, .btn-export {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary { background: #6b7280; color: white; }
.btn-secondary:hover { background: #4b5563; }

.btn-danger { background: #dc2626; color: white; }
.btn-danger:hover { background: #b91c1c; }

.btn-cancel { background: #f3f4f6; color: #374151; }
.btn-cancel:hover { background: #e5e7eb; }

.btn-clear { background: #f59e0b; color: white; }
.btn-clear:hover { background: #d97706; }

.btn-export { background: #059669; color: white; }
.btn-export:hover { background: #047857; }

/* === MODALES === */
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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1e40af;
  font-size: 1.2rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f3f4f6;
}

.edit-form {
  padding: 1.5rem;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* === MODAL DE CONFIRMACIÓN === */
.confirm-modal {
  max-width: 400px;
}

.confirm-content {
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.client-preview {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  border-left: 4px solid #dc2626;
}

.client-preview h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.client-preview p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.warning-text {
  color: #dc2626;
  font-size: 0.85rem;
}

.warning-text strong {
  display: block;
  margin-bottom: 0.5rem;
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .filter-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .clients-cards {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .expanded-actions {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .client-read-container {
    padding: 0.5rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    align-items: stretch;
  }

  .stats-summary {
    justify-content: space-between;
  }

  .search-bar {
    flex-direction: column;
  }

  .view-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .clients-cards {
    grid-template-columns: 1fr;
  }

  .card-contact {
    grid-template-columns: 1fr;
  }

  .clients-table {
    overflow-x: auto;
  }

  .pagination-panel {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 0.5rem;
  }
}

@media (max-width: 480px) {
  .filter-tabs {
    flex-direction: column;
  }

  .filter-tab {
    text-align: center;
  }

  .card-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .page-numbers {
    display: none;
  }

  .compact-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .compact-actions {
    justify-content: center;
  }
}
</style>