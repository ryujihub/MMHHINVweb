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
        <span>MMH Hardware</span>
      </div>
      
      <div class="sidebar-menu">
        <a href="#" class="menu-item" :class="{ active: currentView === 'dashboard' }" @click="setView('dashboard')">
          <i class="fas fa-tachometer-alt"></i>
          <span class="menu-label">Dashboard</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'inventory' }" @click="setView('inventory')">
          <i class="fas fa-boxes"></i>
          <span class="menu-label">Inventory</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'categories' }" @click="setView('categories')">
          <i class="fas fa-tags"></i>
          <span class="menu-label">Categories</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'reports' }" @click="setView('reports')">
          <i class="fas fa-chart-bar"></i>
          <span class="menu-label">Reports</span>
        </a>
        <a href="#" class="menu-item" :class="{ active: currentView === 'settings' }" @click="setView('settings')">
          <i class="fas fa-cog"></i>
          <span class="menu-label">Settings</span>
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
          
          <!-- Update the Quick Summary section in the dashboard -->
          <div class="quick-summary">
            <div class="summary-header">
              <h3><i class="fas fa-chart-pie"></i> Inventory Overview</h3>
              <span class="last-updated">Last updated: {{ formatDate(new Date()) }}</span>
            </div>
            
            <div class="summary-grid">
              <div class="summary-card">
                <div class="card-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="card-content">
                  <h4>Low Stock Items</h4>
                  <p>{{ getLowStockCount }} items</p>
                  <span class="trend">
                    <i class="fas fa-arrow-down"></i> Needs attention
                  </span>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="card-icon">
                  <i class="fas fa-coins"></i>
                </div>
                <div class="card-content">
                  <h4>Total Value</h4>
                  <p>₱{{ getTotalValue }}</p>
                  <span class="trend positive">
                    <i class="fas fa-chart-line"></i> Current inventory
                  </span>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="card-icon">
                  <i class="fas fa-box"></i>
                </div>
                <div class="card-content">
                  <h4>Most Stocked Category</h4>
                  <p>{{ getMostStockedCategory }}</p>
                  <span class="trend">
                    <i class="fas fa-tag"></i> Leading category
                  </span>
                </div>
              </div>
              
              <div class="summary-card losses">
                <div class="card-icon">
                  <i class="fas fa-chart-bar"></i>
                </div>
                <div class="card-content">
                  <h4>Total Losses</h4>
                  <p>₱{{ formatPrice(getTotalLosses) }}</p>
                  <span class="trend negative">
                    <i class="fas fa-exclamation-circle"></i> Based on missing inventory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory View -->
        <div v-if="currentView === 'inventory'" class="inventory-view">
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
            <div class="inventory-actions">
              <button @click="showAddItemModal = true" class="add-item-trigger">
                <i class="fas fa-plus"></i> Add New Item
              </button>
      </div>

            <!-- Add Item Modal -->
            <div v-if="showAddItemModal" class="modal-overlay" @click="showAddItemModal = false">
              <div class="modal-content" @click.stop>
                <div class="modal-header">
                  <h3><i class="fas fa-plus-circle"></i> Add New Item</h3>
                  <button class="close-modal" @click="showAddItemModal = false">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="modal-body">
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
                    <div class="form-group">
                      <label>Total Stock Quantity</label>
                      <input 
                        v-model.number="newItem.totalStock" 
                        type="number" 
                        placeholder="Enter total stock"
                      />
                    </div>
                    <div class="form-group">
                      <label>Usage</label>
                      <input 
                        v-model.number="newItem.usage" 
                        type="number" 
                        placeholder="Enter usage"
                      />
                    </div>
                  </div>
                </div>

                <div class="modal-footer">
                  <button class="cancel-btn" @click="showAddItemModal = false">
                    <i class="fas fa-times"></i> Cancel
                  </button>
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
                    <div class="stock-status">
                      <div class="stock-info">
                        <span class="stock-label">Total Stock:</span>
                        <input 
                          type="number" 
                          v-model.number="item.totalStock" 
                          @change="updateTotalStock(item.id, item.totalStock)"
                          class="total-stock-input"
                        />
                      </div>
                      <div class="usage-info">
                        <span class="stock-label">Usage:</span>
                        <input 
                          type="number" 
                          v-model.number="item.usage" 
                          @change="updateUsage(item.id, item.usage)"
                          class="usage-input"
                          placeholder="Enter usage"
                        />
                      </div>
                      <div class="variance-info" :class="getVarianceClass(item)">
                        <div class="variance-details">
                          <span class="variance-label">Variance:</span>
                          <span class="variance-value">
                            {{ calculateVariance(item) }} {{ item.unit }}
                            ({{ calculateVariancePercentage(item) }}%)
                          </span>
                        </div>
                        <div class="variance-explanation">
                          {{ getVarianceExplanation(item) }}
                        </div>
                      </div>
                    </div>
                    <div class="losses-info" v-if="getItemLosses(item) > 0">
                      <div class="losses-details">
                        <span class="losses-label">
                          <i class="fas fa-exclamation-triangle"></i> Losses:
                        </span>
                        <span class="losses-value">
                          ₱{{ formatPrice(getItemLosses(item)) }}
                        </span>
                      </div>
                      <div class="losses-explanation">
                        Based on {{ Math.abs(calculateVariance(item)) }} missing units
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
          <div class="categories-header">
            <h2><i class="fas fa-tags"></i> Category Management</h2>
            <div class="categories-summary">
              <span>Total Categories: {{ categories.length }}</span>
              <span>Total Items: {{ items.length }}</span>
          </div>
          </div>
          
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-card">
              <div class="category-header">
                <i :class="getCategoryIcon(category.id)"></i>
                <h3>{{ category.name }}</h3>
              </div>
              
              <div class="category-stats">
                <div class="stat-item">
                  <span class="stat-label">Total Items</span>
                  <span class="stat-value">{{ getCategoryItemCount(category.id) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Value</span>
                  <span class="stat-value">₱{{ formatPrice(getCategoryValue(category.id)) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Low Stock Items</span>
                  <span class="stat-value">{{ getCategoryLowStockCount(category.id) }}</span>
                </div>
              </div>

              <div class="category-actions">
                <button class="view-items-btn" @click="selectCategory(category.id); setView('inventory')">
                  <i class="fas fa-eye"></i> View Items
                </button>
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
          
          <!-- Add Google login button -->
          <button @click="loginWithGoogle" class="google-login-btn">
            <i class="fab fa-google"></i> Sign in with Google
          </button>
          
          <div class="divider">
            <span>or</span>
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
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
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
  where,
  getDoc
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
      totalStock: 0,
      category: 'electrical',
      usage: 0,
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
          lastUpdated: new Date(),
          userId: user.value.uid,
          usage: newItem.value.usage || 0,
          totalStock: newItem.value.totalStock || newItem.value.quantity
        }
        
        await addDoc(collection(db, 'inventory'), itemData)
        await loadItems()
        
        // Reset form
        newItem.value = {
          name: '',
          quantity: 0,
          unit: '',
          price: 0,
          totalStock: 0,
          usage: 0,
          category: selectedCategory.value
        }
        
        toast.success('Item added successfully')
      } catch (error) {
        console.error('Error adding item:', error)
        toast.error('Failed to add item: ' + error.message)
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
    const currentView = ref('dashboard')

    // Add these methods
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

    const updateTotalStock = async (itemId, newTotalStock) => {
      try {
        const itemRef = doc(db, 'inventory', itemId)
        await updateDoc(itemRef, {
          totalStock: newTotalStock,
          lastUpdated: new Date()
        })
        await loadItems()
        toast.success('Total stock updated')
      } catch (error) {
        console.error('Error updating total stock:', error)
        toast.error('Failed to update total stock')
      }
    }

    const getStockDiscrepancy = (item) => {
      const missing = item.totalStock - item.quantity
      return missing > 0 ? missing : 0
    }

    const getTotalLosses = computed(() => {
      return items.value.reduce((total, item) => {
        const variance = calculateVariance(item)
        // Only count negative variances (missing items) as losses
        if (variance < 0) {
          return total + (Math.abs(variance) * item.price)
        }
        return total
      }, 0)
    })

    const updateUsage = async (itemId, newUsage, oldUsage = 0) => {
      try {
        // First get the current item data
        const itemRef = doc(db, 'inventory', itemId)
        const itemDoc = await getDoc(itemRef)
        
        if (!itemDoc.exists()) {
          toast.error('Item not found')
          return
        }

        const item = { id: itemDoc.id, ...itemDoc.data() }
        
        // Validate the new usage value
        if (newUsage < 0) {
          toast.error('Usage cannot be negative')
          return
        }

        // Update the item with new usage
        const updateData = {
          usage: newUsage || 0,
          lastUpdated: new Date()
        }

        await updateDoc(itemRef, updateData)

        // Calculate variance after update
        const expectedStock = item.totalStock - newUsage
        const actualStock = item.quantity
        const variance = actualStock - expectedStock

        // Show alerts if needed
        if (Math.abs(variance) >= auditThreshold.value) {
          toast.warning(`
            Stock Variance Alert:
            ${item.name}
            Expected: ${expectedStock} ${item.unit}
            Actual: ${actualStock} ${item.unit}
            Difference: ${variance} ${item.unit}
          `, { timeout: 5000 })
        }

        await loadItems()
        toast.success('Usage updated')
      } catch (error) {
        console.error('Error updating usage:', error)
        toast.error('Failed to update usage: ' + error.message)
      }
    }

    const triggerAudit = (item) => {
      // Show audit dialog
      const auditMessage = `
        Audit Required for ${item.name}
        Current Quantity: ${item.quantity} ${item.unit}
        Expected Quantity: ${item.totalStock - item.usage} ${item.unit}
        Variance: ${calculateVariance(item)} ${item.unit}
        
        Would you like to:
        1. Adjust inventory level
        2. Review usage records
        3. Schedule physical count
      `
      
      // You can implement a modal dialog here
      console.log(auditMessage)
      toast.info('Audit feature coming soon!')
    }

    const suggestRestock = (item) => {
      const suggestedAmount = item.totalStock - item.quantity
      const restockMessage = `
        Restock Suggestion for ${item.name}
        Current Stock: ${item.quantity} ${item.unit}
        Suggested Order: ${suggestedAmount} ${item.unit}
        
        Would you like to:
        1. Place order now
        2. Review usage history
        3. Adjust restock level
      `
      
      // You can implement a modal dialog here
      console.log(restockMessage)
      toast.info('Restock feature coming soon!')
    }

    const calculateVariance = (item) => {
      // Only calculate if we have all required values
      if (!item.totalStock || !item.quantity || !item.usage) {
        return 0
      }
      const expectedStock = item.totalStock - (item.usage || 0)
      const actualStock = item.quantity
      return actualStock - expectedStock
    }

    const calculateVariancePercentage = (item) => {
      const variance = calculateVariance(item)
      const expectedStock = item.totalStock - item.usage
      if (expectedStock === 0) return 0
      return ((variance / expectedStock) * 100).toFixed(1)
    }

    const getVarianceClass = (item) => {
      const variance = calculateVariance(item)
      if (variance < 0) return 'negative-variance'
      if (variance > 0) return 'positive-variance'
      return 'no-variance'
    }

    const getVarianceExplanation = (item) => {
      // Only show explanation if we have all required values
      if (!item.totalStock || !item.quantity || !item.usage) {
        return 'Set total stock and usage to track variance'
      }
      
      const variance = calculateVariance(item)
      const expected = item.totalStock - (item.usage || 0)
      
      if (variance === 0) return 'Stock matches expected quantity'
      if (variance < 0) {
        return `Missing ${Math.abs(variance)} ${item.unit} (Expected: ${expected}, Actual: ${item.quantity})`
      }
      return `Excess ${variance} ${item.unit} (Expected: ${expected}, Actual: ${item.quantity})`
    }

    // Add new refs for tracking
    const stockThreshold = ref(10) // Minimum stock level before restock alert
    const auditThreshold = ref(5) // Units difference before suggesting audit

    // Add these computed properties
    const getInventoryStatus = computed(() => {
      return items.value.map(item => {
        const variance = calculateVariance(item)
        const variancePercent = calculateVariancePercentage(item)
        const needsRestock = item.quantity <= stockThreshold.value
        const needsAudit = Math.abs(variance) >= auditThreshold.value

    return {
          ...item,
          variance,
          variancePercent,
          needsRestock,
          needsAudit,
          status: getItemStatus(item)
        }
      })
    })

    // Add these methods
    const getItemStatus = (item) => {
      const variance = calculateVariance(item)
      if (variance < 0) return 'missing'
      if (variance > 0) return 'excess'
      if (item.quantity <= stockThreshold.value) return 'low'
      return 'normal'
    }

    const getItemLosses = (item) => {
      const variance = calculateVariance(item)
      if (variance < 0) {
        return Math.abs(variance) * item.price
      }
      return 0
    }

    // Add this method
    const loginWithGoogle = async () => {
      try {
        const auth = getAuth()
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        const user = result.user
        toast.success('Successfully logged in!')
      } catch (error) {
        console.error('Google login error:', error)
        toast.error('Failed to login with Google: ' + error.message)
      }
    }

    // Add this method
    const getCategoryLowStockCount = (categoryId) => {
      return items.value.filter(item => 
        item.category === categoryId && item.quantity < 10
      ).length
    }

    // Add this ref
    const showAddItemModal = ref(false)

    const formatDate = (date) => {
      return format(date, 'MMM dd, yyyy h:mm a')
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
      currentView,
      setView,
      getLowStockCount,
      getTotalValue,
      getMostStockedCategory,
      getCategoryItemCount,
      getCategoryValue,
      updateTotalStock,
      getStockDiscrepancy,
      getTotalLosses,
      updateUsage,
      calculateVariance,
      calculateVariancePercentage,
      getVarianceClass,
      getVarianceExplanation,
      getInventoryStatus,
      getItemStatus,
      triggerAudit,
      suggestRestock,
      getItemLosses,
      loginWithGoogle,
      getCategoryLowStockCount,
      showAddItemModal,
      formatDate
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
  padding: 0.1rem 1rem;
  position: fixed;
  top: 0;
  right: 0;
  left: 60px;
  z-index: 999;
  transition: all 0.3s ease;
}

.nav-header.nav-shifted {
  left: 60px;
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
  margin-left: 60px;
  margin-top: 64px; /* Height of nav-header */
  flex: 1;
  min-height: calc(100vh - 64px);
}

.main-container.sidebar-collapsed {
  margin-left: 60px;
}

.sidebar {
  width: 60px; /* Fixed width */
  background: #2c3e50;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-header span {
  display: none;
}

.sidebar-header i {
  font-size: 1.5rem;
}

.sidebar-menu {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.menu-item {
  position: relative;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item i {
  font-size: 1.2rem;
}

.menu-item.active {
  background: rgba(52, 152, 219, 0.2);
  border-left-color: #3498db;
}

.menu-label {
  position: absolute;
  left: 100%;
  background: #2c3e50;
  padding: 0.5rem 1rem;
  border-radius: 0 4px 4px 0;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  transform: translateX(-20px);
  box-shadow: 2px 0 5px rgba(0,0,0,0.2);
}

.menu-item:hover .menu-label {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.menu-item.active .menu-label {
  background: #3498db;
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

.inventory-actions {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.add-item-trigger {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 1rem;
}

.add-item-trigger:hover {
  background: #2980b9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.items-list {
  margin-top: 1.5rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
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
  width: 60px; /* Fixed width */
  background: #2c3e50;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-header span {
  display: none;
}

.sidebar-header i {
  font-size: 1.5rem;
}

.sidebar-menu {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.menu-item {
  position: relative;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item i {
  font-size: 1.2rem;
}

.menu-item.active {
  background: rgba(52, 152, 219, 0.2);
  border-left-color: #3498db;
}

.menu-label {
  position: absolute;
  left: 100%;
  background: #2c3e50;
  padding: 0.5rem 1rem;
  border-radius: 0 4px 4px 0;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  transform: translateX(-20px);
  box-shadow: 2px 0 5px rgba(0,0,0,0.2);
}

.menu-item:hover .menu-label {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.menu-item.active .menu-label {
  background: #3498db;
}

/* Mobile-First Media Queries */
@media (max-width: 768px) {
  /* Layout Adjustments */
  .inventory-container {
    flex-direction: column;
  }

  .nav-header {
    height: auto;
    padding: 0.5rem;
  }

  .nav-content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-left {
  width: 100%;
    gap: 1rem;
    justify-content: space-between;
  }

  .nav-left h1 {
    font-size: 1.1rem;
  }

  /* User Info & Actions */
  .user-info {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .export-btn, .logout-btn {
    width: 100%;
    padding: 0.75rem;
    justify-content: center;
    font-size: 0.9rem;
  }

  /* Form Controls */
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.75rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
  }

  /* Item Cards */
  .items-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.75rem;
  }

  .item-card {
    padding: 1rem;
  }

  .item-details {
    gap: 0.75rem;
  }

  /* Quantity & Price Controls */
  .quantity-control, .price-control {
    flex-direction: row;
    width: 100%;
  }

  .quantity-btn {
    width: 44px;
    height: 44px;
  display: flex;
    align-items: center;
  justify-content: center;
  }

  .quantity-input, .price-input, .total-stock-input, .usage-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
  }

  /* Stock Status */
  .stock-status {
    padding: 0.75rem;
  }

  .stock-info, .usage-info {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  /* Categories Navigation */
  .categories-nav {
    margin-top: 100px;
    padding: 0.75rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }

  .categories-nav::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .category-btn {
    white-space: nowrap;
    padding: 0.75rem 1rem;
    min-height: 44px;
  }

  /* Dashboard Stats */
  .dashboard-stats {
    grid-template-columns: 1fr;
    padding: 0.75rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  /* Touch Optimizations */
  .menu-item {
    min-height: 44px;
  }

  .menu-label {
    padding: 0.75rem 1rem;
  }

  /* Improve Touch Targets */
  button, 
  input[type="number"],
  input[type="text"],
  select {
    min-height: 44px;
    touch-action: manipulation;
  }

  /* Better Spacing for Touch */
  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .total-price {
    text-align: center;
  }

  /* Loading States */
  .loading-overlay {
    position: fixed;
  }
}

/* Tablet Optimizations */
@media (min-width: 769px) and (max-width: 1024px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Touch Device Optimizations */
@media (hover: none) {
  .menu-item:active,
  .button:active {
    opacity: 0.7;
  }

  .quantity-btn:active,
  .category-btn:active {
    transform: scale(0.95);
  }
}

.google-login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.google-login-btn:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.google-login-btn i {
  font-size: 1.2rem;
  color: #4285f4;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #dee2e6;
}

.divider span {
  padding: 0 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Update responsive styles for login */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    max-width: 400px;
    padding: 1.5rem;
  }

  .google-login-btn,
  .login-btn {
    min-height: 44px;
    font-size: 1rem;
  }

  .form-group input {
    min-height: 44px;
    font-size: 1rem;
  }
}

.categories-view {
  padding: 1.5rem;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.categories-header h2 {
  display: flex;
  
  align-items: center;
  gap: 0.75rem;
  color: #2c3e50;
}

.categories-summary {
  display: flex;
  gap: 2rem;
  color: #6c757d;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.category-header i {
  font-size: 2rem;
  color: #3498db;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.category-header h3 {
  color: #2c3e50;
  margin: 0;
}

.category-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

.category-actions {
  display: flex;
  justify-content: flex-end;
}

.view-items-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.view-items-btn:hover {
  background: #2980b9;
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .categories-view {
    padding: 1rem;
  }

  .categories-header {
    flex-direction: column;
    margin-top: 100px;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .categories-summary {
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-card {
    padding: 1rem;
  }

  .category-stats {
    grid-template-columns: 1fr;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.quick-summary {
  background: white;
  border-radius: 15px;
  margin: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  overflow: hidden;
}

.summary-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.last-updated {
  color: #6c757d;
  font-size: 0.9rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.summary-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.card-icon {
  background: #e3f2fd;
  color: #1976d2;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-content {
  flex: 1;
}

.card-content h4 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.card-content p {
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.trend.positive {
  color: #28a745;
}

.trend.negative {
  color: #dc3545;
}

/* Customize each card type */
.summary-card:nth-child(1) .card-icon {
  background: #fff3e0;
  color: #f57c00;
}

.summary-card:nth-child(2) .card-icon {
  background: #e8f5e9;
  color: #2e7d32;
}

.summary-card:nth-child(3) .card-icon {
  background: #e3f2fd;
  color: #1976d2;
}

.summary-card.losses .card-icon {
  background: #fce4ec;
  color: #c2185b;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .quick-summary {
    margin: 1rem;
  }

  .summary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }

  .summary-card {
    padding: 1rem;
  }

  .card-content p {
    font-size: 1.25rem;
  }
}

/* Stock Status Section */
.stock-status {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.25rem;
  margin: 1rem 0;
  border: 1px solid #eee;
}

.stock-info, .usage-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.stock-label {
  min-width: 100px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.total-stock-input, .usage-input {
  flex: 1;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.5rem;
  text-align: center;
  font-size: 1rem;
  color: #2c3e50;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.total-stock-input:focus, .usage-input:focus {
  outline: none;
  border-color: #3498db;
  background: white;
}

.variance-info {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  background: white;
}

.variance-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.variance-label {
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.variance-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.variance-explanation {
  font-size: 0.9rem;
  color: #6c757d;
  padding-top: 0.5rem;
  border-top: 1px dashed #dee2e6;
}

/* Variance Status Colors */
.negative-variance {
  background: #fff5f5;
  border-left: 4px solid #dc3545;
}

.positive-variance {
  background: #f0fff4;
  border-left: 4px solid #28a745;
}

.no-variance {
  background: #f8f9fa;
  border-left: 4px solid #6c757d;
}

/* Losses Info Section */
.losses-info {
  background: #fff5f5;
  border-radius: 12px;
  padding: 1.25rem;
  margin: 1rem 0;
  border: 1px solid #ffcdd2;
}

.losses-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.losses-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #dc3545;
  font-weight: 500;
}

.losses-label i {
  font-size: 1.2rem;
}

.losses-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.losses-explanation {
  font-size: 0.9rem;
  color: #6c757d;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(220, 53, 69, 0.2);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .stock-status {
    padding: 1rem;
  }

  .stock-info, .usage-info {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .stock-label {
    min-width: auto;
  }

  .total-stock-input, .usage-input {
    width: 100%;
  }

  .variance-info, .losses-info {
    padding: 1rem;
  }

  .losses-details {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .losses-value {
    width: 100%;
    text-align: center;
  }
}
</style> 
