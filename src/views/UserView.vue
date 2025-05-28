<template>
    <div class="user-dashboard">
      <div class="user-container">
        <!-- Sección izquierda: Información del usuario -->
        <div class="user-info">
            <div class="user-photo">
           <img
             v-if="user.photo"
             :src="user.photo"
             alt="Foto del usuario"
         />
        <div v-else class="placeholder-photo">
          <span>Sin foto</span>
      </div>
    </div> 



          <h2 class="user-name">{{ user.name }}</h2>
          <p class="user-business">{{ user.businessName }}</p>
          <p class="user-contact">📞 {{ user.contact }}</p>
          <p class="user-address">📍 {{ user.address }}</p>
        </div>
  
        <!-- Sección derecha: Información adicional -->
        <div class="user-details">
          <div class="user-stats">
            <h3>Información del Usuario</h3>
            <p>Última conexión: {{ user.lastConnection }}</p>
            <p>Fecha de registro: {{ user.registrationDate }}</p>
            <p>Últimos cargues:</p>
            <ul>
              <li v-for="(upload, index) in user.lastUploads" :key="index">
                {{ upload.date }}
                <button @click="viewProducts(upload.id)">Ver productos</button>
              </li>
            </ul>
            <p>Últimas facturas:</p>
            <ul>
              <li v-for="(invoice, index) in user.lastInvoices" :key="index">
                Factura #{{ invoice.number }}
                <button @click="viewInvoice(invoice.id)">Ver factura</button>
              </li>
            </ul>
          </div>
  
          <!-- Contenedor de notificaciones -->
          <div class="user-notifications">
            <h3>Notificaciones</h3>
            <ul>
              <li v-for="(notification, index) in user.notifications" :key="index">
                {{ notification.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "UserView",
    data() {
      return {
        user: {
          name: "Gustavo Giraldo",
          businessName: "Comercializadora Gustanet",
          contact: "123-456-7890",
          address: "Calle 123 #45-67, Ciudad",
          lastConnection: "2025-05-25 14:30",
          registrationDate: "2023-01-15",
          lastUploads: [
            { id: 1, date: "2025-05-20" },
            { id: 2, date: "2025-05-18" },
          ],
          lastInvoices: [
            { id: 101, number: "F-2025-001" },
            { id: 102, number: "F-2025-002" },
            { id: 103, number: "F-2025-003" },
          ],
          notifications: [
            { message: "Producto X está agotado." },
            { message: "No se ha registrado actividad en los últimos 7 días." },
          ],
        },
      };
    },
    methods: {
      viewProducts(uploadId) {
        alert(`Ver productos del cargue con ID: ${uploadId}`);
      },
      viewInvoice(invoiceId) {
        alert(`Ver factura con ID: ${invoiceId}`);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Contenedor principal - Ocupa toda la página */
  .user-dashboard {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    background-color: #f9f9f9;
    min-height: 100vh;
    width: 100%;
  }
  
  /* Contenedor que divide la página en dos secciones */
  .user-container {
    display: flex;
    gap: 2rem;
    width: 100%;
    max-width: 100%;
    margin:0 1rem;
  }
  
  /* Panel izquierdo - Información básica del usuario */
  .user-info {
    flex: 1;
    min-width: 300px;
    background-color: #ffffff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  /* Contenedor de la foto de perfil */
  .user-photo {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    margin-bottom: 1rem;
  }
  
  /* Imagen de perfil */
  .user-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Placeholder cuando no hay foto */
  .placeholder-photo {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #888;
    font-size: 0.9rem;
    font-weight: bold;
  }
  
  /* Nombre del usuario */
  .user-name {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  /* Datos de contacto del usuario */
  .user-business,
  .user-contact,
  .user-address {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  /* Panel derecho - Contenedor de estadísticas y notificaciones */
  .user-details {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }
  
  /* Tarjetas de estadísticas y notificaciones */
  .user-stats,
  .user-notifications {
    background-color: #ffffff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
  }
  
  /* Títulos de las secciones de estadísticas y notificaciones */
  .user-stats h3,
  .user-notifications h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    
  }
  
  /* Listas de estadísticas y notificaciones */
  .user-stats ul,
  .user-notifications ul {
    list-style: none;
    padding: 0;
  }
  
  /* Elementos de las listas */
  .user-stats li,
  .user-notifications li {
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.5rem 0;
  }
  
  /* Estilo general de botones */
  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  /* Efecto hover en botones */
  button:hover {
    background-color: #0056b3;
  }
  
  /* Ajustes responsivos para dispositivos móviles */
  @media (max-width: 768px) {
    /* Cambio a layout vertical en móviles */
    .user-container {
      flex-direction: column;
      margin: 0;
    }
  
    /* Ajuste de anchos para móviles */
    .user-info,
    .user-details {
      width: 100%;
    }
  
    /* Reducción de padding en móviles */
    .user-dashboard {
      padding: 1rem;
    }
  
    /* Ajuste de texto en móviles */
    .user-stats > p {
      text-align: left;
      padding: 0.5rem 0;
      width: 100%;
    }
  }
  </style>