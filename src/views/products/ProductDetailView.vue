<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\products\ProductDetailView.vue -->
<template>
    <div class="product-detail">
      <h2>Detalles del Producto</h2>
      <p><strong>Nombre:</strong> {{ product.name }}</p>
      <p><strong>Código:</strong> {{ product.code }}</p>
      <p><strong>Descripción:</strong> {{ product.description }}</p>
      <p><strong>Precio:</strong> ${{ product.price }}</p>
      <p><strong>Cantidad en Stock:</strong> {{ product.stock_quantity }}</p>
    </div>
  </template>
  
  <script>
  import axios from '@/services/axios';
  
  export default {
    name: 'ProductDetailView',
    data() {
      return {
        product: {}, // Información del producto
      };
    },
    async created() {
      const productId = this.$route.params.id; // Obtener el ID del producto desde la URL
      try {
        const response = await axios.get(`/products/${productId}`);
        this.product = response.data; // Cargar los detalles del producto
      } catch (error) {
        console.error('Error al obtener detalles del producto:', error);
      }
    },
  };
  </script>
  
  <style scoped>
  .product-detail {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  </style>