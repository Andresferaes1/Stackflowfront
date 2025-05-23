<!-- filepath: d:\Users\Andresferaes\Documents\PROYECTOADSO\vuejs\src\views\products\ProductReadView.vue -->
<template>
  <div class="product-read">
    <h2>Consultar Productos</h2>
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar por nombre o código de producto..."
        @input="fetchProducts"
      />
    </div>
    <ul class="product-list">
      <li
        v-for="product in filteredProducts"
        :key="product.id"
        @click="selectProduct(product)"
        class="product-item"
      >
        {{ product.name }} ({{ product.code }})
      </li>
    </ul>
    <p v-if="filteredProducts.length === 0 && searchQuery">No se encontraron coincidencias.</p>
  </div>
</template>

<script>
import axios from '@/services/axios';

export default {
  name: 'ProductReadView',
  data() {
    return {
      searchQuery: '', // Texto ingresado en la barra de búsqueda
      products: [], // Lista completa de productos obtenida del backend
    };
  },
  computed: {
    filteredProducts() {
      // Filtrar productos por nombre o código según la búsqueda
      return this.products.filter(
        (product) =>
          product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product.code.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async fetchProducts() {
      if (this.searchQuery.length === 0) {
        this.products = []; // Limpiar resultados si no hay búsqueda
        return;
      }

      try {
        const response = await axios.get('/products', {
          params: { query: this.searchQuery },
        });
        this.products = response.data; // Actualizar la lista de productos
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    },
    selectProduct(product) {
      // Navegar a la vista de detalles del producto seleccionado
      this.$router.push(`/dashboard/products/detail/${product.id}`);
    },
  },
};
</script>

<style scoped>
.product-read {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}
.search-bar input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.product-list {
  list-style: none;
  padding: 0;
}
.product-item {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}
.product-item:hover {
  background-color: #f0f0f0;
}
</style>