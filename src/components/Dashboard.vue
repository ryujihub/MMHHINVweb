<template>
  <div class="dashboard">
    <div v-if="!user" class="auth-message">
      <p>Please log in to view the dashboard</p>
      <router-link to="/login" class="login-btn">Login</router-link>
    </div>
    
    <div v-else>
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="date-range">
          <span>Last 30 Days</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-peso-sign"></i>
          </div>
          <div class="stat-info">
            <h3>Total Sales</h3>
            <p class="stat-value">₱{{ totalSales }}</p>
            <span class="stat-change" :class="salesChange >= 0 ? 'positive' : 'negative'">
              {{ salesChange >= 0 ? '+' : '' }}{{ salesChange }}%
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-info">
            <h3>Low Stock Items</h3>
            <p class="stat-value">{{ lowStockItems }}</p>
            <span class="stat-change">Items need attention</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-info">
            <h3>Total Products</h3>
            <p class="stat-value">{{ totalProducts }}</p>
            <span class="stat-change">In inventory</span>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h3>Sales Overview</h3>
          <canvas ref="salesChart"></canvas>
        </div>
        <div class="chart-card">
          <h3>Top Categories</h3>
          <canvas ref="categoriesChart"></canvas>
        </div>
      </div>

      <div class="critical-stock">
        <h3>Critical Stock Alerts</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Current Stock</th>
              <th>Minimum Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in criticalStockItems" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.currentStock }}</td>
              <td>{{ item.minimumStock }}</td>
              <td>
                <span class="status-badge" :class="getStockStatus(item)">
                  {{ getStockStatus(item) }}
                </span>
              </td>
              <td>
                <button class="action-btn" @click="reorderItem(item)">
                  Reorder
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { auth, db } from '../firebase/config'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const user = ref(null)
    const salesChart = ref(null)
    const categoriesChart = ref(null)
    const salesData = ref([])
    const inventoryData = ref([])
    let salesChartInstance = null
    let categoriesChartInstance = null
    const lowStockThreshold = ref(10)

    // Computed properties for statistics
    const totalSales = computed(() => {
      return salesData.value
        .reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0)
        .toFixed(2)
    })

    const salesChange = computed(() => {
      // Calculate percentage change from previous period
      // This is a simplified calculation - you might want to implement a more sophisticated one
      return 12.5 // Placeholder
    })

    const lowStockItems = computed(() => {
      return inventoryData.value.filter(item => 
        item.currentStock <= lowStockThreshold.value
      ).length
    })

    const totalProducts = computed(() => {
      return inventoryData.value.length
    })

    const criticalStockItems = computed(() => {
      return inventoryData.value
        .filter(item => item.currentStock <= lowStockThreshold.value)
        .sort((a, b) => a.currentStock - b.currentStock)
    })

    const getStockStatus = (item) => {
      if (item.currentStock <= 0) return 'out-of-stock'
      if (item.currentStock <= lowStockThreshold.value) return 'critical'
      return 'low'
    }

    const reorderItem = async (item) => {
      try {
        // Update the item's reorder status in Firestore
        const itemRef = doc(db, 'inventory', item.id)
        await updateDoc(itemRef, {
          reorderRequested: true,
          reorderDate: new Date()
        })
        // You might want to add a toast notification here
      } catch (error) {
        console.error('Error requesting reorder:', error)
      }
    }

    // Fetch data from Firestore
    const fetchData = async () => {
      try {
        // Fetch sales data
        const salesQuery = query(
          collection(db, 'sales'),
          orderBy('date', 'desc'),
          limit(30)
        )
        
        onSnapshot(salesQuery, (snapshot) => {
          salesData.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        })

        // Fetch inventory data
        const inventoryQuery = query(collection(db, 'inventory'))
        
        onSnapshot(inventoryQuery, (snapshot) => {
          inventoryData.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        })

        // Fetch user settings
        const user = auth.currentUser
        if (user) {
          const settingsDoc = await getDoc(doc(db, 'settings', user.uid))
          if (settingsDoc.exists()) {
            lowStockThreshold.value = settingsDoc.data().lowStockThreshold ?? 10
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    onMounted(() => {
      // Check authentication state
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
        if (currentUser) {
          fetchData()
        }
      })

      // Initialize charts when data is available
      watch([salesData, inventoryData], () => {
        if (salesData.value.length > 0) {
          initializeCharts()
        }
      })
    })

    const initializeCharts = () => {
      // Destroy existing chart instances if they exist
      if (salesChartInstance) {
        salesChartInstance.destroy()
      }
      if (categoriesChartInstance) {
        categoriesChartInstance.destroy()
      }

      // Initialize sales chart
      const salesCtx = salesChart.value.getContext('2d')
      salesChartInstance = new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: salesData.value.map(sale => {
            // Check if sale.date exists and has the toDate method (expected for Firebase Timestamps)
            if (sale.date && typeof sale.date.toDate === 'function') {
              const saleDate = sale.date.toDate();
               return isNaN(saleDate.getTime()) ? 'Invalid Date' : saleDate.toLocaleDateString();
            } else if (sale.date) {
               // Attempt to parse if it's not a Timestamp but exists (e.g., a string)
               const saleDate = new Date(sale.date);
               return isNaN(saleDate.getTime()) ? 'Invalid Date' : saleDate.toLocaleDateString();
            }
             // If sale.date is missing or null
            return 'Invalid Date';
          }),
          datasets: [{
            label: 'Sales',
            data: salesData.value.map(sale => parseFloat(sale.total) || 0),
            borderColor: '#4CAF50',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })

      // Initialize categories chart
      const categoriesCtx = categoriesChart.value.getContext('2d')
      const categoryData = inventoryData.value.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      }, {})

      categoriesChartInstance = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryData),
          datasets: [{
            data: Object.values(categoryData),
            backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }

    // Clean up charts when component is unmounted
    onUnmounted(() => {
      if (salesChartInstance) {
        salesChartInstance.destroy()
      }
      if (categoriesChartInstance) {
        categoriesChartInstance.destroy()
      }
    })

    return {
      user,
      totalSales,
      salesChange,
      lowStockItems,
      totalProducts,
      criticalStockItems,
      salesChart,
      categoriesChart,
      getStockStatus,
      reorderItem
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.date-range {
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: #f5f6fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #2c3e50;
}

.stat-info h3 {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
  color: #2c3e50;
}

.stat-change {
  font-size: 12px;
  color: #666;
}

.stat-change.positive {
  color: #4CAF50;
}

.stat-change.negative {
  color: #F44336;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 300px;
}

.critical-stock {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.status-badge.critical {
  background: #ffebee;
  color: #c62828;
}

.status-badge.low {
  background: #fff3e0;
  color: #ef6c00;
}

.status-badge.out-of-stock {
  background: #f5f5f5;
  color: #616161;
}

.action-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 10px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    height: 250px;
  }
}

.auth-message {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.login-btn {
  display: inline-block;
  background: #2196F3;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 15px;
}

.login-btn:hover {
  background: #1976D2;
}
</style> 