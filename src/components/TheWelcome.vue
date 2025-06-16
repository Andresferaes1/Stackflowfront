<template>
  <div class="welcome-container">
    <!-- Encabezado con botones -->
    <HeaderBar />
    
    <!-- ✅ PRIMERA IMAGEN DE FONDO CON CONTENIDO ENCIMA -->
    <section class="hero-with-background">
      <div class="background-image-container">
        <img src="@/assets/fondo.png" alt="STACKFLOW Platform" class="background-full-image" />
        <div class="content-overlay">
          
          <!-- ✅ Barra de búsqueda -->
          <div class="search-section-overlay">
            <div class="search-container">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="handleSearch"
                  placeholder=""
                  class="search-input"
                />
                <button class="search-button" @click="performSearch">
                  <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
              </div>
              <div v-if="searchResults.length > 0" class="search-results">
                <h4>Resultados de búsqueda:</h4>
                <ul>
                  <li v-for="result in searchResults" :key="result.id" @click="scrollToSection(result.section)">
                    <strong>{{ result.title }}</strong> - {{ result.description }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- ✅ PRIMERA SECCIÓN - Servicios -->
          <section id="services-section" class="services-section-overlay">
            <div class="section-container">
              <h2 class="section-title-overlay">Servicios Para La Asesoría Comercial Integral de mediana y gran escala</h2>
              <p class="section-subtitle-overlay">
                Herramientas especializadas para potenciar tu desempeño como asesor comercial
              </p>
              
              <div class="services-grid-overlay">
                <div class="service-card-overlay" v-for="service in services" :key="service.id">
                  <div class="service-icon">{{ service.icon }}</div>
                  <h3 class="service-title">{{ service.title }}</h3>
                  <p class="service-description">{{ service.description }}</p>
                  <ul class="service-features">
                    <li v-for="feature in service.features" :key="feature">{{ feature }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- ✅ TÍTULO PRINCIPAL -->
          <div class="hero-main-content">
            <h1 class="hero-title">
              STACKFLOW - Gestión Comercial Profesional
            </h1>
            <p class="hero-subtitle">
              Plataforma integral para asesores comerciales que buscan maximizar 
              su rendimiento y optimizar sus procesos de venta.
            </p>
            
            <!-- ✅ ESTADÍSTICAS -->
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">5,000+</span>
                <span class="stat-label">Asesores Activos</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">40%</span>
                <span class="stat-label">Aumento en Ventas</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">24/7</span>
                <span class="stat-label">Soporte Técnico</span>
              </div>
            </div>

            <!-- ✅ BOTONES DE ACCESO -->
            <div class="hero-actions">
              <router-link to="/login" class="cta-primary">
                Iniciar Sesión
              </router-link>
              <router-link to="/register" class="cta-secondary">
                Crear Cuenta
              </router-link>
            </div>

            <!-- ✅ GARANTÍA -->
            <div class="hero-guarantee">
              <p class="guarantee-text">
                ✅ Plataforma Profesional • ✅ Soporte Incluido • ✅ Capacitación Especializada
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ✅ SEGUNDA IMAGEN DE FONDO CON CONTENIDO ENCIMA -->
    <section class="second-hero-with-background">
      <div class="background-image-container">
        <img src="@/assets/fondo2.png" alt="STACKFLOW Advanced Features" class="background-full-image" />
        <div class="content-overlay">

          <!-- ✅ SECCIÓN DE FUNCIONALIDADES FINANCIERAS -->
          <section id="financial-section" class="financial-section-overlay">
            <div class="section-container">
              <h2 class="section-title-overlay">Control Total de tu Negocio</h2>
              <p class="section-subtitle-overlay">
                Herramientas avanzadas para el control financiero y operativo de tu actividad comercial
              </p>
              
              <div class="financial-grid-overlay">
                <div class="financial-card-overlay" v-for="feature in financialFeatures" :key="feature.id">
                  <div class="financial-icon">{{ feature.icon }}</div>
                  <h3 class="financial-title">{{ feature.title }}</h3>
                  <p class="financial-description">{{ feature.description }}</p>
                  <ul class="financial-features">
                    <li v-for="item in feature.features" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- ✅ Sección del problema del asesor comercial -->
          <section id="problem-section" class="problem-section-overlay">
            <div class="section-container">
              <div class="problem-content-overlay">
                <div class="problem-left">
                  <h2 class="problem-title-overlay">
                    ¿Te identificas con estos desafíos diarios?
                  </h2>
                  <div class="problem-list">
                    <div class="problem-item-overlay" v-for="problem in commonProblems" :key="problem.id">
                      <span class="problem-icon">{{ problem.icon }}</span>
                      <p class="problem-text">{{ problem.text }}</p>
                    </div>
                  </div>
                </div>
                <div class="problem-right">
                  <div class="solution-box-overlay">
                    <h3>STACKFLOW es la Solución</h3>
                    <p>
                      Diseñado específicamente para asesores comerciales que buscan:
                    </p>
                    <ul>
                      <li>✅ Automatizar tareas repetitivas</li>
                      <li>✅ Mejorar seguimiento de clientes</li>
                      <li>✅ Optimizar procesos de venta</li>
                      <li>✅ Incrementar productividad</li>
                      <li>✅ Generar reportes profesionales</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ✅ CARACTERÍSTICAS PRINCIPALES -->
          <section id="features-section" class="features-section-overlay">
            <div class="section-container">
              <h2 class="section-title-overlay">Funcionalidades que Marcan la Diferencia</h2>
              <div class="features-grid-overlay">
                <div class="feature-card-overlay" v-for="feature in enhancedFeatures" :key="feature.id">
                  <div class="feature-header">
                    <span class="feature-icon">{{ feature.icon }}</span>
                    <h3 class="feature-title">{{ feature.title }}</h3>
                  </div>
                  <p class="feature-description">{{ feature.description }}</p>
                  <div class="feature-benefits">
                    <span class="benefit-tag" v-for="benefit in feature.benefits" :key="benefit">
                      {{ benefit }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </section>

    <!-- ✅ Sección de testimonios (SIN FONDO) -->
    <section id="testimonials-section" class="testimonials-section">
      <div class="section-container">
        <h2 class="section-title">Lo que dicen nuestros usuarios</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="testimonial in testimonials" :key="testimonial.id">
            <div class="testimonial-content">
              <p class="testimonial-text">"{{ testimonial.text }}"</p>
              <div class="testimonial-author">
                <div class="author-info">
                  <span class="author-name">{{ testimonial.author }}</span>
                  <span class="author-role">{{ testimonial.role }}</span>
                  <span class="author-company">{{ testimonial.company }}</span>
                </div>
                <div class="testimonial-rating">
                  <span v-for="star in 5" :key="star" class="star">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ✅ Call to Action final (SIN FONDO) -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">¿Listo para Transformar tu Trabajo?</h2>
          <p class="cta-text">
            Únete a miles de asesores comerciales que ya están maximizando su potencial con STACKFLOW
          </p>
          <div class="cta-actions">
            <router-link to="/login" class="cta-button primary">
              Acceder al Sistema
            </router-link>
            <router-link to="/register" class="cta-button secondary">
              Crear Cuenta
            </router-link>
          </div>
          <p class="cta-guarantee">
            ✅ Plataforma Profesional • ✅ Soporte Incluido • ✅ Capacitación Especializada
          </p>
        </div>
      </div>
    </section>

    <!-- ✅ FOOTER (SIN FONDO) -->
    <footer class="main-footer">
      <div class="footer-content">
        <!-- Información principal -->
        <div class="footer-section company-info">
          <h3>STACKFLOW</h3>
          <p>La plataforma líder en gestión comercial para asesores de ventas profesionales.</p>
          <div class="company-stats">
            <span>🏆 Software Empresarial Reconocido</span>
            <span>🔒 Datos Seguros y Protegidos</span>
          </div>
        </div>

        <!-- Contacto -->
        <div class="footer-section contact-info">
          <h4>Contacto</h4>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span>+57 (601) 123-4567</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span>info@stackflow.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <span>Bogotá D.C., Colombia</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">🕒</span>
            <span>Lun - Vie: 8:00 AM - 6:00 PM</span>
          </div>
        </div>

        <!-- Enlaces útiles -->
        <div class="footer-section useful-links">
          <h4>Enlaces Útiles</h4>
          <a href="#" @click.prevent="showInfo('demo')">Demo del Sistema</a>
          <a href="#" @click.prevent="showInfo('support')">Soporte Técnico</a>
          <a href="#" @click.prevent="showInfo('training')">Capacitación</a>
          <a href="#" @click.prevent="showInfo('api')">Documentación</a>
        </div>

        <!-- Redes sociales -->
        <div class="footer-section social-section">
          <h4>Síguenos</h4>
          <div class="social-links">
            <a href="#" @click.prevent="openSocial('facebook')" class="social-link facebook">
              <span class="social-icon">f</span>
              <span class="social-name">Facebook</span>
            </a>
            <a href="#" @click.prevent="openSocial('twitter')" class="social-link twitter">
              <span class="social-icon">𝕏</span>
              <span class="social-name">Twitter</span>
            </a>
            <a href="#" @click.prevent="openSocial('linkedin')" class="social-link linkedin">
              <span class="social-icon">in</span>
              <span class="social-name">LinkedIn</span>
            </a>
            <a href="#" @click.prevent="openSocial('instagram')" class="social-link instagram">
              <span class="social-icon">📷</span>
              <span class="social-name">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Footer bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p>&copy; {{ currentYear }} STACKFLOW. Todos los derechos reservados.</p>
          <div class="footer-legal">
            <a href="#" @click.prevent="showInfo('terms')">Términos de Servicio</a>
            <span class="separator">|</span>
            <a href="#" @click.prevent="showInfo('privacy')">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import HeaderBar from '@/components/HeaderBar.vue'
import { ref, computed } from 'vue'

// Estado reactivo
const searchQuery = ref('')
const searchResults = ref([])

// Año actual
const currentYear = computed(() => new Date().getFullYear())

// ✅ SERVICIOS ESPECIALIZADOS
const services = [
  {
    id: 1,
    icon: '👥',
    title: 'Gestión Integral de Clientes',
    description: 'CRM completo diseñado para asesores comerciales que manejan grandes carteras de clientes.',
    features: [
      'Base de datos centralizada',
      'Historial de interacciones',
      'Segmentación automática',
      'Alertas de seguimiento'
    ]
  },
  {
    id: 2,
    icon: '📦',
    title: 'Control de Inventario Inteligente',
    description: 'Gestiona tu stock con precisión y recibe alertas automáticas de reposición.',
    features: [
      'Stock en tiempo real',
      'Alertas de bajo inventario',
      'Gestión de proveedores',
      'Reportes de rotación'
    ]
  },
  {
    id: 3,
    icon: '💰',
    title: 'Cotizaciones y Ventas',
    description: 'Crea cotizaciones profesionales y gestiona todo tu pipeline de ventas.',
    features: [
      'Cotizaciones automáticas',
      'Seguimiento de propuestas',
      'Conversión a facturas',
      'Análisis de rentabilidad'
    ]
  },
  {
    id: 4,
    icon: '📊',
    title: 'Análisis Multivariado',
    description: 'Insights inteligentes para optimizar tu estrategia comercial y aumentar ventas.',
    features: [
      'Dashboards interactivos',
      'Predicciones de venta',
      'Análisis de tendencias',
      'KPIs personalizados'
    ]
  }
]

// ✅ FUNCIONALIDADES FINANCIERAS Y COMERCIALES
const financialFeatures = [
  {
    id: 1,
    icon: '🔔',
    title: 'Alertas de Cobranza Inteligentes',
    description: 'Sistema automatizado de notificaciones para optimizar el recaudo y reducir cartera vencida.',
    features: [
      'Alertas automáticas por vencimiento',
      'Recordatorios escalonados personalizables',
      'Seguimiento de gestiones de cobro',
      'Reportes de efectividad de cobranza'
    ]
  },
  {
    id: 2,
    icon: '📈',
    title: 'Dashboard de Ventas Avanzado',
    description: 'Visualización en tiempo real del desempeño comercial con métricas clave y tendencias.',
    features: [
      'Métricas de conversión en tiempo real',
      'Análisis de tendencias de ventas',
      'Comparativo de períodos anteriores',
      'Proyecciones y metas automáticas'
    ]
  },
  {
    id: 3,
    icon: '🧾',
    title: 'Control de Facturación y Recaudo',
    description: 'Monitoreo completo del ciclo de facturación desde emisión hasta cobro efectivo.',
    features: [
      'Seguimiento estado de facturas',
      'Indicadores de recaudo efectivo',
      'Análisis de días promedio de cobro',
      'Reportes de cartera por antigüedad'
    ]
  },
  {
    id: 4,
    icon: '📋',
    title: 'Gestión de Inventario Crítico',
    description: 'Monitoreo proactivo de productos con stock bajo o agotados para prevenir pérdida de ventas.',
    features: [
      'Alertas de productos críticos',
      'Reportes de rotación de inventario',
      'Sugerencias de reorden automático',
      'Análisis de productos sin movimiento'
    ]
  }
]

// ✅ PROBLEMAS COMUNES
const commonProblems = [
  {
    id: 1,
    icon: '😓',
    text: 'Perder tiempo buscando información de clientes en diferentes lugares'
  },
  {
    id: 2,
    icon: '📱',
    text: 'Gestionar cotizaciones manualmente y sin seguimiento automático'
  },
  {
    id: 3,
    icon: '📈',
    text: 'No tener visibilidad clara del rendimiento de ventas y metas'
  },
  {
    id: 4,
    icon: '🤝',
    text: 'Dificultad para hacer seguimiento efectivo a leads y oportunidades'
  }
]

// ✅ CARACTERÍSTICAS MEJORADAS
const enhancedFeatures = [
  {
    id: 1,
    icon: '🎯',
    title: 'Enfoque en Resultados',
    description: 'Herramientas diseñadas específicamente para aumentar tu tasa de conversión y ventas.',
    benefits: ['ROI Medible', 'Más Ventas', 'Menos Tiempo']
  },
  {
    id: 2,
    icon: '🔄',
    title: 'Automatización Inteligente',
    description: 'Automatiza tareas repetitivas y enfócate en lo que realmente importa: vender.',
    benefits: ['Ahorro de Tiempo', 'Menos Errores', 'Mayor Productividad']
  }
]

// ✅ TESTIMONIOS
const testimonials = [
  {
    id: 1,
    text: 'STACKFLOW transformó completamente mi manera de trabajar. Mis ventas aumentaron 45% en solo 3 meses.',
    author: 'María González',
    role: 'Asesora Comercial Senior',
    company: 'Materiales del Norte'
  },
  {
    id: 2,
    text: 'Como gerente comercial, STACKFLOW me permite tener visibilidad total del equipo. Excelente herramienta.',
    author: 'Carlos Rodríguez',
    role: 'Gerente de Ventas',
    company: 'Ferreterías Unidas'
  },
  {
    id: 3,
    text: 'La automatización de cotizaciones me ahorra 3 horas diarias. Ahora puedo enfocarme en más clientes.',
    author: 'Ana Martínez',
    role: 'Asesora Comercial',
    company: 'Construcciones López'
  }
]

// ✅ CONTENIDO PARA BÚSQUEDA
const searchableContent = [
  { id: 1, title: 'Gestión de Clientes', description: 'CRM completo para asesores comerciales', section: 'services-section' },
  { id: 2, title: 'Control de Inventario', description: 'Stock en tiempo real con alertas automáticas', section: 'services-section' },
  { id: 3, title: 'Cotizaciones', description: 'Crea cotizaciones profesionales rápidamente', section: 'services-section' },
  { id: 4, title: 'Análisis de Ventas', description: 'Dashboards y reportes inteligentes', section: 'financial-section' },
  { id: 5, title: 'Automatización', description: 'Automatiza tareas repetitivas', section: 'features-section' },
  { id: 6, title: 'Testimonios', description: 'Lo que dicen nuestros usuarios', section: 'testimonials-section' },
  { id: 7, title: 'Notificaciones Recaudo', description: 'Alertas de cobranza inteligentes', section: 'financial-section' },
  { id: 8, title: 'Facturación', description: 'Control de facturación y recaudo', section: 'financial-section' }
]

// ✅ FUNCIONES
const handleSearch = () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  searchResults.value = searchableContent.filter(item => 
    item.title.toLowerCase().includes(query) || 
    item.description.toLowerCase().includes(query)
  )
}

const performSearch = () => {
  handleSearch()
  if (searchResults.value.length > 0) {
    scrollToSection(searchResults.value[0].section)
  }
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  searchResults.value = []
  searchQuery.value = ''
}

const openSocial = (platform) => {
  const socialUrls = {
    facebook: 'https://facebook.com/stackflow',
    twitter: 'https://twitter.com/stackflow',
    linkedin: 'https://linkedin.com/company/stackflow',
    instagram: 'https://instagram.com/stackflow'
  }
  
  console.log(`Abriendo ${platform}: ${socialUrls[platform]}`)
  alert(`Redirigiendo a ${platform}:\n${socialUrls[platform]}`)
}

const showInfo = (type) => {
  const infoMessages = {
    demo: 'Demo del sistema disponible contactando a nuestro equipo comercial.',
    support: 'Soporte técnico disponible por chat, email y teléfono.',
    training: 'Capacitación incluida con el sistema.',
    api: 'Documentación técnica para desarrolladores.',
    terms: 'Términos de servicio y condiciones de uso.',
    privacy: 'Política de privacidad y protección de datos.'
  }
  
  alert(infoMessages[type] || 'Información próximamente disponible.')
}
</script>

<style scoped>
/* ✅ Variables CSS */
:root {
  --primary-color: #003366;
  --secondary-color: #d0e229;
  --accent-color: #0fac21;
  --blue-color: #1e88e5;
  --text-dark: #000000;
  --text-light: #000000;
  --background-light: #f9f9f9;
  --white: #ffffff;
  --black: #000000;
  --border-color: #333333;
  --shadow-light: 0 2px 10px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Reset y base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.welcome-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding-top: 60px;
}

/* ✅ PRIMERA IMAGEN DE FONDO DESDE ARRIBA */
.hero-with-background {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  min-height: 100vh;
  overflow: hidden;
}

/* ✅ SEGUNDA IMAGEN DE FONDO */
.second-hero-with-background {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  min-height: 100vh;
  overflow: hidden;
}

.background-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
}

.background-full-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 1;
}

.content-overlay {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.08); /* ✅ TRANSPARENCIA MÁXIMA 0.25 → 0.08 */
  min-height: 100vh;
  padding: 2rem 0;
  overflow-y: auto;
}

/* ✅ BARRA DE BÚSQUEDA - TRANSPARENCIA MÁXIMA */
.search-section-overlay {
  padding: 1rem 2rem;
  border-bottom: 4px solid var(--border-color);
  background: rgba(255, 255, 255, 0.40); /* ✅ TRANSPARENCIA MÁXIMA 0.60 → 0.40 */
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px); /* ✅ MÁS BLUR PARA COMPENSAR TRANSPARENCIA */
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 1rem 3.5rem 1rem 1.5rem;
  border: 4px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.65); /* ✅ TRANSPARENCIA MÁXIMA */
  color: var(--black);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.search-input:focus {
  border-color: var(--blue-color);
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.2);
  background: rgba(255, 255, 255, 0.90); /* ✅ MÁS OPACO AL HACER FOCUS */
}

.search-button {
  position: absolute;
  right: 0.5rem;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.75); /* ✅ TRANSPARENCIA MÁXIMA */
  border: 3px solid var(--black);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
}

.search-button:hover {
  background: var(--black);
  transform: scale(1.05);
}

.search-button:hover .search-icon {
  color: white;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--black);
  stroke-width: 2.5;
  transition: color 0.3s ease;
}

.search-results {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85); /* ✅ TRANSPARENCIA MÁXIMA */
  border: 3px solid var(--border-color);
  border-radius: 15px;
  padding: 1rem;
  box-shadow: var(--shadow-medium);
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.search-results h4 {
  color: var(--black);
}

.search-results ul {
  list-style: none;
}

.search-results li {
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.3s ease;
  color: var(--black);
}

.search-results li:hover {
  background: rgba(249, 249, 249, 0.6); /* ✅ TRANSPARENCIA MÁXIMA */
}

/* ✅ SECCIONES SOBRE PRIMERA IMAGEN - TRANSPARENCIA MÁXIMA */
.services-section-overlay {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.20); /* ✅ TRANSPARENCIA MÁXIMA 0.45 → 0.20 */
  margin: 2rem;
  border-radius: 15px;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(10px); /* ✅ MÁS BLUR */
}

.section-title-overlay {
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--black);
  text-shadow: 3px 3px 8px rgba(255, 255, 255, 1); /* ✅ SOMBRA MÁS INTENSA */
  font-weight: 900; /* ✅ MÁS BOLD */
}

.section-subtitle-overlay {
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--black);
  text-shadow: 2px 2px 6px rgba(255, 255, 255, 1); /* ✅ SOMBRA MÁS INTENSA */
  font-weight: 700; /* ✅ MÁS PESO */
}

.services-grid-overlay {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.service-card-overlay {
  background: rgba(255, 255, 255, 0.45); /* ✅ TRANSPARENCIA MÁXIMA 0.70 → 0.45 */
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
  transition: all 0.3s ease;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(8px); /* ✅ MÁS BLUR */
}

.service-card-overlay:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
  background: rgba(255, 255, 255, 0.75); /* ✅ MÁS OPACO AL HOVER */
}

.service-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
  text-align: center;
}

.service-title {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: var(--black);
  text-align: center;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 1); /* ✅ SOMBRA INTENSA */
}

.service-description {
  margin-bottom: 1rem;
  line-height: 1.4;
  color: var(--black);
  font-size: 0.9rem;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 1); /* ✅ SOMBRA INTENSA */
}

.service-features {
  list-style: none;
  font-size: 0.85rem;
}

.service-features li {
  padding: 0.2rem 0;
  color: var(--black);
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 1); /* ✅ SOMBRA INTENSA */
}

.service-features li:before {
  content: '✓ ';
  color: var(--accent-color);
  font-weight: bold;
}

/* ✅ HERO PRINCIPAL - TRANSPARENCIA MÁXIMA */
.hero-main-content {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.25); /* ✅ TRANSPARENCIA MÁXIMA 0.50 → 0.25 */
  margin: 2rem;
  border-radius: 15px;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(10px); /* ✅ MÁS BLUR */
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 900; /* ✅ MÁS BOLD */
  margin-bottom: 1rem;
  line-height: 1.2;
  color: var(--black);
  text-shadow: 4px 4px 10px rgba(255, 255, 255, 1); /* ✅ SOMBRA MÁS INTENSA */
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: var(--black);
  text-shadow: 3px 3px 8px rgba(255, 255, 255, 1); /* ✅ SOMBRA MÁS INTENSA */
  font-weight: 600; /* ✅ MÁS PESO */
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.55); /* ✅ TRANSPARENCIA MÁXIMA 0.80 → 0.55 */
  padding: 1rem;
  border-radius: 10px;
  border: 2px solid var(--blue-color);
  min-width: 120px;
  backdrop-filter: blur(6px); /* ✅ MÁS BLUR */
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--primary-color);
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 1); /* ✅ SOMBRA INTENSA */
}

.stat-label {
  font-size: 0.9rem;
  color: var(--black);
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 1); /* ✅ SOMBRA INTENSA */
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.cta-primary, .cta-secondary {
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-block;
}

.cta-primary {
  background: var(--blue-color);
  color: var(--white);
  border: 2px solid var(--blue-color);
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.60); /* ✅ TRANSPARENCIA MÁXIMA */
  color: var(--black);
  border: 2px solid var(--black);
  backdrop-filter: blur(5px);
}

.cta-primary:hover {
  background: #1565c0;
  color: var(--white);
  transform: translateY(-2px);
}

.cta-secondary:hover {
  background: var(--black);
  color: white;
}

.hero-guarantee {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.35); /* ✅ TRANSPARENCIA MÁXIMA 0.60 → 0.35 */
  border-radius: 12px;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(6px);
}

.guarantee-text {
  font-size: 0.9rem;
  color: var(--black);
  font-weight: bold;
  text-shadow: 3px 3px 6px rgba(255, 255, 255, 1); /* ✅ SOMBRA MÁS INTENSA */
}

/* ✅ SECCIONES SOBRE SEGUNDA IMAGEN - TRANSPARENCIA MÁXIMA */
.financial-section-overlay {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.18); /* ✅ TRANSPARENCIA MÁXIMA */
  margin: 2rem;
  border-radius: 15px;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(12px);
}

.financial-grid-overlay {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.financial-card-overlay {
  background: rgba(255, 255, 255, 0.40); /* ✅ TRANSPARENCIA MÁXIMA */
  border-radius: 15px;
  padding: 2rem;
  box-shadow: var(--shadow-light);
  transition: all 0.3s ease;
  border-top: 4px solid var(--blue-color);
  backdrop-filter: blur(8px);
}

.financial-card-overlay:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
  background: rgba(255, 255, 255, 0.70);
}

.financial-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.financial-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--black);
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 1);
  font-weight: bold;
}

.financial-description {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--black);
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 1);
}

.financial-features {
  list-style: none;
}

.financial-features li {
  padding: 0.3rem 0;
  color: var(--black);
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
}

.financial-features li:before {
  content: '✓ ';
  color: var(--accent-color);
  font-weight: bold;
}

/* ✅ PROBLEMAS SOBRE SEGUNDA IMAGEN */
.problem-section-overlay {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.16); /* ✅ TRANSPARENCIA MÁXIMA */
  margin: 2rem;
  border-radius: 15px;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(12px);
}

.problem-content-overlay {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.problem-title-overlay {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--black);
  text-shadow: 3px 3px 8px rgba(255, 255, 255, 1);
  font-weight: 900;
}

.problem-item-overlay {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  box-shadow: var(--shadow-light);
  backdrop-filter: blur(6px);
}

.problem-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.problem-text {
  color: var(--black);
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 1);
}

.solution-box-overlay {
  background: rgba(255, 255, 255, 0.30);
  color: var(--black);
  padding: 2rem;
  border-radius: 15px;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(8px);
}

.solution-box-overlay h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--blue-color);
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 1);
  font-weight: bold;
}

.solution-box-overlay p {
  color: var(--black);
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
}

.solution-box-overlay ul {
  list-style: none;
  margin-top: 1rem;
}

.solution-box-overlay li {
  padding: 0.5rem 0;
  color: var(--black);
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
}

/* ✅ CARACTERÍSTICAS SOBRE SEGUNDA IMAGEN */
.features-section-overlay {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.14); /* ✅ TRANSPARENCIA MÁXIMA */
  margin: 2rem;
  border-radius: 15px;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(12px);
}

.features-grid-overlay {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card-overlay {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid var(--blue-color);
  backdrop-filter: blur(8px);
}

.feature-card-overlay:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
  background: rgba(255, 255, 255, 0.65);
}

.feature-header {
  margin-bottom: 1rem;
}

.feature-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.feature-title {
  color: var(--black);
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 1);
  font-weight: bold;
}

.feature-description {
  color: var(--black);
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 1);
}

.feature-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.benefit-tag {
  background: var(--secondary-color);
  color: var(--black);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* ✅ SECCIONES SIN FONDO (NORMALES) */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--black);
}

.section-subtitle {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 3rem;
  color: var(--black);
}

/* ✅ TESTIMONIOS (SIN FONDO) */
.testimonials-section {
  padding: 4rem 2rem;
  background: white;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: var(--background-light);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: var(--shadow-light);
  border: 2px solid var(--blue-color);
}

.testimonial-text {
  font-style: italic;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: var(--black);
}

.testimonial-author {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-name {
  font-weight: bold;
  color: var(--black);
  display: block;
}

.author-role, .author-company {
  font-size: 0.9rem;
  color: var(--black);
  display: block;
}

.testimonial-rating {
  font-size: 1.2rem;
}

/* ✅ CTA SECTION (SIN FONDO) */
.cta-section {
  padding: 4rem 2rem;
  background: var(--background-light);
  color: var(--black);
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--black);
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--black);
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: var(--blue-color);
  color: var(--white);
  border: 2px solid var(--blue-color);
}

.cta-button.secondary {
  background: transparent;
  color: var(--black);
  border: 2px solid var(--black);
}

.cta-button.primary:hover {
  background: #1565c0;
  color: var(--white);
}

.cta-button.secondary:hover {
  background: var(--black);
  color: white;
}

.cta-guarantee {
  font-size: 0.9rem;
  color: var(--black);
}

/* ✅ FOOTER (SIN FONDO) */
.main-footer {
  background: var(--background-light);
  color: var(--black);
  padding: 3rem 2rem 1rem;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3, .footer-section h4 {
  margin-bottom: 1rem;
  color: var(--black);
}

.footer-section p, .footer-section span {
  line-height: 1.6;
  margin-bottom: 0.5rem;
  color: var(--black);
}

.footer-section a {
  color: var(--black);
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: var(--blue-color);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.contact-icon {
  width: 20px;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid var(--border-color);
  color: var(--black);
}

.social-link:hover {
  background: var(--blue-color);
  color: white;
  transform: translateX(5px);
}

.social-icon {
  width: 20px;
  text-align: center;
  font-weight: bold;
}

.company-stats span {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: var(--black);
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  margin-top: 2rem;
  padding-top: 1rem;
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-bottom-content p {
  color: var(--black);
}

.footer-legal {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.footer-legal a {
  color: var(--black);
}

.separator {
  opacity: 0.5;
  color: var(--black);
}

/* ✅ RESPONSIVE */
@media (max-width: 968px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .services-grid-overlay, .financial-grid-overlay, .features-grid-overlay {
    grid-template-columns: 1fr;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .problem-content-overlay {
    grid-template-columns: 1fr;
  }
  
  .hero-actions, .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .section-title, .section-title-overlay {
    font-size: 2rem;
  }
  
  .hero-title {
    font-size: 1.8rem;
  }
  
  .search-input {
    padding: 0.8rem 3rem 0.8rem 1rem;
  }
  
  .financial-grid-overlay, .features-grid-overlay {
    grid-template-columns: 1fr;
  }
  
  .services-grid-overlay {
    grid-template-columns: 1fr;
  }
}
</style>