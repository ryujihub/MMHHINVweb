<template>
  <div class="inventory-container">
    <!-- Navigation Header -->
    <nav class="nav-header" :class="{ 'nav-shifted': !isSidebarCollapsed }">
      <div class="nav-content">
        <div class="nav-left">
          <button @click="toggleSidebar" class="menu-toggle">
            <i class="fas fa-bars"></i>
          </button>
          <h1>MMH Hardware Inventory System</h1>
        </div>
        <div class="user-info" v-if="user">
          <div class="user-details">
            <i class="fas fa-user-circle"></i>
            <span class="user-email">{{ user.email }}</span>
          </div>
          <div class="nav-actions">
            <button @click="exportSummaryReport" class="export-btn">
              <i class="fas fa-file-export"></i> Export Report
            </button>
            <button @click="logout" class="logout-btn">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Add this after the nav-header -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <i class="fas fa-warehouse"></i>
        <span v-if="!isSidebarCollapsed">MMH Hardware</span>
        <button @click="toggleSidebar" class="collapse-btn">
          <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>
      
      <div class="sidebar-menu">
        <a href="#" class="menu-item" :class="{ active: currentView === 'dashboard' }" @click="setView('dashboard')">
          <i class="fas fa-tachometer-alt"></i>
          <span v-if="!isSidebarCollapsed">Dashboard</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'inventory' }" @click="setView('inventory')">
          <i class="fas fa-boxes"></i>
          <span v-if="!isSidebarCollapsed">Inventory</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'categories' }" @click="setView('categories')">
          <i class="fas fa-tags"></i>
          <span v-if="!isSidebarCollapsed">Categories</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'reports' }" @click="setView('reports')">
          <i class="fas fa-chart-bar"></i>
          <span v-if="!isSidebarCollapsed">Reports</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'settings' }" @click="setView('settings')">
          <i class="fas fa-cog"></i>
          <span v-if="!isSidebarCollapsed">Settings</span>
        </a>
      </div>
    </div>

    <!-- Wrap the main content in a container -->
    <div class="main-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="inventory-content" v-if="user">
        <!-- Dashboard View -->
        <div v-if="currentView === 'dashboard'" class="dashboard-view">
          <div class="dashboard-stats">
            <div class="stat-card">
              <i class="fas fa-boxes"></i>
              <div class="stat-info">
                <h3>Total Items</h3>
                <p>{{ items.length }}</p>
              </div>
            </div>
            <div class="stat-card">
              <i class="fas fa-layer-group"></i>
              <div class="stat-info">
      <h3>Categories</h3>
                <p>{{ categories.length }}</p>
              </div>
            </div>
            <div class="stat-card">
              <i class="fas fa-tools"></i>
              <div class="stat-info">
                <h3>{{ getCurrentCategoryName }}</h3>
                <p>{{ filteredItems.length }} items</p>
              </div>
            </div>
          </div>
          
          <!-- Add Quick Summary -->
          <div class="quick-summary">
            <h3><i class="fas fa-chart-pie"></i> Inventory Overview</h3>
            <div class="summary-grid">
              <div class="summary-card">
                <h4>Low Stock Items</h4>
                <p>{{ getLowStockCount }} items</p>
              </div>
              <div class="summary-card">
                <h4>Total Value</h4>
                <p>₱{{ getTotalValue }}</p>
              </div>
              <div class="summary-card">
                <h4>Most Stocked Category</h4>
                <p>{{ getMostStockedCategory }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory View -->
        <div v-if="currentView === 'inventory'" class="inventory-view">
          <!-- Move existing inventory content here -->
          <div class="categories-nav">
            <button 
          v-for="category in categories" 
              :key="category.id"
              :class="['category-btn', selectedCategory === category.id ? 'active' : '']"
              @click="selectCategory(category.id)"
            >
              <i :class="getCategoryIcon(category.id)"></i>
              {{ category.name }}
            </button>
    </div>
    <div class="main-content">
            <!-- Add Item Form -->
            <div class="add-item-section">
              <div class="add-item-form">
                <h3><i class="fas fa-plus-circle"></i> Add New Item</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Item Name</label>
                    <input v-model="newItem.name" placeholder="Enter item name" />
                  </div>
                  <div class="form-group">
                    <label>Quantity</label>
                    <input v-model.number="newItem.quantity" type="number" placeholder="Enter quantity" />
                  </div>
                  <div class="form-group">
                    <label>Unit</label>
                    <input v-model="newItem.unit" placeholder="e.g., pcs, boxes" />
                  </div>
                  <div class="form-group">
                    <label>Price (₱)</label>
                    <input 
                      v-model.number="newItem.price" 
                      type="number" 
                      step="0.01" 
                      placeholder="Enter price in peso"
                    />
                  </div>
                  <button @click="addItem" class="add-btn">
                    <i class="fas fa-plus"></i> Add Item
                  </button>
                </div>
              </div>
      </div>

            <!-- Items List -->
            <div class="items-list">
              <h3>
                <i class="fas fa-list"></i> 
                {{ getCurrentCategoryName }} Inventory
              </h3>
      <div class="items-grid">
        <div v-for="item in filteredItems" :key="item.id" class="item-card">
                  <div class="item-header">
                    <h4>{{ item.name }}</h4>
                    <button @click="deleteItem(item.id)" class="delete-btn">
                      <i class="fas fa-trash"></i>
                    </button>
          </div>
                  <div class="item-details">
                    <div class="quantity-control">
                      <button @click="updateQuantity(item.id, item.quantity - 1)" class="quantity-btn">
                        <i class="fas fa-minus"></i>
                      </button>
                      <div class="quantity-input-wrapper">
                        <input 
                          type="number" 
                          v-model.number="item.quantity" 
                          @change="updateQuantity(item.id, item.quantity)"
                          class="quantity-input"
                          min="0"
                        />
                        <span class="unit">{{ item.unit }}</span>
        </div>
                      <button @click="updateQuantity(item.id, item.quantity + 1)" class="quantity-btn">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <div class="price-control">
                      <label>Price (₱):</label>
                      <div class="price-input-wrapper">
                        <input 
                          type="number" 
                          v-model.number="item.price" 
                          @change="updatePrice(item.id, item.price)"
                          class="price-input"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <div class="item-meta">
                      <span class="category-tag">{{ getCurrentCategoryName }}</span>
                      <span class="total-price">Total: ₱{{ formatPrice(item.price * item.quantity) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>
    </div>

        <!-- Categories View -->
        <div v-if="currentView === 'categories'" class="categories-view">
          <h2><i class="fas fa-tags"></i> Category Management</h2>
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-card">
              <div class="category-info">
                <i :class="getCategoryIcon(category.id)"></i>
                <h3>{{ category.name }}</h3>
              </div>
              <div class="category-stats">
                <p>Items: {{ getCategoryItemCount(category.id) }}</p>
                <p>Value: ₱{{ formatPrice(getCategoryValue(category.id)) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports View -->
        <div v-if="currentView === 'reports'" class="reports-view">
          <h2><i class="fas fa-chart-bar"></i> Reports</h2>
          <div class="reports-grid">
            <div class="report-card">
              <h3>Inventory Summary</h3>
              <button @click="exportSummaryReport" class="report-btn">
                <i class="fas fa-download"></i> Download Report
              </button>
            </div>
            <div class="report-card">
              <h3>Low Stock Report</h3>
              <button @click="exportLowStockReport" class="report-btn">
                <i class="fas fa-download"></i> Download Report
              </button>
            </div>
          </div>
        </div>

        <!-- Settings View -->
        <div v-if="currentView === 'settings'" class="settings-view">
          <h2><i class="fas fa-cog"></i> Settings</h2>
          <div class="settings-grid">
            <div class="settings-card">
              <h3>User Settings</h3>
              <div class="user-settings">
                <p><strong>Email:</strong> {{ user.email }}</p>
                <button class="settings-btn" @click="logout">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <div v-else class="login-container">
        <div class="login-form">
          <div class="login-header">
            <i class="fas fa-warehouse"></i>
            <h2>Hardware Inventory</h2>
          </div>
          <div class="form-group">
            <label><i class="fas fa-envelope"></i> Email</label>
            <input v-model="loginForm.email" type="email" placeholder="Enter your email" />
          </div>
          <div class="form-group">
            <label><i class="fas fa-lock"></i> Password</label>
            <input v-model="loginForm.password" type="password" placeholder="Enter your password" />
          </div>
          <button @click="login" class="login-btn">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { saveAs } from 'file-saver'

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where 
} from 'firebase/firestore'

export default {
  name: 'Inventory',
  setup() {
    const db = getFirestore()
    const auth = getAuth()
    const user = ref(null)
    const selectedCategory = ref('electrical')
    const items = ref([])
    const loginForm = ref({
      email: '',
      password: ''
    })

    const categories = ref([
      { id: 'electrical', name: 'Electrical' },
      { id: 'plumbing', name: 'Plumbing' },
      { id: 'carpentry', name: 'Carpentry' },
      { id: 'painting', name: 'Painting' },
      { id: 'safety', name: 'Safety Equipment' },
      { id: 'general', name: 'General Tools' }
    ])
    
    const newItem = ref({
      name: '',
      quantity: 0,
      unit: '',
      price: 0,
      category: 'electrical'
    })

    const isLoading = ref(false)
    const toast = useToast()

    const filteredItems = computed(() => {
      return items.value.filter(item => item.category === selectedCategory.value)
    })

    const getCurrentCategoryName = computed(() => {
      const category = categories.value.find(c => c.id === selectedCategory.value)
      return category ? category.name : ''
    })

    const login = async () => {
      try {
        await signInWithEmailAndPassword(
          auth,
          loginForm.value.email,
          loginForm.value.password
        )
      } catch (error) {
        toast.error('Login failed: ' + error.message)
      }
    }

    const logout = async () => {
      try {
        await signOut(auth)
        user.value = null
      } catch (error) {
        toast.error('Logout failed: ' + error.message)
      }
    }

    const loadItems = async () => {
      isLoading.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'inventory'))
        items.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('Items loaded successfully')
      } catch (error) {
        console.error('Error loading items:', error)
        toast.error('Failed to load items. Please try again.')
      } finally {
        isLoading.value = false
      }
    }

    const addItem = async () => {
      if (!newItem.value.name || !newItem.value.quantity) {
        toast.error('Please fill in all required fields')
        return
      }

      try {
        const itemData = {
          ...newItem.value,
          category: selectedCategory.value,
          createdAt: new Date(),
          userId: user.value.uid
        }
        await addDoc(collection(db, 'inventory'), itemData)
        await loadItems()
        newItem.value = {
          name: '',
          quantity: 0,
          unit: '',
          price: 0,
          category: selectedCategory.value
        }
        toast.success('Item added successfully')
      } catch (error) {
        console.error('Error adding item:', error)
        toast.error('Failed to add item. Please try again.')
      }
    }

    const updateQuantity = async (itemId, newQuantity) => {
      if (newQuantity < 0) {
        toast.error('Quantity cannot be negative')
        return
      }
      try {
        const itemRef = doc(db, 'inventory', itemId)
        await updateDoc(itemRef, {
          quantity: newQuantity
        })
        await loadItems()
        toast.success('Quantity updated successfully')
      } catch (error) {
        console.error('Error updating quantity:', error)
        toast.error('Failed to update quantity. Please try again.')
      }
    }

    const updatePrice = async (itemId, newPrice) => {
      if (newPrice < 0) {
        toast.error('Price cannot be negative')
        return
      }
      try {
        const itemRef = doc(db, 'inventory', itemId)
        await updateDoc(itemRef, {
          price: newPrice,
          lastUpdated: new Date()
        })
        await loadItems()
        toast.success('Price updated successfully')
      } catch (error) {
        console.error('Error updating price:', error)
        toast.error('Failed to update price: ' + error.message)
      }
    }

    const deleteItem = async (itemId) => {
      try {
        await deleteDoc(doc(db, 'inventory', itemId))
        await loadItems()
        toast.success('Item deleted successfully')
      } catch (error) {
        console.error('Error deleting item:', error)
        toast.error('Failed to delete item. Please try again.')
      }
    }

    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId
    }

    const getCategoryIcon = (categoryId) => {
      const icons = {
        electrical: 'fas fa-bolt',
        plumbing: 'fas fa-faucet',
        carpentry: 'fas fa-hammer',
        painting: 'fas fa-paint-roller',
        safety: 'fas fa-hard-hat',
        general: 'fas fa-tools'
      }
      return icons[categoryId] || 'fas fa-box'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price)
    }

    const calculateTotals = () => {
      const totals = {
        totalItems: items.value.length,
        totalValue: 0,
        categoryTotals: {},
        categoryValues: {}
      }

      // Initialize category totals
      categories.value.forEach(category => {
        totals.categoryTotals[category.id] = 0
        totals.categoryValues[category.id] = 0
      })

      // Calculate totals
      items.value.forEach(item => {
        const itemValue = (item.price || 0) * (item.quantity || 0)
        totals.totalValue += itemValue
        totals.categoryTotals[item.category]++
        totals.categoryValues[item.category] += itemValue
      })

      return totals
    }

    const exportSummaryReport = async () => {
      try {
        const totals = calculateTotals()
        const date = new Date()
        
        // Create report content with Word-compatible HTML
        let report = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
          <head>
            <meta charset="utf-8">
            <title>MMH Hardware Inventory Report</title>
            <style>
              body { font-family: 'Arial', sans-serif; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin: 20px 0; }
              .section-title { 
                background-color: #2c3e50; 
                color: white; 
                padding: 10px; 
                margin: 20px 0 10px 0; 
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 10px 0; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { background-color: #f8f9fa; }
              .low-stock { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>MMH Hardware Inventory Report</h1>
              <p>Generated on: ${format(date, 'MMMM d, yyyy h:mm a')}</p>
              <p>Generated by: ${user.value.email}</p>
            </div>

            <div class="section">
              <h2 class="section-title">OVERALL SUMMARY</h2>
              <table>
                <tr>
                  <th>Total Items</th>
                  <td>${totals.totalItems}</td>
                </tr>
                <tr>
                  <th>Total Inventory Value</th>
                  <td>₱${formatPrice(totals.totalValue)}</td>
                </tr>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">CATEGORY BREAKDOWN</h2>
              ${categories.value.map(category => {
                const categoryItems = items.value.filter(item => item.category === category.id)
                return `
                  <h3>${category.name}</h3>
                  <table>
                    <tr>
                      <th>Total Items</th>
                      <td>${totals.categoryTotals[category.id]}</td>
                    </tr>
                    <tr>
                      <th>Total Value</th>
                      <td>₱${formatPrice(totals.categoryValues[category.id])}</td>
                    </tr>
                  </table>

                  ${categoryItems.length > 0 ? `
                    <table>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Price</th>
                        <th>Total Value</th>
                      </tr>
                      ${categoryItems.map(item => `
                        <tr>
                          <td>${item.name}</td>
                          <td>${item.quantity}</td>
                          <td>${item.unit}</td>
                          <td>₱${formatPrice(item.price)}</td>
                          <td>₱${formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      `).join('')}
                    </table>
                  ` : '<p>No items in this category</p>'}
                `
              }).join('')}
            </div>

            <div class="section">
              <h2 class="section-title">LOW STOCK ITEMS (Less than 10 units)</h2>
              ${(() => {
                const lowStockItems = items.value.filter(item => item.quantity < 10)
                if (lowStockItems.length > 0) {
                  return `
                    <table>
                      <tr>
                        <th>Item Name</th>
                        <th>Current Stock</th>
                        <th>Unit</th>
                        <th>Category</th>
                      </tr>
                      ${lowStockItems.map(item => `
                        <tr class="low-stock">
                          <td>${item.name}</td>
                          <td>${item.quantity}</td>
                          <td>${item.unit}</td>
                          <td>${categories.value.find(c => c.id === item.category)?.name}</td>
                        </tr>
                      `).join('')}
                    </table>
                  `
                }
                return '<p>No items are low in stock.</p>'
              })()}
            </div>
          </body>
          </html>
        `

        // Convert the HTML string to a Blob
        const blob = new Blob([report], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8' 
        })
        saveAs(blob, `MMH_Hardware_Inventory_Report_${format(date, 'yyyy-MM-dd')}.doc`)
        toast.success('Report exported successfully')
      } catch (error) {
        console.error('Error exporting report:', error)
        toast.error('Failed to export report: ' + error.message)
      }
    }

    // Add these refs
    const isSidebarCollapsed = ref(false)
    const currentView = ref('dashboard')

    // Add these methods
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    const setView = (view) => {
      currentView.value = view
    }

    // Add these computed properties
    const getLowStockCount = computed(() => {
      return items.value.filter(item => item.quantity < 10).length
    })

    const getTotalValue = computed(() => {
      return formatPrice(items.value.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0))
    })

    const getMostStockedCategory = computed(() => {
      const categoryCounts = {}
      items.value.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.quantity
      })
      const mostStocked = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0]
      return mostStocked ? categories.value.find(c => c.id === mostStocked[0])?.name : 'None'
    })

    // Add these methods
    const getCategoryItemCount = (categoryId) => {
      return items.value.filter(item => item.category === categoryId).length
    }

    const getCategoryValue = (categoryId) => {
      return items.value
        .filter(item => item.category === categoryId)
        .reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
        if (currentUser) {
          loadItems()
        }
      })
    })

    return {
      user,
      loginForm,
      categories,
      selectedCategory,
      items,
      newItem,
      filteredItems,
      getCurrentCategoryName,
      isLoading,
      login,
      logout,
      addItem,
      updateQuantity,
      updatePrice,
      deleteItem,
      selectCategory,
      getCategoryIcon,
      formatPrice,
      exportSummaryReport,
      isSidebarCollapsed,
      currentView,
      toggleSidebar,
      setView,
      getLowStockCount,
      getTotalValue,
      getMostStockedCategory,
      getCategoryItemCount,
      getCategoryValue
    }
  }
}
</script>

<style scoped>
/* Add this import at the top of your style section */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.inventory-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
}

.nav-header {
  background-color: #2c3e50;
  color: white;
  padding: 0.75rem 1.5rem;
  position: fixed;
  top: 0;
  right: 0;
  left: 60px;
  z-index: 999;
  transition: all 0.3s ease;
}

.nav-header.nav-shifted {
  left: 250px;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20rem;
}

.menu-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  display: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-email {
  font-size: 0.9rem;
  opacity: 0.9;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-container {
  margin-left: 250px;
  margin-top: 64px; /* Height of nav-header */
  flex: 1;
  transition: all 0.3s ease;
  min-height: calc(100vh - 64px);
}

.main-container.sidebar-collapsed {
  margin-left: 60px;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-header i {
  font-size: 1.5rem;
}

.collapse-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.sidebar-menu {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(255,255,255,0.1);
  border-left-color: #3498db;
}

.menu-item.active {
  background: rgba(52, 152, 219, 0.2);
  border-left-color: #3498db;
}

.menu-item i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card i {
  font-size: 2rem;
  color: #3498db;
}

.categories-nav {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  overflow-x: auto;
  background: white;
  border-bottom: 1px solid #eee;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.category-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.main-content {
  padding: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.add-item-section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

input {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  font-size: 1rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.item-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 8px;
}

.quantity-btn {
  background: #3498db;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
}

.quantity-btn:hover {
  background: #2980b9;
}

.quantity-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  flex: 1;
}

.quantity-input {
  width: 60px;
  border: none;
  padding: 0.25rem;
  text-align: center;
  font-size: 1rem;
  color: #2c3e50;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: none;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

.unit {
  color: #6c757d;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid #dee2e6;
}

.category-tag {
  background: #e9ecef;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #2c3e50;
}

.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3498db, #2c3e50);
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header i {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.add-btn, .login-btn {
  background: #3498db;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.add-btn:hover, .login-btn:hover {
  background: #2980b9;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c0392b;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background: #c0392b;
}

.price-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 8px;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  flex: 1;
}

.price-input {
  width: 100px;
  border: none;
  padding: 0.25rem;
  text-align: right;
  font-size: 1rem;
  color: #2c3e50;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: none;
}

.price-input::-webkit-outer-spin-button,
.price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.total-price {
  background: #e3f2fd;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #1976d2;
  font-weight: 500;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.export-btn {
  background: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}

.export-btn:hover {
  background: #218838;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-header i {
  font-size: 1.5rem;
}

.collapse-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.sidebar-menu {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(255,255,255,0.1);
  border-left-color: #3498db;
}

.menu-item.active {
  background: rgba(52, 152, 219, 0.2);
  border-left-color: #3498db;
}

.menu-item i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .nav-header {
    left: 0;
    padding: 0.75rem 1rem;
  }
  
  .nav-header.nav-shifted {
    left: 0;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .user-info {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .nav-actions {
    width: 100%;
    justify-content: center;
  }
  
  .user-details {
    justify-content: center;
    width: 100%;
  }
  
  h1 {
    font-size: 1.2rem;
  }
  
  .export-btn, .logout-btn {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .sidebar {
    width: 60px;
  }
  
  .sidebar:hover {
    width: 250px;
  }
  
  .main-container {
    margin-left: 60px;
  }
  
  .sidebar-header span,
  .menu-item span {
    display: none;
  }
  
  .sidebar:hover .sidebar-header span,
  .sidebar:hover .menu-item span {
    display: inline;
  }
  
  .collapse-btn {
    display: none;
  }
}

/* Add view-specific styles */
.quick-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  margin: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.category-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-info i {
  font-size: 2rem;
  color: #3498db;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.report-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.report-btn {
  background: #3498db;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.settings-grid {
  padding: 1.5rem;
}

.settings-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.user-settings {
  margin-top: 1rem;
}

.settings-btn {
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style> 
