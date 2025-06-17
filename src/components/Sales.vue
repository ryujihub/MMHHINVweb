<template>
  <div class="sales">
    <div class="sales-header">
      <h1>Sales Management</h1>
      <button class="add-sale-btn" @click="showAddSaleModal = true">
        Add New Sale
      </button>
      <div class="date-filter">
        <input type="date" v-model="startDate">
        <span>to</span>
        <input type="date" v-model="endDate">
        <button @click="applyDateFilter" class="filter-btn">Apply Filter</button>
      </div>
    </div>

    <div class="statistics">
      <div class="stat-card">
        <h3>Total Sales</h3>
        <p class="stat-value">₱{{ totalSales }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Orders</h3>
        <p class="stat-value">{{ totalOrders }}</p>
      </div>
      <div class="stat-card">
        <h3>Average Order Value</h3>
        <p class="stat-value">₱{{ averageOrderValue }}</p>
      </div>
    </div>

    <div class="charts">
      <div class="chart-container">
        <h3>Top Selling Products</h3>
        <canvas ref="topProductsChart"></canvas>
      </div>
    </div>

    <div class="top-products-list">
      <h3>Top Selling Products Details</h3>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Total Quantity Sold</th>
            <th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in sortedProductsWithRevenue" :key="product.name">
            <td>{{ product.name }}</td>
            <td>{{ product.quantity }}</td>
            <td>₱{{ product.revenue.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="recent-sales">
      <h3>Recent Sales</h3>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in recentSales" :key="sale.id">
            <td>{{ sale.orderId }}</td>
            <td>{{ formatDate(sale.date) }}</td>
            <td>{{ sale.customer }}</td>
            <td>
              <ul>
                <li v-for="item in sale.items" :key="item.productCode">
                  {{ item.name }} (x{{ item.quantity }})
                </li>
              </ul>
            </td>
            <td>₱{{ sale.total }}</td>
            <td>
              <span class="status-badge" :class="sale.status.toLowerCase()">
                {{ sale.status }}
              </span>
            </td>
            <td>
              <button class="action-btn delete" @click="deleteSale(sale.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="daily-product-sales">
      <h3>Daily Product Sales</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product Name</th>
            <th>Quantity Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in dailyProductSales" :key="sale.date + sale.productName">
            <td>{{ sale.date }}</td>
            <td>{{ sale.productName }}</td>
            <td>{{ sale.quantity }}</td>
            <td>₱{{ sale.revenue }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="export-section">
      <button @click="exportSalesReport" class="export-btn">
        <i class="fas fa-download"></i> Export Sales Report
      </button>
    </div>

    <!-- Add New Sale Modal -->
    <div v-if="showAddSaleModal" class="modal">
      <div class="modal-content">
        <h2>Record New Sale</h2>
        <form @submit.prevent="saveSale">
          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="saleForm.date" required>
          </div>
          <div class="form-group">
            <label>Customer (Optional)</label>
            <input type="text" v-model="saleForm.customer">
          </div>

          <h4>Items Sold</h4>
          <!-- This section will dynamically add item inputs -->
          <div v-for="(item, index) in saleForm.items" :key="index" class="sale-item-group">
            <div class="form-group">
              <label>Product Code</label>
              <input type="text" v-model="item.productCode" placeholder="Product Code" required>
            </div>
            <div class="form-group">
              <label>Product Name</label>
              <input type="text" v-model="item.name" placeholder="Product Name" required>
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input type="number" v-model.number="item.quantity" required min="1">
            </div>
            <div class="form-group">
              <label>Price Per Unit</label>
              <input type="number" v-model.number="item.pricePerUnit" required min="0" step="0.01">
            </div>
            <button type="button" class="remove-item-btn" @click="removeSaleItem(index)">Remove</button>
          </div>
          <button type="button" class="add-item-btn" @click="addSaleItem">Add Item</button>

          <div class="form-group">
            <label>Status (Optional)</label>
            <input type="text" v-model="saleForm.status">
          </div>

          <div class="modal-actions">
            <button type="submit" class="save-btn">Save Sale</button>
            <button type="button" class="cancel-btn" @click="closeAddSaleModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { db } from '../firebase/config'
import { collection, query, orderBy, onSnapshot, where, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'

export default {
  name: 'Sales',
  setup() {
    const startDate = ref('')
    const endDate = ref('')
    const topProductsChart = ref(null)

    // State to hold sales data from Firebase
    const salesData = ref([])

    // State for Add New Sale Modal
    const showAddSaleModal = ref(false)
    const saleForm = ref({
      date: new Date().toISOString().substr(0, 10), // Default to today's date
      customer: '',
      items: [ // Array to hold multiple items in a sale
        {
          productCode: '', // Keep productCode here for manual entry
          name: '',
          quantity: 1,
          pricePerUnit: 0
        }
      ],
      total: 0, // Will be calculated
      status: 'Completed' // Default status
    })

    // Fetch sales data from Firebase
    const fetchSalesData = (start = null, end = null) => {
      const salesCollectionRef = collection(db, 'sales')

      let q = query(salesCollectionRef);

      // Apply date filtering if start and end dates are provided
      if (start && end) {
        // Convert date strings to Date objects and adjust end date to include the whole day
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        endDateObj.setHours(23, 59, 59, 999);

        q = query(q, where('date', '>=', startDateObj), where('date', '<=', endDateObj));
      }

      // Always order by date for consistency
      q = query(q, orderBy('date', 'desc'));

      onSnapshot(q, (snapshot) => {
        salesData.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('Sales data fetched:', salesData.value)
        // Re-initialize charts and update stats when data changes
        initializeCharts()
      }, (error) => {
        console.error('Error fetching sales data:', error)
        // TODO: Show error message to user
      })
    }

    // Computed property for daily product sales data
    const dailyProductSales = computed(() => {
      const salesByDateAndProduct = {};

      salesData.value.forEach(sale => {
        const saleDate = sale.date.toDate().toLocaleDateString(); // Group by date
        if (!salesByDateAndProduct[saleDate]) {
          salesByDateAndProduct[saleDate] = {};
        }

        sale.items.forEach(item => {
          const productName = item.name; // Group by product name
          if (!salesByDateAndProduct[saleDate][productName]) {
            salesByDateAndProduct[saleDate][productName] = {
              quantity: 0,
              revenue: 0
            };
          }

          // Aggregate quantity and revenue for the product on this date
          salesByDateAndProduct[saleDate][productName].quantity += item.quantity;
          // Assuming item has pricePerUnit, otherwise use item.price if it's per item
          salesByDateAndProduct[saleDate][productName].revenue += (item.quantity * (item.pricePerUnit || 0)); // Adjust based on your data structure
        });
      });

      // Convert the nested object into an array of objects for easier rendering in template
      const result = [];
      Object.keys(salesByDateAndProduct).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
        Object.keys(salesByDateAndProduct[date]).forEach(productName => {
          result.push({
            date: date,
            productName: productName,
            quantity: salesByDateAndProduct[date][productName].quantity,
            revenue: salesByDateAndProduct[date][productName].revenue.toFixed(2)
          });
        });
      });

      return result;
    });

    const totalSales = computed(() => {
      return salesData.value.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)
    })

    const totalOrders = computed(() => {
      return salesData.value.length
    })

    const averageOrderValue = computed(() => {
      if (totalOrders.value === 0) return 0.00;
      return (totalSales.value / totalOrders.value).toFixed(2)
    })

    const recentSales = computed(() => {
      // Assuming recent sales are just the first 5 from the fetched data (ordered by date desc)
      return salesData.value.slice(0, 5) // Or implement more sophisticated recent sales logic
    })

    const applyDateFilter = () => {
      // Fetch data with the selected date range
      fetchSalesData(startDate.value, endDate.value);
    }

    const exportSalesReport = () => {
      // TODO: Implement export functionality
      console.log('Exporting sales report...')
    }

    const formatDate = (date) => {
      if (!date) return '';
      // Assuming date is a Firebase Timestamp or Date object
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString();
    }

    onMounted(() => {
      // Set default date range to last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // Format dates for the input fields (YYYY-MM-DD)
      startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
      endDate.value = today.toISOString().split('T')[0];

      // Fetch data for the default range
      fetchSalesData(startDate.value, endDate.value);

      // Initialize charts (will be re-initialized when data is fetched)
      // initializeCharts(); // Removed as initializeCharts is called inside fetchSalesData now
    })

    // Function to initialize/update charts
    const initializeCharts = () => {
      // Check if the canvas element is available
      if (!topProductsChart.value) {
        console.warn('Top products chart canvas element not available yet.');
        return; // Exit if canvas is not mounted
      }

      // Destroy existing charts if they exist before re-initializing
      if (topProductsChart.chart) {
        topProductsChart.chart.destroy();
      }

      // --- Top Selling Products Chart ---
      // This requires aggregating quantity sold for each product across all sales
      const productSales = salesData.value.reduce((acc, sale) => {
        sale.items.forEach(item => {
          acc[item.name] = (acc[item.name] || 0) + item.quantity;
        });
        return acc;
      }, {});

      // Sort products by quantity sold (descending) and take top N (e.g., 5)
      const sortedProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Get top 5 products

      const topProductsLabels = sortedProducts.map(([name,]) => name);
      const topProductsData = sortedProducts.map(([, quantity]) => quantity);

      if (topProductsChart.chart) {
        // Update data for existing chart
        topProductsChart.chart.data.labels = topProductsLabels;
        topProductsChart.chart.data.datasets[0].data = topProductsData;
        topProductsChart.chart.update();
      } else if (topProductsChart.value) { // Check if canvas element exists
        // Create new chart if it doesn't exist and canvas is available
      const productsCtx = topProductsChart.value.getContext('2d')
        topProductsChart.chart = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: topProductsLabels,
          datasets: [{
              data: topProductsData,
              backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Top 5 Selling Products By Quantity'
              }
            }
          }
        });
      }
    }

    // Computed property for top products list with revenue
    const sortedProductsWithRevenue = computed(() => {
      const productAggregations = {};

      salesData.value.forEach(sale => {
        sale.items.forEach(item => {
          const productName = item.name;
          if (!productAggregations[productName]) {
            productAggregations[productName] = {
              quantity: 0,
              revenue: 0
            };
          }
          productAggregations[productName].quantity += item.quantity;
          productAggregations[productName].revenue += (item.quantity * (item.pricePerUnit || 0)); // Assuming pricePerUnit or similar
        });
      });

      // Convert to array and sort by quantity sold (descending)
      return Object.entries(productAggregations)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity);
    });

    // Function to add an item field to the sale form
    const addSaleItem = () => {
      saleForm.value.items.push({
        productCode: '',
        name: '',
        quantity: 1,
        pricePerUnit: 0
      });
    };

    // Function to remove an item field from the sale form
    const removeSaleItem = (index) => {
      saleForm.value.items.splice(index, 1);
    };

    // Function to close the add sale modal and reset form
    const closeAddSaleModal = () => {
      showAddSaleModal.value = false;
      saleForm.value = {
        date: new Date().toISOString().substr(0, 10),
        customer: '',
        items: [
          {
            productCode: '',
            name: '',
            quantity: 1,
            pricePerUnit: 0
          }
        ],
        total: 0,
        status: 'Completed'
      };
    };

    // Function to save the new sale
    const saveSale = async () => {
      // Calculate total based on items
      saleForm.value.total = saleForm.value.items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);

      try {
        // 1. Save the sale record to Firebase 'sales' collection
        const salesCollectionRef = collection(db, 'sales');
        await addDoc(salesCollectionRef, { ...saleForm.value, date: new Date(saleForm.value.date) }); // Convert date string to Date object for Firebase

        console.log('Sale record saved successfully.'); // Log sale record saved

        // 2. Update Inventory (Decrease Stock, Increase Nabenta) for each item in the sale
        console.log('Attempting to update inventory for sale items...'); // Log start of inventory update
        for (const soldItem of saleForm.value.items) {
          console.log(`Looking up inventory for product code: ${soldItem.productCode}`); // Log product code lookup
          // Query inventory to find the matching item by productCode
          const inventoryItemQuery = query(collection(db, 'inventory'), where('productCode', '==', soldItem.productCode));
          const querySnapshot = await getDocs(inventoryItemQuery);

          if (!querySnapshot.empty) {
            console.log(`Matching inventory item found for product code: ${soldItem.productCode}`); // Log item found
            const inventoryItemDoc = querySnapshot.docs[0]; // Get the first matching document
            const itemData = inventoryItemDoc.data();
            const itemRef = doc(db, 'inventory', inventoryItemDoc.id);

            // Calculate new stock and usage
            const newStock = (itemData.currentStock || 0) - soldItem.quantity; // Decrease On Hand Stock
            const newUsage = (itemData.usage || 0) + soldItem.quantity; // Increase Nabenta

            console.log(`Updating inventory for ${soldItem.name}: currentStock from ${itemData.currentStock} to ${newStock}, usage from ${itemData.usage} to ${newUsage}`); // Log update details

            // Update the inventory item in Firebase
            await updateDoc(itemRef, {
              currentStock: newStock,
              usage: newUsage
              // TODO: Optionally add a stock movement record here with type 'sale'
            });
            console.log(`Inventory updated successfully for ${soldItem.name}`); // Log successful update
          } else {
            console.warn(`Inventory item not found for sold product: ${soldItem.name} (Product Code: ${soldItem.productCode}). Inventory not updated for this item.`);
            // TODO: Handle cases where a sold product isn't in inventory (e.g., alert user, log it)
          }
        }

        console.log('Sale saved and inventory update process completed.'); // Log end of inventory update process

        // Close the modal and reset the form after successful save
        closeAddSaleModal();

        // TODO: Show success message to user

      } catch (error) {
        console.error('Error saving sale or updating inventory:', error);
        // TODO: Show error message to user
      }
    };

    // Function to delete a sale
    const deleteSale = async (saleId) => {
      if (confirm('Are you sure you want to delete this sale record? This will also reverse the inventory changes.')) {
        try {
          const saleRef = doc(db, 'sales', saleId);
          const saleDoc = await getDoc(saleRef);

          if (saleDoc.exists()) {
            const saleData = saleDoc.data();

            // Reverse inventory changes for each item in the sale
            for (const soldItem of saleData.items) {
              const inventoryItemQuery = query(collection(db, 'inventory'), where('productCode', '==', soldItem.productCode));
              const querySnapshot = await getDocs(inventoryItemQuery);

              if (!querySnapshot.empty) {
                const inventoryItemDoc = querySnapshot.docs[0];
                const itemData = inventoryItemDoc.data();
                const itemRef = doc(db, 'inventory', inventoryItemDoc.id);

                // Calculate new stock and usage (reversing the sale)
                const newStock = (itemData.currentStock || 0) + soldItem.quantity; // Add stock back
                const newUsage = Math.max(0, (itemData.usage || 0) - soldItem.quantity); // Decrease Nabenta, ensure not negative

                await updateDoc(itemRef, {
                  currentStock: newStock,
                  usage: newUsage
                  // TODO: Optionally add a stock movement record here with type 'deletion_reversal'
                });
                console.log(`Inventory updated (reverted) for ${soldItem.name}: On Hand Stock increased by ${soldItem.quantity}, Nabenta decreased by ${soldItem.quantity}`);
              } else {
                console.warn(`Inventory item not found for sold product during deletion reversal: ${soldItem.name} (Product Code: ${soldItem.productCode}). Inventory not reverted for this item.`);
              }
            }

            // After reversing inventory, delete the sale record
            await deleteDoc(saleRef);
            console.log('Sale successfully deleted and inventory reverted!');
            // TODO: Show success message to user

          } else {
            console.warn('Sale document not found for deletion:', saleId);
            // TODO: Show error message to user
          }

        } catch (error) {
          console.error('Error removing sale or reverting inventory: ', error);
          // TODO: Show error message to user
        }
      }
    };

    return {
      startDate,
      endDate,
      topProductsChart,
      totalSales,
      totalOrders,
      averageOrderValue,
      recentSales,
      applyDateFilter,
      exportSalesReport,
      formatDate,
      dailyProductSales,
      sortedProductsWithRevenue,
      // New sale related state and functions
      showAddSaleModal,
      saleForm,
      addSaleItem,
      removeSaleItem,
      saveSale,
      closeAddSaleModal,
      // Delete functionality
      deleteSale,
    }
  }
}
</script>

<style scoped>
.sales {
  padding: 20px;
}

.sales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-sale-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-filter input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2196F3;
  margin-top: 10px;
}

.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 300px;
}

.top-products-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.top-products-list h3 {
  margin-bottom: 15px;
}

.recent-sales {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.processing {
  background: #fff3e0;
  color: #ef6c00;
}

.daily-product-sales {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.daily-product-sales h3 {
  margin-bottom: 15px;
}

.export-section {
  display: flex;
  justify-content: flex-end;
}

.export-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .sales-header {
    flex-direction: column;
    gap: 15px;
  }

  .date-filter {
    width: 100%;
    flex-wrap: wrap;
  }

  .charts {
    grid-template-columns: 1fr;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px; /* Adjust max-width as needed */
  max-height: 90vh; /* Limit height to prevent overflow */
  overflow-y: auto; /* Add scroll for many items */
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

h4 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.sale-item-group {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background: #f9f9f9;
}

.remove-item-btn {
  background: #e74c3c; /* Red */
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.add-item-btn {
  background: #3498db; /* Blue */
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background: #2ecc71; /* Green */
  color: white;
}

.cancel-btn {
  background: #95a5a6; /* Gray */
  color: white;
}
</style> 