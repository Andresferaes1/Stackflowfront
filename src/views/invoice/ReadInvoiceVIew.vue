<template>
  <div class="invoice-read-container">
    <!-- 
      ====================================
      HEADER PRINCIPAL CON MÉTRICAS CLAVE
      ====================================
      Muestra estadísticas importantes en tiempo real:
      - Total cobrado, por cobrar, vencidas
      - Efectividad de cobro
    -->
    <div class="page-header">
      <!-- Título y contador de facturas -->
      <div class="header-left">
        <h1>🧾 Gestión de Facturas</h1>
        <p class="subtitle">{{ invoices.length }} facturas registradas</p>
      </div>
      
      <!-- Tarjetas de métricas financieras principales -->
      <div class="header-metrics">
        <div class="metric-cards">
          <!-- Métrica: Total cobrado exitosamente -->
          <div class="metric-card success">
            <div class="metric-icon">💰</div>
            <div class="metric-info">
              <span class="metric-value">${{ formatCurrency(totalPaid) }}</span>
              <span class="metric-label">Total Cobrado</span>
            </div>
          </div>
          
          <!-- Métrica: Dinero pendiente por cobrar -->
          <div class="metric-card warning">
            <div class="metric-icon">⏳</div>
            <div class="metric-info">
              <span class="metric-value">${{ formatCurrency(totalPending) }}</span>
              <span class="metric-label">Por Cobrar</span>
            </div>
          </div>
          
          <!-- Métrica: Facturas vencidas (crítico) -->
          <div class="metric-card danger">
            <div class="metric-icon">🚨</div>
            <div class="metric-info">
              <span class="metric-value">${{ formatCurrency(totalOverdue) }}</span>
              <span class="metric-label">Vencidas</span>
            </div>
          </div>
          
          <!-- Métrica: Porcentaje de efectividad en cobros -->
          <div class="metric-card info">
            <div class="metric-icon">📊</div>
            <div class="metric-info">
              <span class="metric-value">{{ averageTicket }}%</span>
              <span class="metric-label">Efectividad Cobro</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 
      ======================================
      PANEL DE BÚSQUEDA Y FILTROS AVANZADOS
      ======================================
      Sistema completo de filtrado para localizar facturas específicas
    -->
    <div class="search-panel">
      <!-- Encabezado del panel con acciones principales -->
      <div class="search-header">
        <h3>🔍 Búsqueda y Filtros de Facturas</h3>
        <div class="search-actions">
          <!-- Botón para limpiar todos los filtros aplicados -->
          <button v-if="hasActiveFilters" class="btn-clear" @click="clearAllFilters">
            🗑️ Limpiar Filtros
          </button>
          <!-- Exportar datos filtrados a Excel/CSV -->
          <button class="btn-export" @click="exportInvoices">
            📊 Exportar
          </button>
          <!-- Crear nueva cotización (que luego puede convertirse a factura) -->
          <button class="btn-primary" @click="goToCreateQuotation">
            ➕ Nueva Cotización
          </button>
        </div>
      </div>

      <!-- Contenedor principal de búsqueda -->
      <div class="search-main">
        <!-- Barra de búsqueda por texto libre -->
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por número de factura, cliente, NIT o valor..."
            class="search-input"
            @input="handleSearch"
            @keyup.enter="performSearch"
          />
          <button class="search-btn" @click="performSearch">🔍</button>
        </div>
        
        <!-- 
          =====================================
          FILTROS AVANZADOS ESPECÍFICOS
          =====================================
        -->
        <div class="advanced-filters">
          <!-- Primera fila de filtros principales -->
          <div class="filter-row">
            <!-- Filtro por estado de pago (tabs visuales) -->
            <div class="filter-group">
              <label>Estado de Pago:</label>
              <div class="filter-tabs">
                <button 
                  v-for="status in paymentStatuses" 
                  :key="status.value"
                  :class="['filter-tab', { active: selectedPaymentStatus === status.value }]"
                  @click="setPaymentStatusFilter(status.value)"
                >
                  {{ status.icon }} {{ status.label }} ({{ getPaymentStatusCount(status.value) }})
                </button>
              </div>
            </div>

            <!-- Filtro por rango de fechas predefinido -->
            <div class="filter-group">
              <label>Período:</label>
              <select v-model="dateRange" @change="applyFilters" class="filter-select">
                <option value="">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <!-- Filtro por cliente específico -->
            <div class="filter-group">
              <label>Cliente:</label>
              <select v-model="selectedClient" @change="applyFilters" class="filter-select">
                <option value="">Todos los clientes</option>
                <option v-for="client in availableClients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filtros de fecha personalizada (se muestra solo cuando se selecciona) -->
          <div v-if="dateRange === 'custom'" class="custom-date-filters">
            <div class="date-inputs">
              <div class="date-field">
                <label>Desde:</label>
                <input v-model="customDateFrom" type="date" @change="applyFilters" />
              </div>
              <div class="date-field">
                <label>Hasta:</label>
                <input v-model="customDateTo" type="date" @change="applyFilters" />
              </div>
            </div>
          </div>

          <!-- Filtros por rango de montos -->
          <div class="amount-filters">
            <div class="amount-inputs">
              <div class="amount-field">
                <label>Monto mínimo:</label>
                <input v-model="minAmount" type="number" placeholder="0" @input="applyFilters" />
              </div>
              <div class="amount-field">
                <label>Monto máximo:</label>
                <input v-model="maxAmount" type="number" placeholder="Sin límite" @input="applyFilters" />
              </div>
            </div>
          </div>

          <!-- Controles de ordenamiento -->
          <div class="sort-controls">
            <label>Ordenar por:</label>
            <select v-model="sortBy" @change="applySorting" class="sort-select">
              <option value="invoice_date">Fecha de factura</option>
              <option value="due_date">Fecha de vencimiento</option>
              <option value="client_name">Cliente</option>
              <option value="total_amount">Valor total</option>
              <option value="payment_status">Estado de pago</option>
              <option value="invoice_number">Número de factura</option>
            </select>
            <!-- Botón para alternar dirección de orden (ASC/DESC) -->
            <button class="sort-direction" @click="toggleSortDirection">
              {{ sortDirection === 'asc' ? '⬆️' : '⬇️' }}
            </button>
          </div>
        </div>

        <!-- Indicador de resultados de búsqueda y filtros -->
        <div v-if="hasActiveFilters || searchQuery" class="search-results">
          <div class="results-info">
            📊 {{ filteredInvoices.length }} de {{ invoices.length }} facturas
            <span v-if="searchQuery">" {{ searchQuery }}"</span>
            <!-- Resumen financiero de los resultados filtrados -->
            <span class="results-summary">
              • Total: ${{ formatCurrency(filteredTotal) }}
              • Promedio: ${{ formatCurrency(filteredAverage) }}
            </span>
          </div>
          <!-- Botón para limpiar búsqueda actual -->
          <button class="clear-search" @click="clearAllFilters">✕</button>
        </div>
      </div>
    </div>

    <!-- 
      =====================================
      CONTROLES DE VISTA Y ACCIONES MASIVAS
      =====================================
    -->
    <div class="view-controls">
      <!-- Selector de modo de visualización -->
      <div class="view-options">
        <!-- Vista de tarjetas (más visual y detallada) -->
        <button 
          :class="['view-btn', { active: viewMode === 'cards' }]"
          @click="setViewMode('cards')"
        >
          🃏 Tarjetas
        </button>
        <!-- Vista de tabla (más compacta y funcional) -->
        <button 
          :class="['view-btn', { active: viewMode === 'table' }]"
          @click="setViewMode('table')"
        >
          📋 Tabla
        </button>
        <!-- Vista de cronología (ordenada por fechas) -->
        <button 
          :class="['view-btn', { active: viewMode === 'timeline' }]"
          @click="setViewMode('timeline')"
        >
          📅 Cronología
        </button>
      </div>

      <!-- Acciones masivas (aparecen cuando hay facturas seleccionadas) -->
      <div class="bulk-actions" v-if="selectedInvoices.length > 0">
        <span class="selection-info">{{ selectedInvoices.length }} seleccionadas</span>
        <!-- Marcar múltiples facturas como pagadas -->
        <button class="btn-action" @click="markAsPaid">✅ Marcar Pagadas</button>
        <!-- Enviar recordatorios de pago masivos -->
        <button class="btn-action" @click="sendReminders">📧 Enviar Recordatorios</button>
        <!-- Eliminar múltiples facturas (con confirmación) -->
        <button class="btn-action danger" @click="bulkDelete">🗑️ Eliminar</button>
      </div>

      <!-- Control de paginación -->
      <div class="items-per-page">
        <label>Mostrar:</label>
        <select v-model="itemsPerPage" @change="changeItemsPerPage">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>por página</span>
      </div>
    </div>

    <!-- 
      ===============================
      SECCIÓN PRINCIPAL DE FACTURAS
      ===============================
    -->
    <div class="invoices-section">
      <!-- Estado de carga mientras se obtienen datos -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando facturas...</p>
      </div>
      
      <!-- Estado vacío cuando no hay resultados -->
      <div v-else-if="filteredInvoices.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>{{ searchQuery ? 'No se encontraron facturas' : 'No hay facturas registradas' }}</h3>
        <p v-if="searchQuery">
          No hay facturas que coincidan con los criterios de búsqueda
        </p>
        <div class="empty-actions">
          <!-- Opción para limpiar filtros si hay búsqueda activa -->
          <button v-if="searchQuery" class="btn-secondary" @click="clearAllFilters">
            🔄 Limpiar filtros
          </button>
          <!-- Crear primera cotización (que puede convertirse en factura) -->
          <button class="btn-primary" @click="goToCreateQuotation">
            ➕ {{ searchQuery ? 'Crear cotización' : 'Crear primera cotización' }}
          </button>
        </div>
      </div>

      <!-- 
        =============================
        VISTA DE TARJETAS
        =============================
        Muestra cada factura como una tarjeta visual con toda la información
      -->
      <div v-else-if="viewMode === 'cards'" class="invoices-cards">
        <div 
          v-for="invoice in paginatedInvoices" 
          :key="invoice.id" 
          :class="[
            'invoice-card', 
            `status-${invoice.payment_status}`, 
            { selected: selectedInvoices.includes(invoice.id) }
          ]"
          @click="toggleInvoiceSelection(invoice.id)"
        >
          <!-- Encabezado de la tarjeta con número y estado -->
          <div class="card-header">
            <div class="invoice-number">
              <span class="number-label">Factura</span>
              <span class="number-value">#{{ invoice.invoice_number }}</span>
            </div>
            <div class="card-actions">
              <!-- Badge de estado de pago -->
              <span :class="['status-badge', `status-${invoice.payment_status}`]">
                {{ getPaymentStatusIcon(invoice.payment_status) }} 
                {{ getPaymentStatusText(invoice.payment_status) }}
              </span>
              <!-- Indicador de urgencia para facturas vencidas -->
              <div class="urgency-indicator" v-if="isOverdue(invoice)">
                🚨 {{ getDaysOverdue(invoice) }} días vencida
              </div>
            </div>
          </div>

          <!-- Información del cliente -->
          <div class="card-client">
            <h3>{{ invoice.client_name }}</h3>
            <p class="client-nit">NIT: {{ invoice.client_nit }}</p>
          </div>

          <!-- Información financiera en grid -->
          <div class="card-financial">
            <div class="financial-grid">
              <!-- Total de la factura -->
              <div class="financial-item">
                <span class="financial-label">💰 Total:</span>
                <span class="financial-value">${{ formatCurrency(invoice.total_amount) }}</span>
              </div>
              <!-- Monto ya pagado -->
              <div class="financial-item">
                <span class="financial-label">💳 Pagado:</span>
                <span class="financial-value">${{ formatCurrency(invoice.paid_amount) }}</span>
              </div>
              <!-- Monto pendiente por pagar -->
              <div class="financial-item">
                <span class="financial-label">⏳ Pendiente:</span>
                <span class="financial-value pending">${{ formatCurrency(invoice.pending_amount) }}</span>
              </div>
              <!-- Fecha de vencimiento -->
              <div class="financial-item">
                <span class="financial-label">📅 Vence:</span>
                <span :class="['financial-value', { overdue: isOverdue(invoice) }]">
                  {{ formatDate(invoice.due_date) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Resumen de productos facturados -->
          <div class="card-products">
            <div class="products-summary">
              <span class="products-count">📦 {{ invoice.products?.length || 0 }} productos</span>
              <span class="products-total">{{ getTotalQuantity(invoice) }} unidades</span>
            </div>
          </div>

          <!-- Acciones disponibles para esta factura -->
          <div class="card-footer">
            <!-- Ver detalle completo de la factura -->
            <button class="action-btn primary" @click.stop="viewInvoiceDetail(invoice)">
              👁️ Ver Detalle
            </button>
            <!-- Registrar pago (solo si no está completamente pagada) -->
            <button 
              v-if="invoice.payment_status !== 'paid'" 
              class="action-btn success" 
              @click.stop="recordPayment(invoice)"
            >
              💰 Registrar Pago
            </button>
            <!-- Enviar factura por email -->
            <button class="action-btn info" @click.stop="sendInvoiceEmail(invoice)">
              📧 Enviar
            </button>
            <!-- Imprimir factura -->
            <button class="action-btn secondary" @click.stop="printInvoice(invoice)">
              🖨️ Imprimir
            </button>
            <!-- Menú de acciones adicionales -->
            <div class="dropdown" v-if="getAvailableActions(invoice).length > 0">
              <button class="action-btn dropdown-toggle" @click.stop="toggleActionsMenu(invoice.id)">
                ⋮
              </button>
              <div v-if="activeActionsMenu === invoice.id" class="dropdown-menu">
                <button 
                  v-for="action in getAvailableActions(invoice)" 
                  :key="action.key"
                  class="dropdown-item"
                  @click.stop="executeAction(action.key, invoice)"
                >
                  {{ action.icon }} {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 
        =============================
        VISTA DE TABLA
        =============================
        Formato tabular compacto para gestión masiva
      -->
      <div v-else-if="viewMode === 'table'" class="invoices-table">
        <table>
          <thead>
            <tr>
              <!-- Checkbox para selección masiva -->
              <th class="select-column">
                <input 
                  type="checkbox" 
                  :checked="allSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <!-- Columnas ordenables (click para ordenar) -->
              <th @click="setSortBy('invoice_number')">
                # Factura {{ sortBy === 'invoice_number' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th @click="setSortBy('client_name')">
                Cliente {{ sortBy === 'client_name' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th @click="setSortBy('invoice_date')">
                Fecha {{ sortBy === 'invoice_date' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th @click="setSortBy('due_date')">
                Vencimiento {{ sortBy === 'due_date' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th @click="setSortBy('total_amount')">
                Total {{ sortBy === 'total_amount' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th @click="setSortBy('payment_status')">
                Estado {{ sortBy === 'payment_status' ? (sortDirection === 'asc' ? '⬆️' : '⬇️') : '' }}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="invoice in paginatedInvoices" 
              :key="invoice.id"
              :class="{ 
                selected: selectedInvoices.includes(invoice.id),
                overdue: isOverdue(invoice) && invoice.payment_status !== 'paid'
              }"
            >
              <!-- Checkbox individual -->
              <td>
                <input 
                  type="checkbox" 
                  :checked="selectedInvoices.includes(invoice.id)"
                  @change="toggleInvoiceSelection(invoice.id)"
                />
              </td>
              <!-- Número de factura con indicador de vencimiento -->
              <td>
                <strong>#{{ invoice.invoice_number }}</strong>
                <div v-if="isOverdue(invoice)" class="overdue-indicator">
                  🚨 {{ getDaysOverdue(invoice) }}d
                </div>
              </td>
              <!-- Información del cliente -->
              <td>
                <div class="client-info">
                  <strong>{{ invoice.client_name }}</strong>
                  <small>{{ invoice.client_nit }}</small>
                </div>
              </td>
              <!-- Fecha de facturación -->
              <td>{{ formatDate(invoice.invoice_date) }}</td>
              <!-- Fecha de vencimiento (con estilo especial si está vencida) -->
              <td :class="{ overdue: isOverdue(invoice) }">
                {{ formatDate(invoice.due_date) }}
              </td>
              <!-- Información de montos -->
              <td>
                <div class="amount-breakdown">
                  <strong>${{ formatCurrency(invoice.total_amount) }}</strong>
                  <small v-if="invoice.pending_amount > 0">
                    Pend: ${{ formatCurrency(invoice.pending_amount) }}
                  </small>
                </div>
              </td>
              <!-- Estado de pago -->
              <td>
                <span :class="['status-badge', `status-${invoice.payment_status}`]">
                  {{ getPaymentStatusIcon(invoice.payment_status) }} 
                  {{ getPaymentStatusText(invoice.payment_status) }}
                </span>
              </td>
              <!-- Acciones rápidas -->
              <td>
                <div class="table-actions">
                  <button class="table-btn view" @click="viewInvoiceDetail(invoice)" title="Ver">👁️</button>
                  <button 
                    v-if="invoice.payment_status !== 'paid'" 
                    class="table-btn pay" 
                    @click="recordPayment(invoice)" 
                    title="Pago"
                  >💰</button>
                  <button class="table-btn email" @click="sendInvoiceEmail(invoice)" title="Email">📧</button>
                  <button class="table-btn print" @click="printInvoice(invoice)" title="Imprimir">🖨️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 
        =============================
        VISTA DE CRONOLOGÍA
        =============================
        Organiza facturas por fecha en formato timeline
      -->
      <div v-else-if="viewMode === 'timeline'" class="invoices-timeline">
        <div 
          v-for="(group, date) in groupedByDate" 
          :key="date" 
          class="timeline-group"
        >
          <!-- Encabezado del grupo por fecha -->
          <div class="timeline-date">
            <h3>{{ formatTimelineDate(date) }}</h3>
            <span class="group-summary">
              {{ group.length }} facturas • ${{ formatCurrency(getGroupTotal(group)) }}
            </span>
          </div>
          <!-- Items de facturas en esta fecha -->
          <div class="timeline-items">
            <div 
              v-for="invoice in group" 
              :key="invoice.id"
              :class="['timeline-item', `status-${invoice.payment_status}`]"
            >
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="invoice-number">#{{ invoice.invoice_number }}</span>
                  <span class="client-name">{{ invoice.client_name }}</span>
                  <span class="amount">${{ formatCurrency(invoice.total_amount) }}</span>
                  <span :class="['status-badge', `status-${invoice.payment_status}`]">
                    {{ getPaymentStatusText(invoice.payment_status) }}
                  </span>
                </div>
                <div class="timeline-actions">
                  <button class="timeline-btn" @click="viewInvoiceDetail(invoice)">Ver</button>
                  <button 
                    v-if="invoice.payment_status !== 'paid'" 
                    class="timeline-btn" 
                    @click="recordPayment(invoice)"
                  >Pagar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 
      ===============================
      PAGINACIÓN AVANZADA
      ===============================
    -->
    <div v-if="totalPages > 1" class="pagination-panel">
      <!-- Información de la paginación actual -->
      <div class="pagination-info">
        Mostrando {{ startItem }} - {{ endItem }} de {{ filteredInvoices.length }} facturas
      </div>
      <!-- Controles de navegación entre páginas -->
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
        
        <!-- Números de página visibles -->
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

    <!-- 
      ===============================
      MODAL DE DETALLE DE FACTURA
      ===============================
      Muestra información completa de una factura específica
    -->
    <div v-if="invoiceToView" class="modal-overlay" @click="closeInvoiceDetail">
      <div class="modal-content invoice-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>🧾 Factura #{{ invoiceToView.invoice_number }}</h3>
          <button class="modal-close" @click="closeInvoiceDetail">✕</button>
        </div>
        
        <div class="invoice-detail-content">
          <!-- Información general de la factura -->
          <div class="detail-section">
            <h4>📋 Información General</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Cliente:</strong>
                <p>{{ invoiceToView.client_name }}</p>
              </div>
              <div class="detail-item">
                <strong>NIT:</strong>
                <p>{{ invoiceToView.client_nit }}</p>
              </div>
              <div class="detail-item">
                <strong>Fecha Factura:</strong>
                <p>{{ formatDate(invoiceToView.invoice_date) }}</p>
              </div>
              <div class="detail-item">
                <strong>Fecha Vencimiento:</strong>
                <p>{{ formatDate(invoiceToView.due_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Lista detallada de productos facturados -->
          <div class="detail-section">
            <h4>📦 Productos Facturados</h4>
            <div class="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in invoiceToView.products" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>${{ formatCurrency(product.unit_price) }}</td>
                    <td>${{ formatCurrency(product.total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resumen financiero detallado -->
          <div class="detail-section">
            <h4>💰 Resumen Financiero</h4>
            <div class="financial-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{ formatCurrency(invoiceToView.subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>IVA ({{ invoiceToView.tax_rate }}%):</span>
                <span>${{ formatCurrency(invoiceToView.tax_amount) }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>${{ formatCurrency(invoiceToView.total_amount) }}</span>
              </div>
              <div class="summary-row paid">
                <span>Pagado:</span>
                <span>${{ formatCurrency(invoiceToView.paid_amount) }}</span>
              </div>
              <div class="summary-row pending">
                <span>Pendiente:</span>
                <span>${{ formatCurrency(invoiceToView.pending_amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Historial de pagos realizados -->
          <div v-if="invoiceToView.payments?.length > 0" class="detail-section">
            <h4>💳 Historial de Pagos</h4>
            <div class="payments-history">
              <div 
                v-for="payment in invoiceToView.payments" 
                :key="payment.id"
                class="payment-item"
              >
                <div class="payment-info">
                  <span class="payment-date">{{ formatDate(payment.date) }}</span>
                  <span class="payment-amount">${{ formatCurrency(payment.amount) }}</span>
                  <span class="payment-method">{{ payment.method }}</span>
                </div>
                <div class="payment-actions">
                  <button class="payment-btn" @click="viewPaymentDetail(payment)">Ver</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Acciones disponibles para esta factura -->
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeInvoiceDetail">Cerrar</button>
          <button class="btn-info" @click="printInvoice(invoiceToView)">🖨️ Imprimir</button>
          <button class="btn-primary" @click="sendInvoiceEmail(invoiceToView)">📧 Enviar</button>
          <button 
            v-if="invoiceToView.payment_status !== 'paid'" 
            class="btn-success" 
            @click="recordPayment(invoiceToView)"
          >
            💰 Registrar Pago
          </button>
        </div>
      </div>
    </div>

    <!-- 
      ===============================
      MODAL DE REGISTRO DE PAGO
      ===============================
      Formulario para registrar pagos parciales o totales
    -->
    <div v-if="paymentModal.show" class="modal-overlay" @click="closePaymentModal">
      <div class="modal-content payment-modal" @click.stop>
        <div class="modal-header">
          <h3>💰 Registrar Pago - Factura #{{ paymentModal.invoice.invoice_number }}</h3>
          <button class="modal-close" @click="closePaymentModal">✕</button>
        </div>
        
        <form @submit.prevent="processPayment" class="payment-form">
          <!-- Información de contexto de la factura -->
          <div class="payment-info">
            <div class="info-item">
              <strong>Cliente:</strong> {{ paymentModal.invoice.client_name }}
            </div>
            <div class="info-item">
              <strong>Total Factura:</strong> ${{ formatCurrency(paymentModal.invoice.total_amount) }}
            </div>
            <div class="info-item">
              <strong>Ya Pagado:</strong> ${{ formatCurrency(paymentModal.invoice.paid_amount) }}
            </div>
            <div class="info-item pending">
              <strong>Pendiente:</strong> ${{ formatCurrency(paymentModal.invoice.pending_amount) }}
            </div>
          </div>

          <!-- Campos del formulario de pago -->
          <div class="payment-fields">
            <!-- Monto del pago con botones de porcentaje rápido -->
            <div class="field-group">
              <label>Monto del Pago *</label>
              <input 
                v-model="paymentForm.amount" 
                type="number" 
                step="0.01"
                :max="paymentModal.invoice.pending_amount"
                required 
                placeholder="0.00"
              />
              <!-- Botones para pago rápido por porcentajes -->
              <div class="quick-amounts">
                <button 
                  type="button"
                  v-for="percentage in [25, 50, 75, 100]"
                  :key="percentage"
                  class="quick-amount"
                  @click="setQuickAmount(percentage)"
                >
                  {{ percentage }}%
                </button>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="field-group">
              <label>Método de Pago *</label>
              <select v-model="paymentForm.method" required>
                <option value="">Seleccionar método</option>
                <option value="efectivo">💵 Efectivo</option>
                <option value="transferencia">🏦 Transferencia</option>
                <option value="cheque">📝 Cheque</option>
                <option value="tarjeta">💳 Tarjeta</option>
                <option value="otro">🔄 Otro</option>
              </select>
            </div>

            <!-- Fecha en que se realizó el pago -->
            <div class="field-group">
              <label>Fecha de Pago *</label>
              <input v-model="paymentForm.date" type="date" required />
            </div>

            <!-- Número de referencia del pago -->
            <div class="field-group">
              <label>Número de Referencia</label>
              <input v-model="paymentForm.reference" type="text" placeholder="Ej: Transferencia #123456" />
            </div>

            <!-- Observaciones adicionales -->
            <div class="field-group full-width">
              <label>Observaciones</label>
              <textarea v-model="paymentForm.notes" rows="3" placeholder="Notas adicionales sobre el pago..."></textarea>
            </div>
          </div>
          
          <!-- Acciones del formulario -->
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closePaymentModal">
              Cancelar
            </button>
            <button type="submit" class="btn-success" :disabled="isProcessingPayment">
              {{ isProcessingPayment ? '💾 Procesando...' : '💰 Registrar Pago' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoiceReadView',
  
  data() {
    return {
      // ==========================================
      // ESTADOS DE CARGA Y CONTROL DE UI
      // ==========================================
      
      /** Estado de carga principal para mostrar spinner */
      isLoading: false,
      
      /** Estado de procesamiento de pagos para deshabilitar botones */
      isProcessingPayment: false,
      
      // ==========================================
      // FILTROS Y BÚSQUEDA
      // ==========================================
      
      /** Término de búsqueda libre por texto */
      searchQuery: '',
      
      /** Estado de pago seleccionado para filtrar */
      selectedPaymentStatus: '',
      
      /** Cliente específico seleccionado en filtros */
      selectedClient: '',
      
      /** Rango de fechas predefinido seleccionado */
      dateRange: '',
      
      /** Fecha personalizada desde (para filtro custom) */
      customDateFrom: '',
      
      /** Fecha personalizada hasta (para filtro custom) */
      customDateTo: '',
      
      /** Monto mínimo para filtrar facturas */
      minAmount: '',
      
      /** Monto máximo para filtrar facturas */
      maxAmount: '',
      
      // ==========================================
      // ORDENAMIENTO
      // ==========================================
      
      /** Campo por el cual ordenar las facturas */
      sortBy: 'invoice_date',
      
      /** Dirección del ordenamiento (asc/desc) */
      sortDirection: 'desc',
      
      // ==========================================
      // PAGINACIÓN
      // ==========================================
      
      /** Página actual en la paginación */
      currentPage: 1,
      
      /** Número de items a mostrar por página */
      itemsPerPage: 25,
      
      // ==========================================
      // VISTA Y SELECCIÓN
      // ==========================================
      
      /** Modo de vista actual: 'cards', 'table', 'timeline' */
      viewMode: 'cards',
      
      /** Array de IDs de facturas seleccionadas para acciones masivas */
      selectedInvoices: [],
      
      /** ID del menú de acciones activo (dropdown) */
      activeActionsMenu: null,
      
      // ==========================================
      // MODALES
      // ==========================================
      
      /** Factura seleccionada para ver detalle completo */
      invoiceToView: null,
      
      /** Configuración del modal de registro de pago */
      paymentModal: {
        show: false,
        invoice: null
      },
      
      /** Formulario de registro de pago */
      paymentForm: {
        amount: '',
        method: '',
        date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        reference: '',
        notes: ''
      },
      
      // ==========================================
      // CONFIGURACIÓN DE FILTROS
      // ==========================================
      
      /** Estados de pago disponibles para filtrar */
      paymentStatuses: [
        { value: '', label: 'Todas', icon: '📋' },
        { value: 'paid', label: 'Pagadas', icon: '✅' },
        { value: 'pending', label: 'Pendientes', icon: '⏳' },
        { value: 'partial', label: 'Parciales', icon: '🔄' },
        { value: 'overdue', label: 'Vencidas', icon: '🚨' },
        { value: 'cancelled', label: 'Canceladas', icon: '❌' }
      ],
      
      /** Lista de clientes disponibles para filtro (se carga dinámicamente) */
      availableClients: [
        { id: 1, name: 'Constructora Los Andes S.A.S' },
        { id: 2, name: 'Ferreterías del Valle LTDA' },
        { id: 3, name: 'Distribuidora Industrial del Norte' },
        { id: 4, name: 'Comercializadora Caribe S.A.' },
        { id: 5, name: 'Suministros Técnicos Santander' },
        { id: 6, name: 'Importaciones y Exportaciones del Pacífico' },
        { id: 7, name: 'Textiles y Confecciones Andinas' }
      ],
      
      // ==========================================
      // DATOS DE FACTURAS (SIMULADOS)
      // ==========================================
      
      /** 
       * Array principal de facturas con toda la información
       * En producción, estos datos vendrían de una API
       */
      invoices: [
        {
          id: 1,
          invoice_number: 'INV-2024-001',
          client_id: 1,
          client_name: 'Constructora Los Andes S.A.S',
          client_nit: '900123456-7',
          invoice_date: '2024-06-01T00:00:00Z',
          due_date: '2024-07-01T00:00:00Z',
          payment_terms: 30, // días
          subtotal: 2500000,
          tax_rate: 19,
          tax_amount: 475000,
          total_amount: 2975000,
          paid_amount: 2975000,
          pending_amount: 0,
          payment_status: 'paid',
          created_at: '2024-06-01T09:30:00Z',
          updated_at: '2024-06-15T14:22:00Z',
          // Productos incluidos en la factura
          products: [
            {
              id: 1,
              name: 'Cemento Portland Tipo I x 50kg',
              quantity: 100,
              unit_price: 25000,
              total: 2500000
            }
          ],
          // Historial de pagos realizados
          payments: [
            {
              id: 1,
              date: '2024-06-15T00:00:00Z',
              amount: 2975000,
              method: 'transferencia',
              reference: 'TRF-789123',
              notes: 'Pago completo por transferencia bancaria'
            }
          ]
        },
        {
          id: 2,
          invoice_number: 'INV-2024-002',
          client_id: 2,
          client_name: 'Ferreterías del Valle LTDA',
          client_nit: '800987654-3',
          invoice_date: '2024-06-05T00:00:00Z',
          due_date: '2024-07-05T00:00:00Z',
          payment_terms: 30,
          subtotal: 1800000,
          tax_rate: 19,
          tax_amount: 342000,
          total_amount: 2142000,
          paid_amount: 1000000,
          pending_amount: 1142000,
          payment_status: 'partial',
          created_at: '2024-06-05T11:45:00Z',
          updated_at: '2024-06-10T16:30:00Z',
          products: [
            {
              id: 2,
              name: 'Tornillos Autorroscantes 1/2"',
              quantity: 500,
              unit_price: 1200,
              total: 600000
            },
            {
              id: 3,
              name: 'Taladro Percutor 13mm',
              quantity: 4,
              unit_price: 300000,
              total: 1200000
            }
          ],
          payments: [
            {
              id: 2,
              date: '2024-06-10T00:00:00Z',
              amount: 1000000,
              method: 'efectivo',
              reference: 'EFE-001',
              notes: 'Pago parcial en efectivo'
            }
          ]
        },
        {
          id: 3,
          invoice_number: 'INV-2024-003',
          client_id: 3,
          client_name: 'Distribuidora Industrial del Norte',
          client_nit: '700456789-1',
          invoice_date: '2024-05-20T00:00:00Z',
          due_date: '2024-06-19T00:00:00Z', // Vencida
          payment_terms: 30,
          subtotal: 4200000,
          tax_rate: 19,
          tax_amount: 798000,
          total_amount: 4998000,
          paid_amount: 0,
          pending_amount: 4998000,
          payment_status: 'overdue',
          created_at: '2024-05-20T08:15:00Z',
          updated_at: '2024-05-20T08:15:00Z',
          products: [
            {
              id: 4,
              name: 'Motor Eléctrico 5HP Trifásico',
              quantity: 2,
              unit_price: 1800000,
              total: 3600000
            },
            {
              id: 5,
              name: 'Variador de Frecuencia 5HP',
              quantity: 1,
              unit_price: 600000,
              total: 600000
            }
          ],
          payments: []
        }
      ]
    }
  },
  
  computed: {
    // ==========================================
    // MÉTRICAS FINANCIERAS CALCULADAS
    // ==========================================
    
    /**
     * Calcula el total de dinero ya cobrado
     * Suma todos los paid_amount de las facturas
     */
    totalPaid() {
      return this.invoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0)
    },
    
    /**
     * Calcula el total pendiente por cobrar
     * Suma todos los pending_amount de las facturas
     */
    totalPending() {
      return this.invoices.reduce((sum, invoice) => sum + invoice.pending_amount, 0)
    },
    
    /**
     * Calcula el total de facturas vencidas
     * Suma pending_amount de facturas con estado 'overdue'
     */
    totalOverdue() {
      return this.invoices
        .filter(invoice => invoice.payment_status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.pending_amount, 0)
    },
    
    /**
     * Calcula el porcentaje de efectividad en cobros
     * (Total cobrado / Total facturado) * 100
     */
    averageTicket() {
      const totalAmount = this.invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
      if (totalAmount === 0) return 0
      return Math.round((this.totalPaid / totalAmount) * 100)
    },
    
    // ==========================================
    // FILTRADO PRINCIPAL DE FACTURAS
    // ==========================================
    
    /**
     * Aplica todos los filtros a las facturas
     * Combina búsqueda por texto, filtros de estado, fecha, cliente y monto
     */
    filteredInvoices() {
      let filtered = [...this.invoices]
      
      // Filtro por búsqueda de texto libre
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(invoice => 
          // Buscar en número de factura
          invoice.invoice_number.toLowerCase().includes(query) ||
          // Buscar en nombre del cliente
          invoice.client_name.toLowerCase().includes(query) ||
          // Buscar en NIT del cliente
          invoice.client_nit.includes(query) ||
          // Buscar en monto total (convertido a string)
          invoice.total_amount.toString().includes(query)
        )
      }
      
      // Filtro por estado de pago
      if (this.selectedPaymentStatus) {
        filtered = filtered.filter(invoice => invoice.payment_status === this.selectedPaymentStatus)
      }
      
      // Filtro por cliente específico
      if (this.selectedClient) {
        filtered = filtered.filter(invoice => invoice.client_id === parseInt(this.selectedClient))
      }
      
      // Filtro por rango de fechas
      if (this.dateRange) {
        const now = new Date()
        
        filtered = filtered.filter(invoice => {
          const date = new Date(invoice.invoice_date)
          
          switch (this.dateRange) {
            case 'today':
              // Facturas del día actual
              return date.toDateString() === now.toDateString()
            case 'week': {
              // Facturas de los últimos 7 días
              const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
              return date >= weekAgo
            }
            case 'month':
              // Facturas del mes actual
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            case 'quarter': {
              // Facturas del trimestre actual
              const currentQuarter = Math.floor(now.getMonth() / 3)
              const invoiceQuarter = Math.floor(date.getMonth() / 3)
              return invoiceQuarter === currentQuarter && date.getFullYear() === now.getFullYear()
            }
            case 'year':
              // Facturas del año actual
              return date.getFullYear() === now.getFullYear()
            case 'custom':
              // Rango personalizado
              if (this.customDateFrom && this.customDateTo) {
                const fromDate = new Date(this.customDateFrom)
                const toDate = new Date(this.customDateTo)
                return date >= fromDate && date <= toDate
              }
              return true
            default:
              return true
          }
        })
      }
      
      // Filtro por rango de montos
      if (this.minAmount !== '') {
        filtered = filtered.filter(invoice => invoice.total_amount >= parseFloat(this.minAmount))
      }
      
      if (this.maxAmount !== '') {
        filtered = filtered.filter(invoice => invoice.total_amount <= parseFloat(this.maxAmount))
      }
      
      // Aplicar ordenamiento
      return this.sortInvoices(filtered)
    },
    
    /**
     * Suma total de las facturas filtradas
     */
    filteredTotal() {
      return this.filteredInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
    },
    
    /**
     * Promedio de valor de las facturas filtradas
     */
    filteredAverage() {
      if (this.filteredInvoices.length === 0) return 0
      return this.filteredTotal / this.filteredInvoices.length
    },
    
    // ==========================================
    // PAGINACIÓN
    // ==========================================
    
    /**
     * Facturas a mostrar en la página actual
     */
    paginatedInvoices() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredInvoices.slice(start, start + this.itemsPerPage)
    },
    
    /**
     * Número total de páginas
     */
    totalPages() {
      return Math.ceil(this.filteredInvoices.length / this.itemsPerPage)
    },
    
    /**
     * Número del primer item mostrado
     */
    startItem() {
      return Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.filteredInvoices.length)
    },
    
    /**
     * Número del último item mostrado
     */
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredInvoices.length)
    },
    
    /**
     * Páginas visibles en el control de paginación
     */
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
    
    // ==========================================
    // ESTADO DE FILTROS Y SELECCIÓN
    // ==========================================
    
    /**
     * Verifica si hay filtros activos
     */
    hasActiveFilters() {
      return !!(
        this.searchQuery || 
        this.selectedPaymentStatus || 
        this.selectedClient || 
        this.dateRange ||
        this.minAmount !== '' ||
        this.maxAmount !== ''
      )
    },
    
    /**
     * Verifica si todas las facturas visibles están seleccionadas
     */
    allSelected() {
      if (this.paginatedInvoices.length === 0) return false
      return this.paginatedInvoices.every(invoice => 
        this.selectedInvoices.includes(invoice.id)
      )
    },
    
    /**
     * Agrupa facturas por fecha para vista de cronología
     */
    groupedByDate() {
      const groups = {}
      
      this.filteredInvoices.forEach(invoice => {
        const date = new Date(invoice.invoice_date).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(invoice)
      })
      
      return groups
    }
  },
  
  methods: {
    // ==========================================
    // MÉTODOS DE BÚSQUEDA Y FILTROS
    // ==========================================
    
    /**
     * Maneja cambios en la búsqueda por texto
     * Resetea la página actual para mostrar resultados desde el inicio
     */
    handleSearch() {
      this.currentPage = 1
      console.log('🔍 Búsqueda actualizada:', this.searchQuery)
    },
    
    /**
     * Ejecuta búsqueda explícita (Enter o botón)
     */
    performSearch() {
      this.handleSearch()
      console.log('🎯 Búsqueda ejecutada:', this.searchQuery)
    },
    
    /**
     * Establece filtro por estado de pago
     * Si se selecciona el mismo estado, lo deselecciona
     */
    setPaymentStatusFilter(status) {
      this.selectedPaymentStatus = this.selectedPaymentStatus === status ? '' : status
      this.currentPage = 1
      console.log('📊 Filtro de estado de pago:', status || 'todos')
    },
    
    /**
     * Aplica filtros y resetea página
     */
    applyFilters() {
      this.currentPage = 1
      console.log('🔧 Filtros aplicados')
    },
    
    /**
     * Limpia todos los filtros activos
     */
    clearAllFilters() {
      this.searchQuery = ''
      this.selectedPaymentStatus = ''
      this.selectedClient = ''
      this.dateRange = ''
      this.customDateFrom = ''
      this.customDateTo = ''
      this.minAmount = ''
      this.maxAmount = ''
      this.currentPage = 1
      console.log('🗑️ Todos los filtros limpiados')
    },
    
    // ==========================================
    // MÉTODOS DE ORDENAMIENTO
    // ==========================================
    
    /**
     * Función para ordenar facturas según criterio seleccionado
     */
    sortInvoices(invoices) {
      return [...invoices].sort((a, b) => {
        let aValue, bValue
        
        // Determinar valores a comparar según el criterio de ordenamiento
        switch (this.sortBy) {
          case 'invoice_number':
            aValue = a.invoice_number.toLowerCase()
            bValue = b.invoice_number.toLowerCase()
            break
          case 'client_name':
            aValue = a.client_name.toLowerCase()
            bValue = b.client_name.toLowerCase()
            break
          case 'invoice_date':
          case 'due_date':
            aValue = new Date(a[this.sortBy])
            bValue = new Date(b[this.sortBy])
            break
          case 'total_amount':
          case 'paid_amount':
          case 'pending_amount':
            aValue = a[this.sortBy]
            bValue = b[this.sortBy]
            break
          case 'payment_status': {
            // Orden específico para estados de pago
            const statusOrder = { 'overdue': 0, 'pending': 1, 'partial': 2, 'paid': 3, 'cancelled': 4 }
            aValue = statusOrder[a.payment_status] || 999
            bValue = statusOrder[b.payment_status] || 999
            break
          }
          default:
            aValue = a[this.sortBy]
            bValue = b[this.sortBy]
        }
        
        // Aplicar dirección de ordenamiento
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1
        return 0
      })
    },
    
    /**
     * Aplica ordenamiento actual
     */
    applySorting() {
      console.log('📊 Ordenando por:', this.sortBy, this.sortDirection)
    },
    
    /**
     * Establece campo de ordenamiento
     * Si es el mismo campo, cambia la dirección
     */
    setSortBy(field) {
      if (this.sortBy === field) {
        this.toggleSortDirection()
      } else {
        this.sortBy = field
        this.sortDirection = 'asc'
      }
      console.log('🔀 Orden cambiado:', field, this.sortDirection)
    },
    
    /**
     * Alterna dirección de ordenamiento
     */
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      console.log('🔄 Dirección de orden:', this.sortDirection)
    },
    
    // ==========================================
    // MÉTODOS DE VISTA
    // ==========================================
    
    /**
     * Cambia el modo de visualización
     */
    setViewMode(mode) {
      this.viewMode = mode
      this.selectedInvoices = [] // Limpiar selección al cambiar vista
      this.activeActionsMenu = null // Cerrar menús abiertos
      console.log('👁️ Modo de vista:', mode)
    },
    
    /**
     * Cambia número de items por página
     */
    changeItemsPerPage() {
      this.currentPage = 1
      console.log('📄 Items por página:', this.itemsPerPage)
    },
    
    /**
     * Muestra/oculta menú de acciones de una factura
     */
    toggleActionsMenu(invoiceId) {
      this.activeActionsMenu = this.activeActionsMenu === invoiceId ? null : invoiceId
      console.log('⚙️ Menú de acciones:', invoiceId)
    },
    
    // ==========================================
    // MÉTODOS DE SELECCIÓN
    // ==========================================
    
    /**
     * Alterna selección de una factura individual
     */
    toggleInvoiceSelection(invoiceId) {
      const index = this.selectedInvoices.indexOf(invoiceId)
      if (index > -1) {
        this.selectedInvoices.splice(index, 1)
      } else {
        this.selectedInvoices.push(invoiceId)
      }
      console.log('☑️ Selección factura:', invoiceId, this.selectedInvoices.length, 'seleccionadas')
    },
    
    /**
     * Selecciona/deselecciona todas las facturas visibles
     */
    toggleSelectAll() {
      if (this.allSelected) {
        // Deseleccionar todas las visibles
        this.paginatedInvoices.forEach(invoice => {
          const index = this.selectedInvoices.indexOf(invoice.id)
          if (index > -1) {
            this.selectedInvoices.splice(index, 1)
          }
        })
      } else {
        // Seleccionar todas las visibles que no estén ya seleccionadas
        this.paginatedInvoices.forEach(invoice => {
          if (!this.selectedInvoices.includes(invoice.id)) {
            this.selectedInvoices.push(invoice.id)
          }
        })
      }
      console.log('☑️ Selección masiva:', this.selectedInvoices.length, 'facturas')
    },
    
    // ==========================================
    // MÉTODOS DE PAGINACIÓN
    // ==========================================
    
    /**
     * Navega a una página específica
     */
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        console.log('📄 Página:', page)
        
        // Scroll suave al inicio de la sección
        this.$nextTick(() => {
          const invoicesSection = this.$el.querySelector('.invoices-section')
          if (invoicesSection) {
            invoicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    },
    
    // ==========================================
    // MÉTODOS DE DATOS AUXILIARES
    // ==========================================
    
    /**
     * Cuenta facturas por estado de pago
     */
    getPaymentStatusCount(status) {
      if (!status) return this.invoices.length
      return this.invoices.filter(invoice => invoice.payment_status === status).length
    },
    
    /**
     * Obtiene ícono para estado de pago
     */
    getPaymentStatusIcon(status) {
      const icons = {
        paid: '✅',
        pending: '⏳',
        partial: '🔄',
        overdue: '🚨',
        cancelled: '❌'
      }
      return icons[status] || '❓'
    },
    
    /**
     * Obtiene texto legible para estado de pago
     */
    getPaymentStatusText(status) {
      const texts = {
        paid: 'Pagada',
        pending: 'Pendiente',
        partial: 'Parcial',
        overdue: 'Vencida',
        cancelled: 'Cancelada'
      }
      return texts[status] || status
    },
    
    /**
     * Verifica si una factura está vencida
     */
    isOverdue(invoice) {
      if (invoice.payment_status === 'paid') return false
      const dueDate = new Date(invoice.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalizar a inicio del día
      return dueDate < today
    },
    
    /**
     * Calcula días de vencimiento
     */
    getDaysOverdue(invoice) {
      if (!this.isOverdue(invoice)) return 0
      const dueDate = new Date(invoice.due_date)
      const today = new Date()
      const diffTime = today - dueDate
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },
    
    /**
     * Calcula cantidad total de productos en una factura
     */
    getTotalQuantity(invoice) {
      if (!invoice.products) return 0
      return invoice.products.reduce((sum, product) => sum + product.quantity, 0)
    },
    
    /**
     * Formatea montos a formato de moneda
     */
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },
    
    /**
     * Formatea fechas a formato legible
     */
    formatDate(dateString) {
      if (!dateString) return 'Sin fecha'
      
      const date = new Date(dateString)
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
      
      return date.toLocaleDateString('es-ES', options)
    },
    
    /**
     * Formatea fechas para vista de cronología
     */
    formatTimelineDate(dateString) {
      const date = new Date(dateString)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) {
        return 'Hoy'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer'
      } else {
        return this.formatDate(dateString)
      }
    },
    
    /**
     * Calcula total de un grupo de facturas
     */
    getGroupTotal(invoices) {
      return invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
    },
    
    /**
     * Obtiene acciones disponibles para una factura específica
     */
    getAvailableActions(invoice) {
      const actions = []
      
      // Duplicar factura
      actions.push({
        key: 'duplicate',
        icon: '📋',
        label: 'Duplicar'
      })
      
      // Convertir a nota de crédito (solo pagadas)
      if (invoice.payment_status === 'paid') {
        actions.push({
          key: 'credit_note',
          icon: '🔄',
          label: 'Nota de Crédito'
        })
      }
      
      // Cancelar (solo pendientes o parciales)
      if (['pending', 'partial'].includes(invoice.payment_status)) {
        actions.push({
          key: 'cancel',
          icon: '❌',
          label: 'Cancelar'
        })
      }
      
      // Programar recordatorio (no pagadas)
      if (invoice.payment_status !== 'paid') {
        actions.push({
          key: 'schedule_reminder',
          icon: '📅',
          label: 'Programar Recordatorio'
        })
      }
      
      return actions
    },
    
    // ==========================================
    // MÉTODOS DE ACCIONES DE FACTURA
    // ==========================================
    
    /**
     * Muestra detalle completo de una factura
     */
    viewInvoiceDetail(invoice) {
      console.log('👁️ Ver detalle de factura:', invoice.invoice_number)
      this.invoiceToView = invoice
      this.activeActionsMenu = null // Cerrar menús abiertos
    },
    
    /**
     * Cierra modal de detalle de factura
     */
    closeInvoiceDetail() {
      this.invoiceToView = null
      console.log('❌ Cerrar detalle de factura')
    },
    
    /**
     * Abre modal para registrar pago
     */
    recordPayment(invoice) {
      console.log('💰 Registrar pago para factura:', invoice.invoice_number)
      
      // Configurar modal de pago
      this.paymentModal.show = true
      this.paymentModal.invoice = invoice
      
      // Resetear formulario con valores por defecto
      this.paymentForm = {
        amount: invoice.pending_amount, // Por defecto, el monto pendiente completo
        method: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      }
      
      this.activeActionsMenu = null // Cerrar menús abiertos
    },
    
    /**
     * Cierra modal de registro de pago
     */
    closePaymentModal() {
      this.paymentModal.show = false
      this.paymentModal.invoice = null
      this.paymentForm = {
        amount: '',
        method: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      }
      console.log('❌ Cerrar modal de pago')
    },
    
    /**
     * Establece monto rápido por porcentaje
     */
    setQuickAmount(percentage) {
      const pendingAmount = this.paymentModal.invoice.pending_amount
      this.paymentForm.amount = (pendingAmount * percentage / 100).toFixed(2)
      console.log('💰 Monto rápido:', percentage + '%', '=', this.paymentForm.amount)
    },
    
    /**
     * Procesa el registro de pago
     */
    async processPayment() {
      this.isProcessingPayment = true
      
      try {
        console.log('💾 Procesando pago:', this.paymentForm)
        
        // Validaciones
        const amount = parseFloat(this.paymentForm.amount)
        if (amount <= 0 || amount > this.paymentModal.invoice.pending_amount) {
          throw new Error('Monto de pago inválido')
        }
        
        if (!this.paymentForm.method) {
          throw new Error('Debe seleccionar un método de pago')
        }
        
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Crear registro de pago
        const newPayment = {
          id: Date.now(), // ID temporal
          date: this.paymentForm.date,
          amount: amount,
          method: this.paymentForm.method,
          reference: this.paymentForm.reference,
          notes: this.paymentForm.notes
        }
        
        // Actualizar factura
        const invoice = this.paymentModal.invoice
        const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoice.id)
        
        if (invoiceIndex > -1) {
          // Actualizar montos
          this.invoices[invoiceIndex].paid_amount += amount
          this.invoices[invoiceIndex].pending_amount -= amount
          
          // Actualizar estado de pago
          if (this.invoices[invoiceIndex].pending_amount <= 0) {
            this.invoices[invoiceIndex].payment_status = 'paid'
            this.invoices[invoiceIndex].pending_amount = 0 // Asegurar que no sea negativo
          } else {
            this.invoices[invoiceIndex].payment_status = 'partial'
          }
          
          // Agregar pago al historial
          if (!this.invoices[invoiceIndex].payments) {
            this.invoices[invoiceIndex].payments = []
          }
          this.invoices[invoiceIndex].payments.push(newPayment)
          
          // Actualizar fecha de modificación
          this.invoices[invoiceIndex].updated_at = new Date().toISOString()
          
          console.log('✅ Pago registrado exitosamente')
        }
        
        this.closePaymentModal()
        
      } catch (error) {
        console.error('❌ Error procesando pago:', error)
        alert('Error al registrar el pago: ' + error.message)
      } finally {
        this.isProcessingPayment = false
      }
    },
    
    /**
     * Envía factura por email
     */
    sendInvoiceEmail(invoice) {
      console.log('📧 Enviar factura por email:', invoice.invoice_number)
      
      // Simular envío de email
      const subject = encodeURIComponent(`Factura ${invoice.invoice_number} - StackFlow`)
      const body = encodeURIComponent(`
Estimado/a cliente,

Adjunto encontrará la factura ${invoice.invoice_number} por un valor de $${this.formatCurrency(invoice.total_amount)}.

Fecha de vencimiento: ${this.formatDate(invoice.due_date)}
Estado: ${this.getPaymentStatusText(invoice.payment_status)}

Saludos cordiales,
Equipo StackFlow
      `)
      
      // Abrir cliente de email predeterminado
      window.open(`mailto:?subject=${subject}&body=${body}`)
      
      this.activeActionsMenu = null
    },
    
    /**
     * Imprime factura
     */
    printInvoice(invoice) {
      console.log('🖨️ Imprimir factura:', invoice.invoice_number)
      
      // En una aplicación real, esto generaría un PDF o abriría vista de impresión
      alert(`Función de impresión para factura ${invoice.invoice_number}\n\nEn desarrollo: Se integrará con generador de PDF`)
      
      this.activeActionsMenu = null
    },
    
    /**
     * Ejecuta acción específica del menú dropdown
     */
    executeAction(actionKey, invoice) {
      console.log('⚙️ Ejecutar acción:', actionKey, 'en factura:', invoice.invoice_number)
      
      switch (actionKey) {
        case 'duplicate':
          this.duplicateInvoice(invoice)
          break
        case 'credit_note':
          this.createCreditNote(invoice)
          break
        case 'cancel':
          this.cancelInvoice(invoice)
          break
        case 'schedule_reminder':
          this.scheduleReminder(invoice)
          break
        default:
          console.warn('Acción no implementada:', actionKey)
      }
      
      this.activeActionsMenu = null
    },
    
    /**
     * Duplica una factura existente
     */
    duplicateInvoice(invoice) {
      console.log('📋 Duplicar factura:', invoice.invoice_number)
      alert(`Duplicar factura ${invoice.invoice_number}\n\nEsta función creará una nueva cotización basada en esta factura.`)
    },
    
    /**
     * Crea nota de crédito
     */
    createCreditNote(invoice) {
      console.log('🔄 Crear nota de crédito para:', invoice.invoice_number)
      alert(`Crear nota de crédito para factura ${invoice.invoice_number}\n\nEsta función permite reversar total o parcialmente la factura.`)
    },
    
    /**
     * Cancela una factura
     */
    cancelInvoice(invoice) {
      console.log('❌ Cancelar factura:', invoice.invoice_number)
      
      if (confirm(`¿Está seguro de que desea cancelar la factura ${invoice.invoice_number}?\n\nEsta acción no se puede deshacer.`)) {
        // Actualizar estado
        const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoice.id)
        if (invoiceIndex > -1) {
          this.invoices[invoiceIndex].payment_status = 'cancelled'
          this.invoices[invoiceIndex].updated_at = new Date().toISOString()
          console.log('✅ Factura cancelada')
        }
      }
    },
    
    /**
     * Programa recordatorio de pago
     */
    scheduleReminder(invoice) {
      console.log('📅 Programar recordatorio para:', invoice.invoice_number)
      alert(`Programar recordatorio para factura ${invoice.invoice_number}\n\nEsta función permitirá configurar recordatorios automáticos.`)
    },
    
    /**
     * Marca facturas seleccionadas como pagadas
     */
    markAsPaid() {
      console.log('✅ Marcar como pagadas:', this.selectedInvoices.length, 'facturas')
      
      if (confirm(`¿Marcar ${this.selectedInvoices.length} facturas como pagadas?\n\nEsto establecerá el estado como "Pagada" y el monto pagado como el total.`)) {
        this.selectedInvoices.forEach(invoiceId => {
          const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoiceId)
          if (invoiceIndex > -1 && this.invoices[invoiceIndex].payment_status !== 'paid') {
            this.invoices[invoiceIndex].payment_status = 'paid'
            this.invoices[invoiceIndex].paid_amount = this.invoices[invoiceIndex].total_amount
            this.invoices[invoiceIndex].pending_amount = 0
            this.invoices[invoiceIndex].updated_at = new Date().toISOString()
          }
        })
        
        this.selectedInvoices = []
        console.log('✅ Facturas marcadas como pagadas')
      }
    },
    
    /**
     * Envía recordatorios masivos
     */
    sendReminders() {
      console.log('📧 Enviar recordatorios a:', this.selectedInvoices.length, 'facturas')
      
      // Filtrar solo facturas no pagadas
      const unpaidSelected = this.selectedInvoices.filter(invoiceId => {
        const invoice = this.invoices.find(inv => inv.id === invoiceId)
        return invoice && invoice.payment_status !== 'paid'
      })
      
      if (unpaidSelected.length === 0) {
        alert('No hay facturas pendientes de pago en la selección.')
        return
      }
      
      if (confirm(`¿Enviar recordatorios de pago a ${unpaidSelected.length} facturas pendientes?`)) {
        // Simular envío de recordatorios
        alert(`Recordatorios enviados a ${unpaidSelected.length} clientes.\n\nLos emails se enviarán en segundo plano.`)
        this.selectedInvoices = []
        console.log('✅ Recordatorios enviados')
      }
    },
    
    /**
     * Eliminación masiva de facturas
     */
    bulkDelete() {
      console.log('🗑️ Eliminar facturas:', this.selectedInvoices.length)
      
      if (confirm(`¿Está seguro de que desea eliminar ${this.selectedInvoices.length} facturas?\n\n⚠️ Esta acción no se puede deshacer.`)) {
        this.selectedInvoices.forEach(invoiceId => {
          const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoiceId)
          if (invoiceIndex > -1) {
            this.invoices.splice(invoiceIndex, 1)
          }
        })
        
        this.selectedInvoices = []
        
        // Ajustar página si es necesario
        if (this.paginatedInvoices.length === 0 && this.currentPage > 1) {
          this.currentPage--
        }
        
        console.log('✅ Facturas eliminadas')
      }
    },
    
    /**
     * Navega a crear nueva cotización
     */
    goToCreateQuotation() {
      console.log('➕ Navegando a crear cotización')
      this.$router.push('/dashboard/quotation/create')
    },
    
    /**
     * Ver detalle de un pago específico
     */
    viewPaymentDetail(payment) {
      console.log('💳 Ver detalle de pago:', payment.id)
      alert(`Detalle del Pago\n\nFecha: ${this.formatDate(payment.date)}\nMonto: $${this.formatCurrency(payment.amount)}\nMétodo: ${payment.method}\nReferencia: ${payment.reference}\nNotas: ${payment.notes}`)
    },
    
    /**
     * Exporta datos de facturas a CSV
     */
    exportInvoices() {
      console.log('📊 Exportando facturas:', this.filteredInvoices.length)
      
      try {
        // Crear CSV con los datos filtrados
        const headers = [
          'Número', 'Cliente', 'NIT', 'Fecha Factura', 'Fecha Vencimiento', 
          'Total', 'Pagado', 'Pendiente', 'Estado', 'Productos'
        ]
        
        const csvData = [
          headers.join(','),
          ...this.filteredInvoices.map(invoice => [
            `"${invoice.invoice_number}"`,
            `"${invoice.client_name}"`,
            invoice.client_nit,
            this.formatDate(invoice.invoice_date),
            this.formatDate(invoice.due_date),
            invoice.total_amount,
            invoice.paid_amount,
            invoice.pending_amount,
            this.getPaymentStatusText(invoice.payment_status),
            invoice.products?.length || 0
          ].join(','))
        ].join('\n')
        
        // Descargar archivo
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `facturas_stackflow_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log('✅ Exportación completada')
        
      } catch (error) {
        console.error('❌ Error en exportación:', error)
        alert('Error al exportar los datos: ' + error.message)
      }
    },
    
    /**
     * Maneja atajos de teclado
     */
    handleKeyboardShortcuts(event) {
      // Ctrl/Cmd + F: Enfocar búsqueda
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        const searchInput = this.$el.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      }
      
      // Escape: Cerrar modales
      if (event.key === 'Escape') {
        if (this.invoiceToView) {
          this.closeInvoiceDetail()
        } else if (this.paymentModal.show) {
          this.closePaymentModal()
        } else if (this.activeActionsMenu) {
          this.activeActionsMenu = null
        }
      }
    }
  },
  
  mounted() {
    console.log('🧾 InvoiceReadView cargado con', this.invoices.length, 'facturas')
    
    // Configurar interceptores de teclado para navegación rápida
    document.addEventListener('keydown', this.handleKeyboardShortcuts)
  },
  
  beforeUnmount() {
    // Limpiar event listeners
    document.removeEventListener('keydown', this.handleKeyboardShortcuts)
  },
  
  watch: {
    /**
     * Resetear página cuando cambian los filtros
     */
    filteredInvoices() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages)
      }
    },
    
    /**
     * Limpiar selección cuando cambia la vista
     */
    viewMode() {
      this.selectedInvoices = []
      this.activeActionsMenu = null
    }
  }
}
</script>

<script>
export default {
  name: 'InvoiceReadView',
  
  data() {
    return {
      // ==========================================
      // ESTADOS DE CARGA Y CONTROL DE UI
      // ==========================================
      
      /** Estado de carga principal para mostrar spinner */
      isLoading: false,
      
      /** Estado de procesamiento de pagos para deshabilitar botones */
      isProcessingPayment: false,
      
      // ==========================================
      // FILTROS Y BÚSQUEDA
      // ==========================================
      
      /** Término de búsqueda libre por texto */
      searchQuery: '',
      
      /** Estado de pago seleccionado para filtrar */
      selectedPaymentStatus: '',
      
      /** Cliente específico seleccionado en filtros */
      selectedClient: '',
      
      /** Rango de fechas predefinido seleccionado */
      dateRange: '',
      
      /** Fecha personalizada desde (para filtro custom) */
      customDateFrom: '',
      
      /** Fecha personalizada hasta (para filtro custom) */
      customDateTo: '',
      
      /** Monto mínimo para filtrar facturas */
      minAmount: '',
      
      /** Monto máximo para filtrar facturas */
      maxAmount: '',
      
      // ==========================================
      // ORDENAMIENTO
      // ==========================================
      
      /** Campo por el cual ordenar las facturas */
      sortBy: 'invoice_date',
      
      /** Dirección del ordenamiento (asc/desc) */
      sortDirection: 'desc',
      
      // ==========================================
      // PAGINACIÓN
      // ==========================================
      
      /** Página actual en la paginación */
      currentPage: 1,
      
      /** Número de items a mostrar por página */
      itemsPerPage: 25,
      
      // ==========================================
      // VISTA Y SELECCIÓN
      // ==========================================
      
      /** Modo de vista actual: 'cards', 'table', 'timeline' */
      viewMode: 'cards',
      
      /** Array de IDs de facturas seleccionadas para acciones masivas */
      selectedInvoices: [],
      
      /** ID del menú de acciones activo (dropdown) */
      activeActionsMenu: null,
      
      // ==========================================
      // MODALES
      // ==========================================
      
      /** Factura seleccionada para ver detalle completo */
      invoiceToView: null,
      
      /** Configuración del modal de registro de pago */
      paymentModal: {
        show: false,
        invoice: null
      },
      
      /** Formulario de registro de pago */
      paymentForm: {
        amount: '',
        method: '',
        date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        reference: '',
        notes: ''
      },
      
      // ==========================================
      // CONFIGURACIÓN DE FILTROS
      // ==========================================
      
      /** Estados de pago disponibles para filtrar */
      paymentStatuses: [
        { value: '', label: 'Todas', icon: '📋' },
        { value: 'paid', label: 'Pagadas', icon: '✅' },
        { value: 'pending', label: 'Pendientes', icon: '⏳' },
        { value: 'partial', label: 'Parciales', icon: '🔄' },
        { value: 'overdue', label: 'Vencidas', icon: '🚨' },
        { value: 'cancelled', label: 'Canceladas', icon: '❌' }
      ],
      
      /** Lista de clientes disponibles para filtro (se carga dinámicamente) */
      availableClients: [
        { id: 1, name: 'Constructora Los Andes S.A.S' },
        { id: 2, name: 'Ferreterías del Valle LTDA' },
        { id: 3, name: 'Distribuidora Industrial del Norte' },
        { id: 4, name: 'Comercializadora Caribe S.A.' },
        { id: 5, name: 'Suministros Técnicos Santander' },
        { id: 6, name: 'Importaciones y Exportaciones del Pacífico' },
        { id: 7, name: 'Textiles y Confecciones Andinas' }
      ],
      
      // ==========================================
      // DATOS DE FACTURAS (SIMULADOS)
      // ==========================================
      
      /** 
       * Array principal de facturas con toda la información
       * En producción, estos datos vendrían de una API
       */
      invoices: [
        {
          id: 1,
          invoice_number: 'INV-2024-001',
          client_id: 1,
          client_name: 'Constructora Los Andes S.A.S',
          client_nit: '900123456-7',
          invoice_date: '2024-06-01T00:00:00Z',
          due_date: '2024-07-01T00:00:00Z',
          payment_terms: 30, // días
          subtotal: 2500000,
          tax_rate: 19,
          tax_amount: 475000,
          total_amount: 2975000,
          paid_amount: 2975000,
          pending_amount: 0,
          payment_status: 'paid',
          created_at: '2024-06-01T09:30:00Z',
          updated_at: '2024-06-15T14:22:00Z',
          // Productos incluidos en la factura
          products: [
            {
              id: 1,
              name: 'Cemento Portland Tipo I x 50kg',
              quantity: 100,
              unit_price: 25000,
              total: 2500000
            }
          ],
          // Historial de pagos realizados
          payments: [
            {
              id: 1,
              date: '2024-06-15T00:00:00Z',
              amount: 2975000,
              method: 'transferencia',
              reference: 'TRF-789123',
              notes: 'Pago completo por transferencia bancaria'
            }
          ]
        },
        {
          id: 2,
          invoice_number: 'INV-2024-002',
          client_id: 2,
          client_name: 'Ferreterías del Valle LTDA',
          client_nit: '800987654-3',
          invoice_date: '2024-06-05T00:00:00Z',
          due_date: '2024-07-05T00:00:00Z',
          payment_terms: 30,
          subtotal: 1800000,
          tax_rate: 19,
          tax_amount: 342000,
          total_amount: 2142000,
          paid_amount: 1000000,
          pending_amount: 1142000,
          payment_status: 'partial',
          created_at: '2024-06-05T11:45:00Z',
          updated_at: '2024-06-10T16:30:00Z',
          products: [
            {
              id: 2,
              name: 'Tornillos Autorroscantes 1/2"',
              quantity: 500,
              unit_price: 1200,
              total: 600000
            },
            {
              id: 3,
              name: 'Taladro Percutor 13mm',
              quantity: 4,
              unit_price: 300000,
              total: 1200000
            }
          ],
          payments: [
            {
              id: 2,
              date: '2024-06-10T00:00:00Z',
              amount: 1000000,
              method: 'efectivo',
              reference: 'EFE-001',
              notes: 'Pago parcial en efectivo'
            }
          ]
        },
        {
          id: 3,
          invoice_number: 'INV-2024-003',
          client_id: 3,
          client_name: 'Distribuidora Industrial del Norte',
          client_nit: '700456789-1',
          invoice_date: '2024-05-20T00:00:00Z',
          due_date: '2024-06-19T00:00:00Z', // Vencida
          payment_terms: 30,
          subtotal: 4200000,
          tax_rate: 19,
          tax_amount: 798000,
          total_amount: 4998000,
          paid_amount: 0,
          pending_amount: 4998000,
          payment_status: 'overdue',
          created_at: '2024-05-20T08:15:00Z',
          updated_at: '2024-05-20T08:15:00Z',
          products: [
            {
              id: 4,
              name: 'Motor Eléctrico 5HP Trifásico',
              quantity: 2,
              unit_price: 1800000,
              total: 3600000
            },
            {
              id: 5,
              name: 'Variador de Frecuencia 5HP',
              quantity: 1,
              unit_price: 600000,
              total: 600000
            }
          ],
          payments: []
        }
      ]
    }
  },
  
  computed: {
    // ==========================================
    // MÉTRICAS FINANCIERAS CALCULADAS
    // ==========================================
    
    /**
     * Calcula el total de dinero ya cobrado
     * Suma todos los paid_amount de las facturas
     */
    totalPaid() {
      return this.invoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0)
    },
    
    /**
     * Calcula el total pendiente por cobrar
     * Suma todos los pending_amount de las facturas
     */
    totalPending() {
      return this.invoices.reduce((sum, invoice) => sum + invoice.pending_amount, 0)
    },
    
    /**
     * Calcula el total de facturas vencidas
     * Suma pending_amount de facturas con estado 'overdue'
     */
    totalOverdue() {
      return this.invoices
        .filter(invoice => invoice.payment_status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.pending_amount, 0)
    },
    
    /**
     * Calcula el porcentaje de efectividad en cobros
     * (Total cobrado / Total facturado) * 100
     */
    averageTicket() {
      const totalAmount = this.invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
      if (totalAmount === 0) return 0
      return Math.round((this.totalPaid / totalAmount) * 100)
    },
    
    // ==========================================
    // FILTRADO PRINCIPAL DE FACTURAS
    // ==========================================
    
    /**
     * Aplica todos los filtros a las facturas
     * Combina búsqueda por texto, filtros de estado, fecha, cliente y monto
     */
    filteredInvoices() {
      let filtered = [...this.invoices]
      
      // Filtro por búsqueda de texto libre
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(invoice => 
          // Buscar en número de factura
          invoice.invoice_number.toLowerCase().includes(query) ||
          // Buscar en nombre del cliente
          invoice.client_name.toLowerCase().includes(query) ||
          // Buscar en NIT del cliente
          invoice.client_nit.includes(query) ||
          // Buscar en monto total (convertido a string)
          invoice.total_amount.toString().includes(query)
        )
      }
      
      // Filtro por estado de pago
      if (this.selectedPaymentStatus) {
        filtered = filtered.filter(invoice => invoice.payment_status === this.selectedPaymentStatus)
      }
      
      // Filtro por cliente específico
      if (this.selectedClient) {
        filtered = filtered.filter(invoice => invoice.client_id === parseInt(this.selectedClient))
      }
      
      // Filtro por rango de fechas
      if (this.dateRange) {
        const now = new Date()
        
        filtered = filtered.filter(invoice => {
          const date = new Date(invoice.invoice_date)
          
          switch (this.dateRange) {
            case 'today':
              // Facturas del día actual
              return date.toDateString() === now.toDateString()
            case 'week':
              // Facturas de los últimos 7 días
              const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
              return date >= weekAgo
            case 'month':
              // Facturas del mes actual
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            case 'quarter':
              // Facturas del trimestre actual
              const currentQuarter = Math.floor(now.getMonth() / 3)
              const invoiceQuarter = Math.floor(date.getMonth() / 3)
              return invoiceQuarter === currentQuarter && date.getFullYear() === now.getFullYear()
            case 'year':
              // Facturas del año actual
              return date.getFullYear() === now.getFullYear()
            case 'custom':
              // Rango personalizado
              if (this.customDateFrom && this.customDateTo) {
                const fromDate = new Date(this.customDateFrom)
                const toDate = new Date(this.customDateTo)
                return date >= fromDate && date <= toDate
              }
              return true
            default:
              return true
          }
        })
      }
      
      // Filtro por rango de montos
      if (this.minAmount !== '') {
        filtered = filtered.filter(invoice => invoice.total_amount >= parseFloat(this.minAmount))
      }
      
      if (this.maxAmount !== '') {
        filtered = filtered.filter(invoice => invoice.total_amount <= parseFloat(this.maxAmount))
      }
      
      // Aplicar ordenamiento
      return this.sortInvoices(filtered)
    },
    
    /**
     * Suma total de las facturas filtradas
     */
    filteredTotal() {
      return this.filteredInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
    },
    
    /**
     * Promedio de valor de las facturas filtradas
     */
    filteredAverage() {
      if (this.filteredInvoices.length === 0) return 0
      return this.filteredTotal / this.filteredInvoices.length
    },
    
    // ==========================================
    // PAGINACIÓN
    // ==========================================
    
    /**
     * Facturas a mostrar en la página actual
     */
    paginatedInvoices() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredInvoices.slice(start, start + this.itemsPerPage)
    },
    
    /**
     * Número total de páginas
     */
    totalPages() {
      return Math.ceil(this.filteredInvoices.length / this.itemsPerPage)
    },
    
    /**
     * Número del primer item mostrado
     */
    startItem() {
      return Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.filteredInvoices.length)
    },
    
    /**
     * Número del último item mostrado
     */
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredInvoices.length)
    },
    
    /**
     * Páginas visibles en el control de paginación
     */
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
    
    // ==========================================
    // ESTADO DE FILTROS Y SELECCIÓN
    // ==========================================
    
    /**
     * Verifica si hay filtros activos
     */
    hasActiveFilters() {
      return !!(
        this.searchQuery || 
        this.selectedPaymentStatus || 
        this.selectedClient || 
        this.dateRange ||
        this.minAmount !== '' ||
        this.maxAmount !== ''
      )
    },
    
    /**
     * Verifica si todas las facturas visibles están seleccionadas
     */
    allSelected() {
      if (this.paginatedInvoices.length === 0) return false
      return this.paginatedInvoices.every(invoice => 
        this.selectedInvoices.includes(invoice.id)
      )
    },
    
    /**
     * Agrupa facturas por fecha para vista de cronología
     */
    groupedByDate() {
      const groups = {}
      
      this.filteredInvoices.forEach(invoice => {
        const date = new Date(invoice.invoice_date).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(invoice)
      })
      
      return groups
    }
  },
  
  methods: {
    // ==========================================
    // MÉTODOS DE BÚSQUEDA Y FILTROS
    // ==========================================
    
    /**
     * Maneja cambios en la búsqueda por texto
     * Resetea la página actual para mostrar resultados desde el inicio
     */
    handleSearch() {
      this.currentPage = 1
      console.log('🔍 Búsqueda actualizada:', this.searchQuery)
    },
    
    /**
     * Ejecuta búsqueda explícita (Enter o botón)
     */
    performSearch() {
      this.handleSearch()
      console.log('🎯 Búsqueda ejecutada:', this.searchQuery)
    },
    
    /**
     * Establece filtro por estado de pago
     * Si se selecciona el mismo estado, lo deselecciona
     */
    setPaymentStatusFilter(status) {
      this.selectedPaymentStatus = this.selectedPaymentStatus === status ? '' : status
      this.currentPage = 1
      console.log('📊 Filtro de estado de pago:', status || 'todos')
    },
    
    /**
     * Aplica filtros y resetea página
     */
    applyFilters() {
      this.currentPage = 1
      console.log('🔧 Filtros aplicados')
    },
    
    /**
     * Limpia todos los filtros activos
     */
    clearAllFilters() {
      this.searchQuery = ''
      this.selectedPaymentStatus = ''
      this.selectedClient = ''
      this.dateRange = ''
      this.customDateFrom = ''
      this.customDateTo = ''
      this.minAmount = ''
      this.maxAmount = ''
      this.currentPage = 1
      console.log('🗑️ Todos los filtros limpiados')
    },
    
    // ==========================================
    // MÉTODOS DE ORDENAMIENTO
    // ==========================================
    
    /**
     * Función para ordenar facturas según criterio seleccionado
     */
    sortInvoices(invoices) {
      return [...invoices].sort((a, b) => {
        let aValue, bValue
        
        // Determinar valores a comparar según el criterio de ordenamiento
        switch (this.sortBy) {
          case 'invoice_number':
            aValue = a.invoice_number.toLowerCase()
            bValue = b.invoice_number.toLowerCase()
            break
          case 'client_name':
            aValue = a.client_name.toLowerCase()
            bValue = b.client_name.toLowerCase()
            break
          case 'invoice_date':
          case 'due_date':
            aValue = new Date(a[this.sortBy])
            bValue = new Date(b[this.sortBy])
            break
          case 'total_amount':
          case 'paid_amount':
          case 'pending_amount':
            aValue = a[this.sortBy]
            bValue = b[this.sortBy]
            break
          case 'payment_status':
            // Orden específico para estados de pago
            const statusOrder = { 'overdue': 0, 'pending': 1, 'partial': 2, 'paid': 3, 'cancelled': 4 }
            aValue = statusOrder[a.payment_status] || 999
            bValue = statusOrder[b.payment_status] || 999
            break
          default:
            aValue = a[this.sortBy]
            bValue = b[this.sortBy]
        }
        
        // Aplicar dirección de ordenamiento
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1
        return 0
      })
    },
    
    /**
     * Aplica ordenamiento actual
     */
    applySorting() {
      console.log('📊 Ordenando por:', this.sortBy, this.sortDirection)
    },
    
    /**
     * Establece campo de ordenamiento
     * Si es el mismo campo, cambia la dirección
     */
    setSortBy(field) {
      if (this.sortBy === field) {
        this.toggleSortDirection()
      } else {
        this.sortBy = field
        this.sortDirection = 'asc'
      }
      console.log('🔀 Orden cambiado:', field, this.sortDirection)
    },
    
    /**
     * Alterna dirección de ordenamiento
     */
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      console.log('🔄 Dirección de orden:', this.sortDirection)
    },
    
    // ==========================================
    // MÉTODOS DE VISTA
    // ==========================================
    
    /**
     * Cambia el modo de visualización
     */
    setViewMode(mode) {
      this.viewMode = mode
      this.selectedInvoices = [] // Limpiar selección al cambiar vista
      this.activeActionsMenu = null // Cerrar menús abiertos
      console.log('👁️ Modo de vista:', mode)
    },
    
    /**
     * Cambia número de items por página
     */
    changeItemsPerPage() {
      this.currentPage = 1
      console.log('📄 Items por página:', this.itemsPerPage)
    },
    
    /**
     * Muestra/oculta menú de acciones de una factura
     */
    toggleActionsMenu(invoiceId) {
      this.activeActionsMenu = this.activeActionsMenu === invoiceId ? null : invoiceId
      console.log('⚙️ Menú de acciones:', invoiceId)
    },
    
    // ==========================================
    // MÉTODOS DE SELECCIÓN
    // ==========================================
    
    /**
     * Alterna selección de una factura individual
     */
    toggleInvoiceSelection(invoiceId) {
      const index = this.selectedInvoices.indexOf(invoiceId)
      if (index > -1) {
        this.selectedInvoices.splice(index, 1)
      } else {
        this.selectedInvoices.push(invoiceId)
      }
      console.log('☑️ Selección factura:', invoiceId, this.selectedInvoices.length, 'seleccionadas')
    },
    
    /**
     * Selecciona/deselecciona todas las facturas visibles
     */
    toggleSelectAll() {
      if (this.allSelected) {
        // Deseleccionar todas las visibles
        this.paginatedInvoices.forEach(invoice => {
          const index = this.selectedInvoices.indexOf(invoice.id)
          if (index > -1) {
            this.selectedInvoices.splice(index, 1)
          }
        })
      } else {
        // Seleccionar todas las visibles que no estén ya seleccionadas
        this.paginatedInvoices.forEach(invoice => {
          if (!this.selectedInvoices.includes(invoice.id)) {
            this.selectedInvoices.push(invoice.id)
          }
        })
      }
      console.log('☑️ Selección masiva:', this.selectedInvoices.length, 'facturas')
    },
    
    // ==========================================
    // MÉTODOS DE PAGINACIÓN
    // ==========================================
    
    /**
     * Navega a una página específica
     */
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        console.log('📄 Página:', page)
        
        // Scroll suave al inicio de la sección
        this.$nextTick(() => {
          const invoicesSection = this.$el.querySelector('.invoices-section')
          if (invoicesSection) {
            invoicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    },
    
    // ==========================================
    // MÉTODOS DE DATOS AUXILIARES
    // ==========================================
    
    /**
     * Cuenta facturas por estado de pago
     */
    getPaymentStatusCount(status) {
      if (!status) return this.invoices.length
      return this.invoices.filter(invoice => invoice.payment_status === status).length
    },
    
    /**
     * Obtiene ícono para estado de pago
     */
    getPaymentStatusIcon(status) {
      const icons = {
        paid: '✅',
        pending: '⏳',
        partial: '🔄',
        overdue: '🚨',
        cancelled: '❌'
      }
      return icons[status] || '❓'
    },
    
    /**
     * Obtiene texto legible para estado de pago
     */
    getPaymentStatusText(status) {
      const texts = {
        paid: 'Pagada',
        pending: 'Pendiente',
        partial: 'Parcial',
        overdue: 'Vencida',
        cancelled: 'Cancelada'
      }
      return texts[status] || status
    },
    
    /**
     * Verifica si una factura está vencida
     */
    isOverdue(invoice) {
      if (invoice.payment_status === 'paid') return false
      const dueDate = new Date(invoice.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalizar a inicio del día
      return dueDate < today
    },
    
    /**
     * Calcula días de vencimiento
     */
    getDaysOverdue(invoice) {
      if (!this.isOverdue(invoice)) return 0
      const dueDate = new Date(invoice.due_date)
      const today = new Date()
      const diffTime = today - dueDate
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },
    
    /**
     * Calcula cantidad total de productos en una factura
     */
    getTotalQuantity(invoice) {
      if (!invoice.products) return 0
      return invoice.products.reduce((sum, product) => sum + product.quantity, 0)
    },
    
    /**
     * Formatea montos a formato de moneda
     */
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },
    
    /**
     * Formatea fechas a formato legible
     */
    formatDate(dateString) {
      if (!dateString) return 'Sin fecha'
      
      const date = new Date(dateString)
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
      
      return date.toLocaleDateString('es-ES', options)
    },
    
    /**
     * Formatea fechas para vista de cronología
     */
    formatTimelineDate(dateString) {
      const date = new Date(dateString)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) {
        return 'Hoy'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer'
      } else {
        return this.formatDate(dateString)
      }
    },
    
    /**
     * Calcula total de un grupo de facturas
     */
    getGroupTotal(invoices) {
      return invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
    },
    
    /**
     * Obtiene acciones disponibles para una factura específica
     */
    getAvailableActions(invoice) {
      const actions = []
      
      // Duplicar factura
      actions.push({
        key: 'duplicate',
        icon: '📋',
        label: 'Duplicar'
      })
      
      // Convertir a nota de crédito (solo pagadas)
      if (invoice.payment_status === 'paid') {
        actions.push({
          key: 'credit_note',
          icon: '🔄',
          label: 'Nota de Crédito'
        })
      }
      
      // Cancelar (solo pendientes o parciales)
      if (['pending', 'partial'].includes(invoice.payment_status)) {
        actions.push({
          key: 'cancel',
          icon: '❌',
          label: 'Cancelar'
        })
      }
      
      // Programar recordatorio (no pagadas)
      if (invoice.payment_status !== 'paid') {
        actions.push({
          key: 'schedule_reminder',
          icon: '📅',
          label: 'Programar Recordatorio'
        })
      }
      
      return actions
    },
    
    // ==========================================
    // MÉTODOS DE ACCIONES DE FACTURA
    // ==========================================
    
    /**
     * Muestra detalle completo de una factura
     */
    viewInvoiceDetail(invoice) {
      console.log('👁️ Ver detalle de factura:', invoice.invoice_number)
      this.invoiceToView = invoice
      this.activeActionsMenu = null // Cerrar menús abiertos
    },
    
    /**
     * Cierra modal de detalle de factura
     */
    closeInvoiceDetail() {
      this.invoiceToView = null
      console.log('❌ Cerrar detalle de factura')
    },
    
    /**
     * Abre modal para registrar pago
     */
    recordPayment(invoice) {
      console.log('💰 Registrar pago para factura:', invoice.invoice_number)
      
      // Configurar modal de pago
      this.paymentModal.show = true
      this.paymentModal.invoice = invoice
      
      // Resetear formulario con valores por defecto
      this.paymentForm = {
        amount: invoice.pending_amount, // Por defecto, el monto pendiente completo
        method: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      }
      
      this.activeActionsMenu = null // Cerrar menús abiertos
    },
    
    /**
     * Cierra modal de registro de pago
     */
    closePaymentModal() {
      this.paymentModal.show = false
      this.paymentModal.invoice = null
      this.paymentForm = {
        amount: '',
        method: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      }
      console.log('❌ Cerrar modal de pago')
    },
    
    /**
     * Establece monto rápido por porcentaje
     */
    setQuickAmount(percentage) {
      const pendingAmount = this.paymentModal.invoice.pending_amount
      this.paymentForm.amount = (pendingAmount * percentage / 100).toFixed(2)
      console.log('💰 Monto rápido:', percentage + '%', '=', this.paymentForm.amount)
    },
    
    /**
     * Procesa el registro de pago
     */
    async processPayment() {
      this.isProcessingPayment = true
      
      try {
        console.log('💾 Procesando pago:', this.paymentForm)
        
        // Validaciones
        const amount = parseFloat(this.paymentForm.amount)
        if (amount <= 0 || amount > this.paymentModal.invoice.pending_amount) {
          throw new Error('Monto de pago inválido')
        }
        
        if (!this.paymentForm.method) {
          throw new Error('Debe seleccionar un método de pago')
        }
        
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Crear registro de pago
        const newPayment = {
          id: Date.now(), // ID temporal
          date: this.paymentForm.date,
          amount: amount,
          method: this.paymentForm.method,
          reference: this.paymentForm.reference,
          notes: this.paymentForm.notes
        }
        
        // Actualizar factura
        const invoice = this.paymentModal.invoice
        const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoice.id)
        
        if (invoiceIndex > -1) {
          // Actualizar montos
          this.invoices[invoiceIndex].paid_amount += amount
          this.invoices[invoiceIndex].pending_amount -= amount
          
          // Actualizar estado de pago
          if (this.invoices[invoiceIndex].pending_amount <= 0) {
            this.invoices[invoiceIndex].payment_status = 'paid'
            this.invoices[invoiceIndex].pending_amount = 0 // Asegurar que no sea negativo
          } else {
            this.invoices[invoiceIndex].payment_status = 'partial'
          }
          
          // Agregar pago al historial
          if (!this.invoices[invoiceIndex].payments) {
            this.invoices[invoiceIndex].payments = []
          }
          this.invoices[invoiceIndex].payments.push(newPayment)
          
          // Actualizar fecha de modificación
          this.invoices[invoiceIndex].updated_at = new Date().toISOString()
          
          console.log('✅ Pago registrado exitosamente')
        }
        
        this.closePaymentModal()
        
      } catch (error) {
        console.error('❌ Error procesando pago:', error)
        alert('Error al registrar el pago: ' + error.message)
      } finally {
        this.isProcessingPayment = false
      }
    },
    
    /**
     * Envía factura por email
     */
    sendInvoiceEmail(invoice) {
      console.log('📧 Enviar factura por email:', invoice.invoice_number)
      
      // Simular envío de email
      const subject = encodeURIComponent(`Factura ${invoice.invoice_number} - StackFlow`)
      const body = encodeURIComponent(`
Estimado/a cliente,

Adjunto encontrará la factura ${invoice.invoice_number} por un valor de $${this.formatCurrency(invoice.total_amount)}.

Fecha de vencimiento: ${this.formatDate(invoice.due_date)}
Estado: ${this.getPaymentStatusText(invoice.payment_status)}

Saludos cordiales,
Equipo StackFlow
      `)
      
      // Abrir cliente de email predeterminado
      window.open(`mailto:?subject=${subject}&body=${body}`)
      
      this.activeActionsMenu = null
    },
    
    /**
     * Imprime factura
     */
    printInvoice(invoice) {
      console.log('🖨️ Imprimir factura:', invoice.invoice_number)
      
      // En una aplicación real, esto generaría un PDF o abriría vista de impresión
      alert(`Función de impresión para factura ${invoice.invoice_number}\n\nEn desarrollo: Se integrará con generador de PDF`)
      
      this.activeActionsMenu = null
    },
    
    /**
     * Ejecuta acción específica del menú dropdown
     */
    executeAction(actionKey, invoice) {
      console.log('⚙️ Ejecutar acción:', actionKey, 'en factura:', invoice.invoice_number)
      
      switch (actionKey) {
        case 'duplicate':
          this.duplicateInvoice(invoice)
          break
        case 'credit_note':
          this.createCreditNote(invoice)
          break
        case 'cancel':
          this.cancelInvoice(invoice)
          break
        case 'schedule_reminder':
          this.scheduleReminder(invoice)
          break
        default:
          console.warn('Acción no implementada:', actionKey)
      }
      
      this.activeActionsMenu = null
    },
    
    /**
     * Duplica una factura existente
     */
    duplicateInvoice(invoice) {
      console.log('📋 Duplicar factura:', invoice.invoice_number)
      alert(`Duplicar factura ${invoice.invoice_number}\n\nEsta función creará una nueva cotización basada en esta factura.`)
    },
    
    /**
     * Crea nota de crédito
     */
    createCreditNote(invoice) {
      console.log('🔄 Crear nota de crédito para:', invoice.invoice_number)
      alert(`Crear nota de crédito para factura ${invoice.invoice_number}\n\nEsta función permite reversar total o parcialmente la factura.`)
    },
    
    /**
     * Cancela una factura
     */
    cancelInvoice(invoice) {
      console.log('❌ Cancelar factura:', invoice.invoice_number)
      
      if (confirm(`¿Está seguro de que desea cancelar la factura ${invoice.invoice_number}?\n\nEsta acción no se puede deshacer.`)) {
        // Actualizar estado
        const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoice.id)
        if (invoiceIndex > -1) {
          this.invoices[invoiceIndex].payment_status = 'cancelled'
          this.invoices[invoiceIndex].updated_at = new Date().toISOString()
          console.log('✅ Factura cancelada')
        }
      }
    },
    
    /**
     * Programa recordatorio de pago
     */
    scheduleReminder(invoice) {
      console.log('📅 Programar recordatorio para:', invoice.invoice_number)
      alert(`Programar recordatorio para factura ${invoice.invoice_number}\n\nEsta función permitirá configurar recordatorios automáticos.`)
    },
    
    /**
     * Marca facturas seleccionadas como pagadas
     */
    markAsPaid() {
      console.log('✅ Marcar como pagadas:', this.selectedInvoices.length, 'facturas')
      
      if (confirm(`¿Marcar ${this.selectedInvoices.length} facturas como pagadas?\n\nEsto establecerá el estado como "Pagada" y el monto pagado como el total.`)) {
        this.selectedInvoices.forEach(invoiceId => {
          const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoiceId)
          if (invoiceIndex > -1 && this.invoices[invoiceIndex].payment_status !== 'paid') {
            this.invoices[invoiceIndex].payment_status = 'paid'
            this.invoices[invoiceIndex].paid_amount = this.invoices[invoiceIndex].total_amount
            this.invoices[invoiceIndex].pending_amount = 0
            this.invoices[invoiceIndex].updated_at = new Date().toISOString()
          }
        })
        
        this.selectedInvoices = []
        console.log('✅ Facturas marcadas como pagadas')
      }
    },
    
    /**
     * Envía recordatorios masivos
     */
    sendReminders() {
      console.log('📧 Enviar recordatorios a:', this.selectedInvoices.length, 'facturas')
      
      // Filtrar solo facturas no pagadas
      const unpaidSelected = this.selectedInvoices.filter(invoiceId => {
        const invoice = this.invoices.find(inv => inv.id === invoiceId)
        return invoice && invoice.payment_status !== 'paid'
      })
      
      if (unpaidSelected.length === 0) {
        alert('No hay facturas pendientes de pago en la selección.')
        return
      }
      
      if (confirm(`¿Enviar recordatorios de pago a ${unpaidSelected.length} facturas pendientes?`)) {
        // Simular envío de recordatorios
        alert(`Recordatorios enviados a ${unpaidSelected.length} clientes.\n\nLos emails se enviarán en segundo plano.`)
        this.selectedInvoices = []
        console.log('✅ Recordatorios enviados')
      }
    },
    
    /**
     * Eliminación masiva de facturas
     */
    bulkDelete() {
      console.log('🗑️ Eliminar facturas:', this.selectedInvoices.length)
      
      if (confirm(`¿Está seguro de que desea eliminar ${this.selectedInvoices.length} facturas?\n\n⚠️ Esta acción no se puede deshacer.`)) {
        this.selectedInvoices.forEach(invoiceId => {
          const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoiceId)
          if (invoiceIndex > -1) {
            this.invoices.splice(invoiceIndex, 1)
          }
        })
        
        this.selectedInvoices = []
        
        // Ajustar página si es necesario
        if (this.paginatedInvoices.length === 0 && this.currentPage > 1) {
          this.currentPage--
        }
        
        console.log('✅ Facturas eliminadas')
      }
    },
    
    /**
     * Navega a crear nueva cotización
     */
    goToCreateQuotation() {
      console.log('➕ Navegando a crear cotización')
      this.$router.push('/dashboard/quotation/create')
    },
    
    /**
     * Ver detalle de un pago específico
     */
    viewPaymentDetail(payment) {
      console.log('💳 Ver detalle de pago:', payment.id)
      alert(`Detalle del Pago\n\nFecha: ${this.formatDate(payment.date)}\nMonto: $${this.formatCurrency(payment.amount)}\nMétodo: ${payment.method}\nReferencia: ${payment.reference}\nNotas: ${payment.notes}`)
    },
    
    /**
     * Exporta datos de facturas a CSV
     */
    exportInvoices() {
      console.log('📊 Exportando facturas:', this.filteredInvoices.length)
      
      try {
        // Crear CSV con los datos filtrados
        const headers = [
          'Número', 'Cliente', 'NIT', 'Fecha Factura', 'Fecha Vencimiento', 
          'Total', 'Pagado', 'Pendiente', 'Estado', 'Productos'
        ]
        
        const csvData = [
          headers.join(','),
          ...this.filteredInvoices.map(invoice => [
            `"${invoice.invoice_number}"`,
            `"${invoice.client_name}"`,
            invoice.client_nit,
            this.formatDate(invoice.invoice_date),
            this.formatDate(invoice.due_date),
            invoice.total_amount,
            invoice.paid_amount,
            invoice.pending_amount,
            this.getPaymentStatusText(invoice.payment_status),
            invoice.products?.length || 0
          ].join(','))
        ].join('\n')
        
        // Descargar archivo
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `facturas_stackflow_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log('✅ Exportación completada')
        
      } catch (error) {
        console.error('❌ Error en exportación:', error)
        alert('Error al exportar los datos: ' + error.message)
      }
    },
    
    /**
     * Maneja atajos de teclado
     */
    handleKeyboardShortcuts(event) {
      // Ctrl/Cmd + F: Enfocar búsqueda
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        const searchInput = this.$el.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      }
      
      // Escape: Cerrar modales
      if (event.key === 'Escape') {
        if (this.invoiceToView) {
          this.closeInvoiceDetail()
        } else if (this.paymentModal.show) {
          this.closePaymentModal()
        } else if (this.activeActionsMenu) {
          this.activeActionsMenu = null
        }
      }
    }
  },
  
  mounted() {
    console.log('🧾 InvoiceReadView cargado con', this.invoices.length, 'facturas')
    
    // Configurar interceptores de teclado para navegación rápida
    document.addEventListener('keydown', this.handleKeyboardShortcuts)
  },
  
  beforeUnmount() {
    // Limpiar event listeners
    document.removeEventListener('keydown', this.handleKeyboardShortcuts)
  },
  
  watch: {
    /**
     * Resetear página cuando cambian los filtros
     */
    filteredInvoices() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages)
      }
    },
    
    /**
     * Limpiar selección cuando cambia la vista
     */
    viewMode() {
      this.selectedInvoices = []
      this.activeActionsMenu = null
    }
  }
}
</script>
<style scoped>
/* 
  ========================================
  SISTEMA DE VARIABLES CSS PARA FACTURAS
  ========================================
  Define colores, espaciados y tipografías reutilizables
*/
:root {
  /* Colores principales del sistema */
  --invoice-primary: #3b82f6;
  --invoice-success: #10b981;
  --invoice-warning: #f59e0b;
  --invoice-danger: #ef4444;
  --invoice-info: #6366f1;
  
  /* Estados de pago - colores específicos */
  --status-paid: #dcfce7;
  --status-paid-text: #166534;
  --status-pending: #fef3c7;
  --status-pending-text: #92400e;
  --status-partial: #dbeafe;
  --status-partial-text: #1e40af;
  --status-overdue: #fee2e2;
  --status-overdue-text: #991b1b;
  --status-cancelled: #f3f4f6;
  --status-cancelled-text: #6b7280;
  
  /* Grises y neutros */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Espaciados estandarizados */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Bordes y radios */
  --border-radius: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-width: 1px;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transiciones suaves */
  --transition: all 0.2s ease-in-out;
  --transition-slow: all 0.3s ease-in-out;
}

/* 
  ========================================
  CONTENEDOR PRINCIPAL
  ========================================
  Layout principal con scroll optimizado
*/
.invoice-read-container {
  padding: var(--space-lg);
  max-width: 1440px; /* Límite de ancho máximo */
  margin: 0 auto;
  background-color: var(--gray-50);
  min-height: 100vh;
  overflow-x: hidden; /* Prevenir scroll horizontal */
}

/* 
  ========================================
  HEADER CON MÉTRICAS PRINCIPALES
  ========================================
  Diseño responsivo con tarjetas de métricas
*/
.page-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
  padding: var(--space-lg);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.header-left h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 var(--space-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0;
}

/* Tarjetas de métricas principales */
.header-metrics {
  flex: 1;
  min-width: 300px;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-md);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--border-radius);
  transition: var(--transition);
  cursor: pointer;
}

/* Estados de las tarjetas métricas */
.metric-card.success {
  background: linear-gradient(135deg, var(--status-paid), #a7f3d0);
  border-left: 4px solid var(--invoice-success);
}

.metric-card.warning {
  background: linear-gradient(135deg, var(--status-pending), #fde68a);
  border-left: 4px solid var(--invoice-warning);
}

.metric-card.danger {
  background: linear-gradient(135deg, var(--status-overdue), #fecaca);
  border-left: 4px solid var(--invoice-danger);
}

.metric-card.info {
  background: linear-gradient(135deg, var(--status-partial), #c7d2fe);
  border-left: 4px solid var(--invoice-info);
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.metric-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.2;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 
  ========================================
  PANEL DE BÚSQUEDA Y FILTROS AVANZADOS
  ========================================
  Sistema completo de filtrado con diseño intuitivo
*/
.search-panel {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-xl);
  overflow: hidden;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: var(--border-width) solid var(--gray-200);
  background: var(--gray-50);
}

.search-header h3 {
  margin: 0;
  color: var(--gray-900);
  font-size: 1.125rem;
  font-weight: 600;
}

.search-actions {
  display: flex;
  gap: var(--space-sm);
}

/* Botones del panel de búsqueda */
.btn-clear, .btn-export, .btn-primary, .btn-secondary {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border: var(--border-width) solid transparent;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.btn-clear {
  background: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-300);
}

.btn-clear:hover {
  background: var(--gray-200);
  transform: translateY(-1px);
}

.btn-export {
  background: var(--invoice-info);
  color: white;
}

.btn-export:hover {
  background: #5b21b6;
  box-shadow: var(--shadow-md);
}

.btn-primary {
  background: var(--invoice-primary);
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-200);
  border-color: var(--gray-400);
}

/* Contenedor principal de búsqueda */
.search-main {
  padding: var(--space-lg);
}

/* Barra de búsqueda principal */
.search-bar {
  display: flex;
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: var(--space-md);
  border: var(--border-width) solid var(--gray-300);
  border-right: none;
  font-size: 1rem;
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--invoice-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  padding: var(--space-md);
  background: var(--invoice-primary);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: var(--transition);
}

.search-btn:hover {
  background: #2563eb;
}

/* Filtros avanzados */
.advanced-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.filter-group label {
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

/* Tabs de filtro por estado */
.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.filter-tab {
  padding: var(--space-sm) var(--space-md);
  border: var(--border-width) solid var(--gray-300);
  background: white;
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.filter-tab:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.filter-tab.active {
  background: var(--invoice-primary);
  color: white;
  border-color: var(--invoice-primary);
}

/* Selectores de filtro */
.filter-select, .sort-select {
  padding: var(--space-sm) var(--space-md);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: var(--transition);
}

.filter-select:focus, .sort-select:focus {
  outline: none;
  border-color: var(--invoice-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Filtros de fecha personalizada */
.custom-date-filters {
  padding: var(--space-md);
  background: var(--gray-50);
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--gray-200);
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.date-field input {
  padding: var(--space-sm);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

/* Filtros de monto */
.amount-filters {
  background: var(--gray-50);
  padding: var(--space-md);
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--gray-200);
}

.amount-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.amount-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.amount-field input {
  padding: var(--space-sm);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

/* Controles de ordenamiento */
.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--gray-50);
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--gray-200);
}

.sort-direction {
  padding: var(--space-sm);
  background: white;
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition);
}

.sort-direction:hover {
  background: var(--gray-100);
}

/* Indicador de resultados */
.search-results {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--gray-50);
  border-radius: var(--border-radius);
  margin-top: var(--space-md);
}

.results-info {
  font-size: 0.875rem;
  color: var(--gray-700);
}

.results-summary {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-left: var(--space-sm);
}

.clear-search {
  padding: var(--space-xs) var(--space-sm);
  background: var(--gray-200);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.75rem;
  transition: var(--transition);
}

.clear-search:hover {
  background: var(--gray-300);
}

/* 
  ========================================
  CONTROLES DE VISTA Y ACCIONES MASIVAS
  ========================================
*/
.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.view-options {
  display: flex;
  background: var(--gray-100);
  border-radius: var(--border-radius);
  padding: var(--space-xs);
}

.view-btn {
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition);
  white-space: nowrap;
}

.view-btn:hover {
  background: var(--gray-200);
}

.view-btn.active {
  background: var(--invoice-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

/* Acciones masivas */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--gray-50);
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--gray-200);
}

.selection-info {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
}

.btn-action {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius);
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.btn-action.danger {
  background: var(--invoice-danger);
  color: white;
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Control de items por página */
.items-per-page {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  color: var(--gray-700);
}

.items-per-page select {
  padding: var(--space-xs) var(--space-sm);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

/* 
  ========================================
  SECCIÓN PRINCIPAL DE FACTURAS
  ========================================
*/
.invoices-section {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-xl);
  min-height: 400px;
}

/* Estados de carga y vacío */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--invoice-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--gray-700);
  margin-bottom: var(--space-sm);
}

.empty-state p {
  color: var(--gray-500);
  margin-bottom: var(--space-lg);
}

.empty-actions {
  display: flex;
  gap: var(--space-sm);
}

/* 
  ========================================
  VISTA DE TARJETAS
  ========================================
  Diseño de cards responsive y atractivo
*/
.invoices-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.invoice-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: var(--border-width) solid var(--gray-200);
  transition: var(--transition);
  cursor: pointer;
  overflow: hidden;
}

.invoice-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.invoice-card.selected {
  border-color: var(--invoice-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Estados de las tarjetas según estado de pago */
.invoice-card.status-paid {
  border-left: 4px solid var(--invoice-success);
}

.invoice-card.status-pending {
  border-left: 4px solid var(--invoice-warning);
}

.invoice-card.status-partial {
  border-left: 4px solid var(--invoice-info);
}

.invoice-card.status-overdue {
  border-left: 4px solid var(--invoice-danger);
}

.invoice-card.status-cancelled {
  border-left: 4px solid var(--gray-400);
  opacity: 0.7;
}

/* Header de la tarjeta */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-lg);
  background: var(--gray-50);
  border-bottom: var(--border-width) solid var(--gray-200);
}

.invoice-number {
  display: flex;
  flex-direction: column;
}

.number-label {
  font-size: 0.75rem;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.number-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-xs);
}

/* Badges de estado */
.status-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.status-paid {
  background: var(--status-paid);
  color: var(--status-paid-text);
}

.status-badge.status-pending {
  background: var(--status-pending);
  color: var(--status-pending-text);
}

.status-badge.status-partial {
  background: var(--status-partial);
  color: var(--status-partial-text);
}

.status-badge.status-overdue {
  background: var(--status-overdue);
  color: var(--status-overdue-text);
}

.status-badge.status-cancelled {
  background: var(--status-cancelled);
  color: var(--status-cancelled-text);
}

/* Indicador de urgencia */
.urgency-indicator {
  font-size: 0.75rem;
  color: var(--invoice-danger);
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Información del cliente */
.card-client {
  padding: var(--space-lg);
  border-bottom: var(--border-width) solid var(--gray-100);
}

.card-client h3 {
  margin: 0 0 var(--space-xs) 0;
  color: var(--gray-900);
  font-size: 1rem;
  font-weight: 600;
}

.client-nit {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0;
}

/* Grid financiero */
.card-financial {
  padding: var(--space-lg);
  border-bottom: var(--border-width) solid var(--gray-100);
}

.financial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.financial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.financial-label {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.financial-value {
  font-weight: 600;
  color: var(--gray-900);
}

.financial-value.pending {
  color: var(--invoice-warning);
}

.financial-value.overdue {
  color: var(--invoice-danger);
  font-weight: 700;
}

/* Resumen de productos */
.card-products {
  padding: var(--space-md) var(--space-lg);
  border-bottom: var(--border-width) solid var(--gray-100);
  background: var(--gray-50);
}

.products-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--gray-600);
}

/* Footer con acciones */
.card-footer {
  padding: var(--space-lg);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
}

.action-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius);
  border: var(--border-width) solid transparent;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.action-btn.primary {
  background: var(--invoice-primary);
  color: white;
}

.action-btn.success {
  background: var(--invoice-success);
  color: white;
}

.action-btn.info {
  background: var(--invoice-info);
  color: white;
}

.action-btn.secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-300);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Dropdown de acciones */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-300);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: var(--border-width) solid var(--gray-200);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  min-width: 150px;
  margin-top: var(--space-xs);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--gray-700);
  cursor: pointer;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--gray-100);
}

/* 
  ========================================
  VISTA DE TABLA
  ========================================
  Tabla responsive con funcionalidades avanzadas
*/
.invoices-table {
  overflow-x: auto;
  padding: var(--space-lg);
}

.invoices-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.invoices-table th {
  background: var(--gray-50);
  padding: var(--space-md);
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: var(--border-width) solid var(--gray-200);
  cursor: pointer;
  user-select: none;
  transition: var(--transition);
}

.invoices-table th:hover {
  background: var(--gray-100);
}

.invoices-table td {
  padding: var(--space-md);
  border-bottom: var(--border-width) solid var(--gray-100);
  vertical-align: middle;
}

.invoices-table tr:hover {
  background: var(--gray-50);
}

.invoices-table tr.selected {
  background: rgba(59, 130, 246, 0.05);
}

.invoices-table tr.overdue {
  background: rgba(239, 68, 68, 0.02);
}

/* Elementos específicos de la tabla */
.select-column {
  width: 40px;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.client-info strong {
  color: var(--gray-900);
}

.client-info small {
  color: var(--gray-500);
  font-size: 0.75rem;
}

.amount-breakdown {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-xs);
}

.amount-breakdown strong {
  color: var(--gray-900);
}

.amount-breakdown small {
  color: var(--invoice-warning);
  font-size: 0.75rem;
}

.overdue-indicator {
  font-size: 0.75rem;
  color: var(--invoice-danger);
  font-weight: 600;
}

/* Acciones de tabla */
.table-actions {
  display: flex;
  gap: var(--space-xs);
}

.table-btn {
  padding: var(--space-xs);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-btn.view {
  background: var(--invoice-info);
  color: white;
}

.table-btn.pay {
  background: var(--invoice-success);
  color: white;
}

.table-btn.email {
  background: var(--invoice-warning);
  color: white;
}

.table-btn.print {
  background: var(--gray-500);
  color: white;
}

.table-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-sm);
}

/* 
  ========================================
  VISTA DE CRONOLOGÍA
  ========================================
  Timeline visual para facturas por fecha
*/
.invoices-timeline {
  padding: var(--space-lg);
}

.timeline-group {
  margin-bottom: var(--space-2xl);
}

.timeline-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 2px solid var(--gray-200);
  margin-bottom: var(--space-lg);
}

.timeline-date h3 {
  margin: 0;
  color: var(--gray-900);
  font-size: 1.125rem;
}

.group-summary {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.timeline-items {
  position: relative;
  padding-left: var(--space-xl);
}

.timeline-items::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--gray-200);
}

.timeline-item {
  position: relative;
  margin-bottom: var(--space-lg);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: var(--border-width) solid var(--gray-200);
}

.timeline-marker {
  position: absolute;
  left: -25px;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--invoice-primary);
  border: 3px solid white;
  box-shadow: var(--shadow-sm);
}

.timeline-item.status-paid .timeline-marker {
  background: var(--invoice-success);
}

.timeline-item.status-overdue .timeline-marker {
  background: var(--invoice-danger);
}

.timeline-content {
  padding: var(--space-lg);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.timeline-header .invoice-number {
  font-weight: 700;
  color: var(--gray-900);
}

.timeline-header .client-name {
  color: var(--gray-700);
}

.timeline-header .amount {
  font-weight: 600;
  color: var(--gray-900);
}

.timeline-actions {
  display: flex;
  gap: var(--space-sm);
}

.timeline-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--gray-100);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.timeline-btn:hover {
  background: var(--gray-200);
}

/* 
  ========================================
  PAGINACIÓN AVANZADA
  ========================================
*/
.pagination-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.pagination-info {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.page-btn {
  padding: var(--space-sm) var(--space-md);
  border: var(--border-width) solid var(--gray-300);
  background: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition);
}

.page-btn:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: var(--space-xs);
}

.page-number {
  padding: var(--space-sm);
  border: var(--border-width) solid var(--gray-300);
  background: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition);
  min-width: 36px;
  text-align: center;
}

.page-number:hover {
  background: var(--gray-50);
}

.page-number.active {
  background: var(--invoice-primary);
  color: white;
  border-color: var(--invoice-primary);
}

/* 
  ========================================
  MODALES
  ========================================
  Sistema de modales responsive y accesible
*/
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
  padding: var(--space-lg);
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: var(--border-width) solid var(--gray-200);
  background: var(--gray-50);
}

.modal-header h3 {
  margin: 0;
  color: var(--gray-900);
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray-500);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-700);
}

/* Modal de detalle de factura */
.invoice-detail-modal {
  width: 800px;
}

.invoice-detail-content {
  padding: var(--space-lg);
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: var(--space-xl);
}

.detail-section h4 {
  margin: 0 0 var(--space-lg) 0;
  color: var(--gray-900);
  font-size: 1.125rem;
  padding-bottom: var(--space-sm);
  border-bottom: var(--border-width) solid var(--gray-200);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.detail-item strong {
  color: var(--gray-700);
  font-size: 0.875rem;
  font-weight: 600;
}

.detail-item p {
  margin: 0;
  color: var(--gray-900);
}

/* Tabla de productos en modal */
.products-table {
  overflow-x: auto;
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.products-table th,
.products-table td {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  border-bottom: var(--border-width) solid var(--gray-200);
}

.products-table th {
  background: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
}

/* Resumen financiero */
.financial-summary {
  background: var(--gray-50);
  padding: var(--space-lg);
  border-radius: var(--border-radius);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: var(--border-width) solid var(--gray-200);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--gray-900);
  border-top: 2px solid var(--gray-300);
  padding-top: var(--space-md);
}

.summary-row.paid {
  color: var(--invoice-success);
  font-weight: 600;
}

.summary-row.pending {
  color: var(--invoice-warning);
  font-weight: 600;
}

/* Historial de pagos */
.payments-history {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: white;
  border: var(--border-width) solid var(--gray-200);
  border-radius: var(--border-radius);
}

.payment-info {
  display: flex;
  gap: var(--space-lg);
  align-items: center;
}

.payment-date {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.payment-amount {
  font-weight: 600;
  color: var(--invoice-success);
}

.payment-method {
  font-size: 0.875rem;
  color: var(--gray-700);
  padding: var(--space-xs) var(--space-sm);
  background: var(--gray-100);
  border-radius: var(--border-radius);
}

.payment-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--gray-100);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.payment-btn:hover {
  background: var(--gray-200);
}

/* Modal de pago */
.payment-modal {
  width: 600px;
}

.payment-form {
  padding: var(--space-lg);
}

.payment-info {
  background: var(--gray-50);
  padding: var(--space-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--space-lg);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.info-item {
  font-size: 0.875rem;
}

.info-item strong {
  color: var(--gray-700);
}

.info-item.pending {
  color: var(--invoice-warning);
  font-weight: 600;
}

.payment-fields {
  display: grid;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.field-group.full-width {
  grid-column: 1 / -1;
}

.field-group label {
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.field-group input,
.field-group select,
.field-group textarea {
  padding: var(--space-sm) var(--space-md);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  transition: var(--transition);
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: var(--invoice-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Botones de monto rápido */
.quick-amounts {
  display: flex;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.quick-amount {
  padding: var(--space-xs) var(--space-sm);
  background: var(--gray-100);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.quick-amount:hover {
  background: var(--invoice-primary);
  color: white;
  border-color: var(--invoice-primary);
}

/* Acciones del modal */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-top: var(--border-width) solid var(--gray-200);
  background: var(--gray-50);
}

.btn-cancel {
  padding: var(--space-sm) var(--space-lg);
  background: var(--gray-100);
  color: var(--gray-700);
  border: var(--border-width) solid var(--gray-300);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.btn-cancel:hover {
  background: var(--gray-200);
}

.btn-success {
  padding: var(--space-sm) var(--space-lg);
  background: var(--invoice-success);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
  box-shadow: var(--shadow-md);
}

.btn-success:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-info {
  padding: var(--space-sm) var(--space-lg);
  background: var(--invoice-info);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.btn-info:hover {
  background: #5b21b6;
  box-shadow: var(--shadow-md);
}

/* 
  ========================================
  RESPONSIVE DESIGN
  ========================================
  Adaptación para diferentes tamaños de pantalla
*/

/* Tablets */
@media (max-width: 1024px) {
  .invoice-read-container {
    padding: var(--space-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .metric-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .invoices-cards {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .view-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-panel {
    flex-direction: column;
    text-align: center;
  }
  
  .invoice-detail-modal {
    width: 95vw;
  }
  
  .payment-modal {
    width: 95vw;
  }
}

/* Móviles */
@media (max-width: 768px) {
  .invoice-read-container {
    padding: var(--space-sm);
  }
  
  .metric-cards {
    grid-template-columns: 1fr;
  }
  
  .invoices-cards {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    justify-content: center;
  }
  
  .financial-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .modal-overlay {
    padding: var(--space-sm);
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-info {
    grid-template-columns: 1fr;
  }
  
  .date-inputs,
  .amount-inputs {
    grid-template-columns: 1fr;
  }
  
  .search-header {
    flex-direction: column;
    gap: var(--space-md);
    align-items: stretch;
  }
  
  .search-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .filter-tabs {
    flex-direction: column;
  }
  
  .filter-tab {
    text-align: center;
  }
  
  .view-options {
    flex-direction: column;
  }
  
  .timeline-items {
    padding-left: var(--space-lg);
  }
  
  .timeline-marker {
    left: -15px;
  }
  
  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .bulk-actions {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .table-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 
  ========================================
  MODO OSCURO (OPCIONAL)
  ========================================
  Variables para implementación futura
*/
@media (prefers-color-scheme: dark) {
  /* Implementar variables de modo oscuro si es necesario */
  /* --gray-50: #1f2937; */
  /* --gray-900: #f9fafb; */
  /* etc... */
}

/* 
  ========================================
  ANIMACIONES ADICIONALES
  ========================================
  Mejoras de UX con animaciones suaves
*/

/* Animación de aparición para elementos dinámicos */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Animación de deslizamiento para filtros */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Animación de carga de datos */
.list-enter-active, .list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-move {
  transition: transform 0.4s ease;
}

/* 
  ========================================
  ESTILOS DE ACCESIBILIDAD
  ========================================
  Mejoras para usuarios con discapacidades
*/

/* Indicadores de foco mejorados */
*:focus-visible {
  outline: 2px solid var(--invoice-primary);
  outline-offset: 2px;
}

/* Texto alto contraste */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reducir movimiento para usuarios sensibles */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .loading-spinner {
    animation: none;
  }
}

/* 
  ========================================
  IMPRESIÓN
  ========================================
  Estilos para versión impresa
*/
@media print {
  .invoice-read-container {
    background: white;
    box-shadow: none;
  }
  
  .search-panel,
  .view-controls,
  .pagination-panel,
  .modal-overlay {
    display: none !important;
  }
  
  .invoice-card,
  .timeline-item {
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .action-btn,
  .table-btn {
    display: none;
  }
}
</style>