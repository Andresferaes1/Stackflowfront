// Importamos axios
import axios from 'axios';

// Creamos una instancia de axios con la configuración global
const instance = axios.create({
  baseURL: 'http://localhost:8000', // URL base de tu API de FastAPI
  headers: {
    'Content-Type': 'application/json',  // Aseguramos que los datos sean enviados como JSON
  },
});

// Agregar un interceptor para los encabezados (para manejar el token de autenticación)
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token'); // Obtener el token desde el almacenamiento local
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Añadir el token al encabezado
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Agregar un interceptor de respuesta para manejo global de errores
instance.interceptors.response.use(
  (response) => {
    return response;  // Si la respuesta es exitosa, la retornamos tal cual
  },
  (error) => {
    if (error.response) {
      // Si el servidor responde con un error
      console.error(`Error: ${error.response.status} - ${error.response.data.detail || 'Error desconocido'}`);
    } else {
      // Si no hay respuesta del servidor (ej. desconexión de red)
      console.error('Error de red o servidor no disponible.');
    }
    return Promise.reject(error); // Propagar el error
  }
);

export default instance;  // Exponemos la instancia de axios para usarla en otros archivos