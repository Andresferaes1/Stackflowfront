<template>
  <div class="quotation-history">
    <!-- Encabezado de la página -->
    <div class="page-header">
      <h1>📋 Historial de Cotizaciones</h1>
      <p>Consulta y gestiona todas las cotizaciones creadas</p>
    </div>

    <!-- Panel de búsqueda y filtros -->
    <div class="search-panel">
      <div class="search-row">
        <!-- Búsqueda por número de cotización -->
        <div class="search-group">
          <label for="quotationNumber">🔢 Número de Cotización:</label>
          <input
            id="quotationNumber"
            v-model="filters.quotationNumber"
            type="text"
            placeholder="Ej: COT-001"
            @input="onSearch"
            class="search-input"
          >
        </div>

        <!-- Búsqueda por cliente -->
        <div class="search-group">
          <label for="clientName">👤 Cliente:</label>
          <input
            id="clientName"
            v-model="filters.clientName"
            type="text"
            placeholder="Nombre del cliente"
            @input="onSearch"
            class="search-input"
          >
        </div>

        <!-- Filtro por estado -->
        <div class="search-group">
          <label for="status">📊 Estado:</label>
          <select
            id="status"
            v-model="filters.status"
            @change="onSearch"
            class="search-select"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviada">Enviada</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>

        <!-- Botón de limpiar filtros -->
        <div class="search-group">
          <button @click="clearFilters" class="clear-filters-btn">
            🗑️ Limpiar
          </button>
        </div>
      </div>

      <!-- Filtros de fecha -->
      <div class="date-filters">
        <div class="date-group">
          <label for="startDate">📅 Fecha desde:</label>
          <input
            id="startDate"
            v-model="filters.startDate"
            type="date"
            @change="onSearch"
            class="date-input"
          >
        </div>
        <div class="date-group">
          <label for="endDate">📅 Fecha hasta:</label>
          <input
            id="endDate"
            v-model="filters.endDate"
            type="date"
            @change="onSearch"
            class="date-input"
          >
        </div>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-panel">
      <div class="stat-card">
        <h3>{{ totalQuotations }}</h3>
        <p>Total Cotizaciones</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.pending }}</h3>
        <p>Pendientes</p>
      </div>
      <div class="stat-card">
        <h3>{{ stats.approved }}</h3>
        <p>Aprobadas</p>
      </div>
      <div class="stat-card">
        <h3>${{ formatCurrency(stats.totalValue) }}</h3>
        <p>Valor Total</p>
      </div>
    </div>

    <!-- Tabla de cotizaciones -->
    <div class="table-container">
      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando cotizaciones...</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <h3>⚠️ Error al cargar cotizaciones</h3>
        <p>{{ error }}</p>
        <button @click="fetchQuotations" class="retry-btn">
          🔄 Reintentar
        </button>
      </div>

      <!-- Tabla con datos -->
      <div v-else-if="filteredQuotations.length > 0" class="table-wrapper">
        <table class="quotations-table">
          <thead>
            <tr>
              <th @click="sortBy('quotation_number')" class="sortable">
                🔢 Número
                <span v-if="sortField === 'quotation_number'" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('client_name')" class="sortable">
                👤 Cliente
                <span v-if="sortField === 'client_name'" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('created_at')" class="sortable">
                📅 Fecha
                <span v-if="sortField === 'created_at'" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('total')" class="sortable">
                💰 Total
                <span v-if="sortField === 'total'" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>📊 Estado</th>
              <th>⚙️ Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quotation in paginatedQuotations" :key="quotation.id" class="quotation-row">
              <!-- Número de cotización -->
              <td class="quotation-number">
                <strong>{{ quotation.quotation_number }}</strong>
              </td>

              <!-- Cliente -->
              <td class="client-info">
                <div class="client-name">{{ quotation.client_name }}</div>
                <div class="client-email" v-if="quotation.client_email">
                  {{ quotation.client_email }}
                </div>
              </td>

              <!-- Fecha -->
              <td class="date-info">
                <div class="create-date">{{ formatDate(quotation.created_at) }}</div>
                <div class="time-ago">{{ getTimeAgo(quotation.created_at) }}</div>
              </td>

              <!-- Total -->
              <td class="total-amount">
                <strong>${{ formatCurrency(quotation.total) }}</strong>
              </td>

              <!-- Estado -->
              <td class="status-cell">
                <span :class="['status-badge', `status-${quotation.status}`]">
                  {{ getStatusText(quotation.status) }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="actions-cell">
                <div class="action-buttons">
                  <button
                    @click="viewQuotation(quotation)"
                    class="action-btn view-btn"
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                  <button
                    @click="editQuotation(quotation)"
                    class="action-btn edit-btn"
                    title="Editar"
                    :disabled="quotation.status === 'aprobada'"
                  >
                    ✏️
                  </button>
                  <button
                    @click="duplicateQuotation(quotation)"
                    class="action-btn duplicate-btn"
                    title="Duplicar"
                  >
                    📋
                  </button>
                  <button
                    @click="generatePDF(quotation)"
                    class="action-btn pdf-btn"
                    title="Generar PDF"
                  >
                    📄
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado sin datos -->
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No se encontraron cotizaciones</h3>
        <p v-if="hasActiveFilters">
          Intenta ajustar los filtros de búsqueda
        </p>
        <p v-else>
          Aún no has creado ninguna cotización
        </p>
        <button @click="createNewQuotation" class="create-btn">
          ➕ Crear Nueva Cotización
        </button>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ← Anterior
      </button>

      <span class="page-info">
        Página {{ currentPage }} de {{ totalPages }}
        ({{ filteredQuotations.length }} cotizaciones)
      </span>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        Siguiente →
      </button>
    </div>
  </div>
</template>

<script>
import axios from '@/services/axios' // Importar axios configurado

export default {
  name: 'QuotationHistoryView',
  data() {
    return {
      // Lista de cotizaciones desde el backend
      quotations: [],
      
      // Estados de la aplicación
      loading: false,       // Estado de carga
      error: null,          // Manejo de errores
      
      // Filtros de búsqueda
      filters: {
        quotationNumber: '',  // Búsqueda por número
        clientName: '',       // Búsqueda por cliente
        status: '',           // Filtro por estado
        startDate: '',        // Fecha desde
        endDate: '',          // Fecha hasta
      },
      
      // Configuración de ordenamiento
      sortField: 'created_at',  // Campo por el que ordenar
      sortDirection: 'desc',    // Dirección del ordenamiento
      
      // Configuración de paginación
      currentPage: 1,           // Página actual
      itemsPerPage: 10,         // Elementos por página
      
      // Estadísticas calculadas
      stats: {
        pending: 0,
        approved: 0,
        totalValue: 0,
      },
    }
  },

  // Propiedades computadas para lógica reactiva
  computed: {
    // Filtrar cotizaciones según criterios de búsqueda
    filteredQuotations() {
      let filtered = [...this.quotations];

      // Filtro por número de cotización
      if (this.filters.quotationNumber.trim()) {
        filtered = filtered.filter(q => 
          q.quotation_number.toLowerCase().includes(this.filters.quotationNumber.toLowerCase())
        );
      }

      // Filtro por nombre de cliente
      if (this.filters.clientName.trim()) {
        filtered = filtered.filter(q =>
          q.client_name.toLowerCase().includes(this.filters.clientName.toLowerCase())
        );
      }

      // Filtro por estado
      if (this.filters.status) {
        filtered = filtered.filter(q => q.status === this.filters.status);
      }

      // Filtro por fecha desde
      if (this.filters.startDate) {
        filtered = filtered.filter(q => {
          const quotationDate = new Date(q.created_at);
          const startDate = new Date(this.filters.startDate);
          return quotationDate >= startDate;
        });
      }

      // Filtro por fecha hasta
      if (this.filters.endDate) {
        filtered = filtered.filter(q => {
          const quotationDate = new Date(q.created_at);
          const endDate = new Date(this.filters.endDate);
          endDate.setHours(23, 59, 59, 999); // Incluir todo el día
          return quotationDate <= endDate;
        });
      }

      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];

        // Manejar números
        if (this.sortField === 'total') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }

        // Manejar fechas
        if (this.sortField === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        // Manejar strings
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return filtered;
    },

    // Cotizaciones para la página actual
    paginatedQuotations() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredQuotations.slice(start, end);
    },

    // Número total de páginas
    totalPages() {
      return Math.ceil(this.filteredQuotations.length / this.itemsPerPage);
    },

    // Total de cotizaciones
    totalQuotations() {
      return this.quotations.length;
    },

    // Verificar si hay filtros activos
    hasActiveFilters() {
      return Object.values(this.filters).some(filter => filter.trim() !== '');
    },
  },

  // Cargar datos al montar el componente
  async created() {
    await this.fetchQuotations();
  },

  methods: {
    // Método principal para obtener cotizaciones desde el backend
    async fetchQuotations() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Obteniendo cotizaciones del backend...');
        
        // Realizar petición al backend
        const response = await axios.get('/quotations');
        this.quotations = response.data;
        
        // Calcular estadísticas
        this.calculateStats();
        
        console.log(`${this.quotations.length} cotizaciones cargadas exitosamente`);

      } catch (err) {
        // Manejar errores
        if (err.response?.status === 401) {
          this.error = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          setTimeout(() => {
            this.$router.push('/login');
          }, 3000);
        } else {
          this.error = 'Error al cargar las cotizaciones. Verifica tu conexión.';
        }
        
        console.error('Error al obtener cotizaciones:', err);
      } finally {
        this.loading = false;
      }
    },

    // Calcular estadísticas de las cotizaciones
    calculateStats() {
      this.stats = {
        pending: this.quotations.filter(q => q.status === 'borrador' || q.status === 'enviada').length,
        approved: this.quotations.filter(q => q.status === 'aprobada').length,
        totalValue: this.quotations.reduce((total, q) => total + (parseFloat(q.total) || 0), 0),
      };
    },

    // Manejar búsqueda (con debounce)
    onSearch() {
      // Resetear a la primera página cuando se busca
      this.currentPage = 1;
      
      // TODO: Implementar debounce para optimizar búsquedas
      console.log('Búsqueda actualizada:', this.filters);
    },

    // Limpiar todos los filtros
    clearFilters() {
      this.filters = {
        quotationNumber: '',
        clientName: '',
        status: '',
        startDate: '',
        endDate: '',
      };
      this.currentPage = 1;
      console.log('Filtros limpiados');
    },

    // Ordenar por campo
    sortBy(field) {
      if (this.sortField === field) {
        // Si ya está ordenando por este campo, cambiar dirección
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Si es un campo nuevo, ordenar ascendente
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      console.log(`Ordenando por ${field} (${this.sortDirection})`);
    },

    // Cambiar página
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.currentPage = newPage;
        console.log(`Cambio a página ${newPage}`);
      }
    },

    // Ver detalles de una cotización
    viewQuotation(quotation) {
      console.log('Ver cotización:', quotation.quotation_number);
      // TODO: Implementar modal o navegación a vista de detalles
      alert(`Ver detalles de ${quotation.quotation_number}\n\nEsta funcionalidad se implementará próximamente.`);
    },

    // Editar cotización
    editQuotation(quotation) {
      if (quotation.status === 'aprobada') {
        alert('No se pueden editar cotizaciones aprobadas');
        return;
      }
      
      console.log('Editar cotización:', quotation.quotation_number);
      // Navegar a la vista de edición con los datos precargados
      this.$router.push({
        name: 'QuotationCreate',
        query: { edit: quotation.id }
      });
    },

    // Duplicar cotización
    duplicateQuotation(quotation) {
      console.log('Duplicar cotización:', quotation.quotation_number);
      // Navegar a la vista de creación con los datos como base
      this.$router.push({
        name: 'QuotationCreate',
        query: { duplicate: quotation.id }
      });
    },

    // Generar PDF de cotización
    generatePDF(quotation) {
      console.log('Generar PDF:', quotation.quotation_number);
      // TODO: Implementar generación de PDF
      alert(`Generando PDF de ${quotation.quotation_number}\n\nEsta funcionalidad se implementará próximamente.`);
    },

    // Crear nueva cotización
    createNewQuotation() {
      this.$router.push({ name: 'QuotationCreate' });
    },

    // Métodos utilitarios para formateo
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    },

    formatCurrency(amount) {
      if (!amount) return '0';
      return parseFloat(amount).toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    },

    getTimeAgo(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hace 1 día';
        if (diffDays < 30) return `Hace ${diffDays} días`;
        if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
        return `Hace ${Math.floor(diffDays / 365)} años`;
      } catch {
        return '';
      }
    },

    getStatusText(status) {
      const statusMap = {
        'borrador': 'Borrador',
        'enviada': 'Enviada',
        'aprobada': 'Aprobada',
        'rechazada': 'Rechazada',
      };
      return statusMap[status] || status;
    },
  },

  // Watchers para reactividad
  watch: {
    // Recalcular estadísticas cuando cambian las cotizaciones
    quotations() {
      this.calculateStats();
    },

    // Resetear página cuando cambian los filtros
    filteredQuotations() {
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = 1;
      }
    },
  },
}
</script>
<style scoped>
/* === CONTENEDOR PRINCIPAL === */
.quotation-history {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
  box-sizing: border-box;
}

/* === ENCABEZADO DE LA PÁGINA === */
.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
}

/* === PANEL DE BÚSQUEDA === */
.search-panel {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.search-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.search-group {
  display: flex;
  flex-direction: column;
}

.search-group label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.search-input, .search-select, .date-input {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-input:focus, .search-select:focus, .date-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.clear-filters-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin-top: auto;
  transition: background 0.3s ease, transform 0.2s ease;
}

.clear-filters-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.date-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.date-group {
  display: flex;
  flex-direction: column;
}

/* === PANEL DE ESTADÍSTICAS === */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  border-left: 4px solid #409eff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.stat-card h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

.stat-card:nth-child(2) {
  border-left-color: #f39c12;
}

.stat-card:nth-child(3) {
  border-left-color: #27ae60;
}

.stat-card:nth-child(4) {
  border-left-color: #8e44ad;
}

/* === CONTENEDOR DE TABLA === */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

/* === ESTADOS DE CARGA, ERROR Y VACÍO === */
.loading-state, .error-state, .empty-state {
  padding: 3rem;
  text-align: center;
}

.loading-state .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state h3 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #3a8ee6;
}

.empty-state .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #6c757d;
  margin-bottom: 1rem;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

/* === TABLA === */
.table-wrapper {
  overflow-x: auto;
}

.quotations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.quotations-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.quotations-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.3s ease;
  position: relative;
}

.quotations-table th.sortable:hover {
  background: #e9ecef;
}

.sort-indicator {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: #409eff;
}

.quotations-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.quotation-row:hover {
  background: #f8f9fa;
}

/* === CELDAS ESPECÍFICAS === */
.quotation-number strong {
  color: #409eff;
  font-weight: 700;
}

.client-info .client-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.client-info .client-email {
  color: #6c757d;
  font-size: 0.85rem;
}

.date-info .create-date {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.date-info .time-ago {
  color: #6c757d;
  font-size: 0.8rem;
}

.total-amount strong {
  color: #27ae60;
  font-size: 1.1rem;
}

/* === BADGES DE ESTADO === */
.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-borrador {
  background: #fef9e7;
  color: #f39c12;
  border: 1px solid #f39c12;
}

.status-enviada {
  background: #e3f2fd;
  color: #2196f3;
  border: 1px solid #2196f3;
}

.status-aprobada {
  background: #e8f5e8;
  color: #27ae60;
  border: 1px solid #27ae60;
}

.status-rechazada {
  background: #ffebee;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

/* === BOTONES DE ACCIÓN === */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-btn {
  background: #17a2b8;
  color: white;
}

.view-btn:hover:not(:disabled) {
  background: #138496;
  transform: scale(1.1);
}

.edit-btn {
  background: #ffc107;
  color: #212529;
}

.edit-btn:hover:not(:disabled) {
  background: #e0a800;
  transform: scale(1.1);
}

.duplicate-btn {
  background: #6f42c1;
  color: white;
}

.duplicate-btn:hover {
  background: #5a32a3;
  transform: scale(1.1);
}

.pdf-btn {
  background: #dc3545;
  color: white;
}

.pdf-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* === PAGINACIÓN === */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.page-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease, transform 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #3a8ee6;
  transform: translateY(-1px);
}

.page-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  color: #6c757d;
  font-weight: 500;
  text-align: center;
  min-width: 200px;
}

/* === RESPONSIVE DESIGN === */
@media (max-width: 1200px) {
  .search-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .quotation-history {
    padding: 1rem;
  }
  
  .page-header {
    padding: 1.5rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .search-panel {
    padding: 1.5rem;
  }
  
  .search-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .date-filters {
    grid-template-columns: 1fr;
  }
  
  .stats-panel {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
  
  .quotations-table {
    font-size: 0.85rem;
  }
  
  .quotations-table th,
  .quotations-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-btn {
    width: 100%;
    height: 32px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .page-info {
    min-width: auto;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .search-panel,
  .table-container {
    margin-bottom: 1rem;
  }
  
  .quotations-table th,
  .quotations-table td {
    padding: 0.5rem 0.25rem;
  }
  
  /* Ocultar columnas menos importantes en móviles muy pequeños */
  .quotations-table .date-info,
  .quotations-table th:nth-child(3) {
    display: none;
  }
}

/* === ANIMACIONES === */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quotation-row {
  animation: fadeIn 0.5s ease-in-out;
}

/* === UTILIDADES === */
.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d;
}

.font-weight-bold {
  font-weight: 700;
}

.mb-0 {
  margin-bottom: 0;
}

.mt-1 {
  margin-top: 0.25rem;
}

/* === MEJORAS DE ACCESIBILIDAD === */
.action-btn:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.page-btn:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.search-input:focus,
.search-select:focus,
.date-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

/* === PRINT STYLES === */
@media print {
  .search-panel,
  .pagination,
  .action-buttons {
    display: none;
  }
  
  .quotation-history {
    background: white;
    padding: 0;
  }
  
  .table-container {
    box-shadow: none;
  }
}
</style>
