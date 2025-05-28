<template>
    <div class="quotation-create">
      <h2>Nueva Cotización</h2>
      <form @submit.prevent="submitQuotation">
        <!-- Primera sección: Información general -->
        <div class="form-grid">
          <!-- Campos existentes -->
          <div class="form-group">
            <label for="client">Cliente</label>
            <input
              type="text"
              id="client"
              v-model="clientQuery"
              placeholder="Buscar cliente..."
              @input="fetchClients"
            />
            <ul v-if="filteredClients.length" class="dropdown-list">
              <li
                v-for="client in filteredClients"
                :key="client.id"
                @click="selectClient(client)"
                class="dropdown-item"
              >
                {{ client.name }}
              </li>
            </ul>
          </div>
          <div class="form-group">
            <label for="date">Fecha</label>
            <input type="date" id="date" v-model="quotation.date" />
          </div>
          <div class="form-group">
            <label for="quotationNumber">Número de Cotización</label>
            <input
              type="text"
              id="quotationNumber"
              v-model="quotation.number"
              readonly
            />
          </div>
          <div class="form-group">
            <label for="currency">Moneda</label>
            <input
              type="text"
              id="currency"
              v-model="quotation.currency"
              readonly
            />
          </div>
        </div>
      </form>
  
      <!-- Input para cargar archivo CSV -->
      <div class="csv-upload">
        <label for="csvFile">Cargar archivo CSV:</label>
        <input type="file" id="csvFile" accept=".csv" @change="handleFileUpload" />
      </div>
  
      <!-- Contenedor independiente para la tabla -->
      <div class="product-table-container">
        <table class="product-table">
          <thead>
            <tr>
              <th style="width: 20%;">Producto</th>
              <th style="width: 15%;">Descripción</th>
              <th style="width: 10%;">Cant</th>
              <th style="width: 15%;">Valor Unit.</th>
              <th style="width: 10%;">Desc.</th>
              <th style="width: 10%;">Imp. Cargo</th>
              <th style="width: 10%;">Imp. Ret.</th>
              <th style="width: 15%;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="index">
              <td>
                <input
                  type="text"
                  v-model="product.query"
                  placeholder="Buscar producto..."
                />
              </td>
              <td>{{ product.description }}</td>
              <td>
                <input
                  type="number"
                  v-model.number="product.quantity"
                  @input="updateTotal(index)"
                />
              </td>
              <td>
                <input
                  type="number"
                  v-model.number="product.unitPrice"
                  @input="updateTotal(index)"
                />
              </td>
              <td>
                <input
                  type="number"
                  v-model.number="product.discount"
                  @input="updateTotals"
                />
              </td>
              <td>
                <input type="number" v-model.number="product.taxCharge" />
              </td>
              <td>
                <input type="number" v-model.number="product.taxRetention" />
              </td>
              <td>{{ product.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Nueva sección: Condiciones Comerciales -->
      <div class="commercial-conditions">
        <h3>Condiciones Comerciales</h3>
        <textarea
          v-model="quotation.comments"
          placeholder="Ingrese las condiciones comerciales aquí..."
        ></textarea>
      </div>
  
      <!-- Totales -->
      <div class="totals">
        <div class="totals-row">
          <span>Total Bruto:</span>
          <span>{{ totalBruto }}</span>
        </div>
        <div class="totals-row">
          <span>Descuentos:</span>
          <span>{{ totalDescuentos }}</span>
        </div>
        <div class="totals-row">
          <span>Total Neto:</span>
          <span>{{ totalNeto }}</span>
        </div>
      </div>
  
      <!-- Botones -->
      <div class="actions">
        <button type="button" class="button save" @click="saveQuotation">
          Guardar
        </button>
        <button type="button" class="button save-send" @click="saveAndSendQuotation">
          Guardar y Enviar
        </button>
        <button type="button" class="button cancel" @click="cancelQuotation">
          Cancelar
        </button>
      </div>
    </div>
  </template>
  
<script>
import axios from '@/services/axios';
import { jsPDF } from 'jspdf'; // Importación para generar PDFs

export default {
  name: 'QuotationCreateView',
  data() {
    return {
      clientQuery: '',
      clients: [],
      filteredClients: [],
      quotation: {
        client: null,
        date: new Date().toISOString().split('T')[0],
        number: '',
        currency: 'COP - Peso Colombiano',
        comments: '',
      },
      products: [
        {
          query: '',
          suggestions: [],
          description: '',
          quantity: 0,
          unitPrice: 0,
          discount: 0,
          taxCharge: 0,
          taxRetention: 0,
          total: 0,
        },
      ],
    };
  },
  computed: {
    totalBruto() {
      return this.products.reduce((sum, product) => sum + product.total, 0);
    },
    totalDescuentos() {
      return this.products.reduce((sum, product) => sum + product.discount, 0);
    },
    totalNeto() {
      return this.totalBruto - this.totalDescuentos;
    },
  },
  methods: {
    async fetchClients() {
      if (this.clientQuery.length === 0) {
        this.filteredClients = [];
        return;
      }
      try {
        const response = await axios.get('/clients', {
          params: { query: this.clientQuery },
        });
        this.filteredClients = response.data;
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    },
    selectClient(client) {
      this.quotation.client = client;
      this.clientQuery = client.name;
      this.filteredClients = [];
    },
    async fetchQuotationNumber() {
      try {
        const response = await axios.get('/quotations/next-number');
        this.quotation.number = response.data.number;
      } catch (error) {
        console.error('Error al obtener el número de cotización:', error);
      }
    },
    async fetchProductSuggestions(index) {
      const query = this.products[index].query;
      if (query.length === 0) {
        this.products[index].suggestions = [];
        return;
      }
      try {
        const response = await axios.get('/products', {
          params: { query },
        });
        this.products[index].suggestions = response.data;
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    },
    selectProduct(index, product) {
      const selectedProduct = this.products[index];
      selectedProduct.query = product.name;
      selectedProduct.description = product.description;
      selectedProduct.unitPrice = product.unitPrice;
      selectedProduct.suggestions = [];
      this.updateTotal(index);
      this.addProductRow(); // Generar una nueva fila automáticamente
    },
    updateTotal(index) {
      const product = this.products[index];
      product.total = product.quantity * product.unitPrice;
      this.updateTotals();
    },
    updateTotals() {
      // Recalcula los totales generales
    },
    addProductRow() {
      this.products.push({
        query: '',
        suggestions: [],
        description: '',
        quantity: 0,
        unitPrice: 0,
        discount: 0,
        taxCharge: 0,
        taxRetention: 0,
        total: 0,
      });
    },
    async submitQuotation() {
      try {
        const response = await axios.post('/quotations', {
          ...this.quotation,
          products: this.products,
        });
        alert('Cotización creada exitosamente');
        console.log('Respuesta del servidor:', response.data);
      } catch (error) {
        console.error('Error al crear la cotización:', error);
        alert('Hubo un error al crear la cotización.');
      }
    },
    saveQuotation() {
      // Lógica para guardar la cotización en la base de datos
      try {
        axios.post('/quotations', {
          ...this.quotation,
          products: this.products,
        });
        alert('Cotización guardada correctamente.');
      } catch (error) {
        console.error('Error al guardar la cotización:', error);
        alert('Hubo un error al guardar la cotización.');
      }
    },
    saveAndSendQuotation() {
      // Lógica para guardar la cotización y generar un archivo descargable
      try {
        axios.post('/quotations', {
          ...this.quotation,
          products: this.products,
        });
        alert('Cotización guardada correctamente.');

        // Generar un archivo PDF (usando jsPDF)
        const doc = new jsPDF();
        doc.text('Cotización', 10, 10);
        doc.text(`Cliente: ${this.quotation.client?.name || 'N/A'}`, 10, 20);
        doc.text(`Fecha: ${this.quotation.date}`, 10, 30);
        doc.text(`Total Neto: ${this.totalNeto}`, 10, 40);
        doc.save('cotizacion.pdf');
      } catch (error) {
        console.error('Error al guardar y enviar la cotización:', error);
        alert('Hubo un error al guardar y enviar la cotización.');
      }
    },
    cancelQuotation() {
      // Lógica para limpiar toda la información registrada
      if (confirm('¿Estás seguro de que deseas cancelar la cotización?')) {
        this.quotation = {
          client: null,
          date: new Date().toISOString().split('T')[0],
          number: '',
          currency: 'COP - Peso Colombiano',
          comments: '',
        };
        this.products = [
          {
            query: '',
            suggestions: [],
            description: '',
            quantity: 0,
            unitPrice: 0,
            discount: 0,
            taxCharge: 0,
            taxRetention: 0,
            total: 0,
          },
        ];
      }
    },
  },
  async created() {
    await this.fetchQuotationNumber();
  },
};
</script>
 
 <style scoped>
 .quotation-create {
   max-width: 1200px;
   margin: 0 auto;
   padding: 1rem;
   background-color: #f9f9f9;
   border-radius: 8px;
   box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
 }
 
 h2 {
   text-align: center;
   margin-bottom: 1rem;
 }
 
 .form-grid {
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   gap: 1rem;
 }
 
 .form-group {
   display: flex;
   flex-direction: column;
 }
 
 label {
   font-weight: bold;
   margin-bottom: 0.5rem;
 }
 
 input,
 textarea {
   padding: 0.5rem;
   border: 1px solid #ccc;
   border-radius: 4px;
 }
 
 textarea {
   resize: none;
   height: 100px;
 }
 
 .dropdown-list {
   list-style: none;
   padding: 0;
   margin: 0.5rem 0 0;
   border: 1px solid #ccc;
   border-radius: 4px;
   background-color: white;
   max-height: 150px;
   overflow-y: auto;
 }
 
 .dropdown-item {
   padding: 0.5rem;
   cursor: pointer;
 }
 
 .dropdown-item:hover {
   background-color: #f0f0f0;
 }
 
 .totals {
   margin-top: 1rem;
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
   align-items: flex-end; 
 }
 
 .totals-row {
   display: flex;
   justify-content: space-between;
   font-weight: bold;
 }
 
 .submit-button {
   margin-top: 1rem;
   padding: 0.75rem;
   background-color: #003366;
   color: white;
   border: none;
   border-radius: 4px;
   cursor: pointer;
   font-weight: bold;
 }
 
 .submit-button:hover {
   background-color: #005c8b;
 }
 .product-table-container {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  max-width: 100%;
  display:block
}

.product-table {
  width: 100%;
  /* border-collapse: collapse; */
  font-size: 0.8rem;
  min-width: 800px;
  table-layout: fixed;
}

.product-table th,
.product-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
  word-wrap: break-word;
    overflow: hidden;
}
.product-table input [type="text"],
.product-table input [type="number"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing:border-box;
  word-wrap: break-word;
}
.commercial-conditions {
  margin-top: 2rem;
}

.commercial-conditions textarea {
  width: 100%;
  height: 100px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
}

.actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.button.save {
  background-color: #28a745;
  color: white;
}

.button.save:hover {
  background-color: #218838;
}

.button.save-send {
  background-color: #007bff;
  color: white;
}

.button.save-send:hover {
  background-color: #0056b3;
}

.button.cancel {
  background-color: #dc3545;
  color: white;
}

.button.cancel:hover {
  background-color: #c82333;
}
.csv-upload {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.csv-upload label {
  font-weight: bold;
  margin-right: 1rem;
}

.csv-upload input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

 </style>