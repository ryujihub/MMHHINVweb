<template>
  <div class="inventory">
    <div class="inventory-header">
      <h1>Inventory Management</h1>
      <button class="add-item-btn" @click="showAddItemModal = true">
        Add New Item
          </button>
        </div>

    <div class="filters">
              <input 
                type="text" 
        v-model="searchQuery" 
                placeholder="Search items..." 
                class="search-input"
      >
      <select v-model="categoryFilter" class="filter-select">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div class="inventory-table">
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Product Code</th>
            <th>Category</th>
            <th>On Hand Stock</th>
            <th>Total Stock</th>
            <th>Nabenta</th>
            <th>Price</th>
            <th>Status</th>
            <th>Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.productCode }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.currentStock }}</td>
            <td>{{ item.minimumStock }}</td>
            <td>{{ item.usage || 0 }}</td>
            <td>₱{{ item.price }}</td>
            <td>
              <span class="status-badge" :class="getStockStatus(item)">
                {{ getStockStatus(item) }}
              </span>
            </td>
            <td>{{ item.unit }}</td>
            <td>
              <button class="action-btn edit" @click="editItem(item)">
                Edit
                  </button>
              <button class="action-btn delete" @click="deleteItem(item.id)">
                Delete
              </button>
              <div class="variance-losses">
                 <div v-if="item.varianceQuantity > 0" class="variance positive-variance">
                   Excess: {{ item.varianceQuantity }} {{ item.unit }} ({{ item.variancePercentage.toFixed(1) }}%)
                 </div>
                 <div v-else-if="item.varianceQuantity < 0" class="variance negative-variance">
                   Variance: {{ item.varianceQuantity }} {{ item.unit }} ({{ item.variancePercentage.toFixed(1) }}%)
                 </div>
                 <div v-else class="variance">
                   Variance: 0 {{ item.unit }} (0.0%)
                 </div>
                 <div v-if="item.varianceQuantity < 0" class="losses">
                   Losses: ₱{{ (Math.abs(item.varianceQuantity) * item.price).toFixed(2) }}
                   <br>Based on {{ Math.abs(item.varianceQuantity) }} missing units
                 </div>
                 <div v-else class="no-losses">
                   Stock matches expected quantity
                 </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
                </div>
                
    <!-- Add/Edit Item Modal -->
    <div v-if="showAddItemModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h2>
        <form @submit.prevent="saveItem">
          <div class="form-group">
                      <label>Item Name</label>
            <input v-model="itemForm.name" required>
          </div>
          <div class="form-group">
            <label>Product Code</label>
            <input v-model="itemForm.productCode" required>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="itemForm.category" required>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
                    <div class="form-group">
            <label>On Hand Stock</label>
            <input type="number" v-model="itemForm.currentStock" required>
          </div>
                    <div class="form-group">
            <label>Total Stock</label>
            <input type="number" v-model="itemForm.minimumStock" required>
      </div>
                    <div class="form-group">
            <label>Nabenta</label>
            <input type="number" v-model="itemForm.usage" required>
          </div>
                    <div class="form-group">
            <label>Price</label>
            <input type="number" step="0.01" v-model="itemForm.price" required>
                    </div>
          <div class="form-group">
            <label>Unit</label>
            <select v-model="itemForm.unit" required>
              <option value="pcs">pcs</option>
              <option value="box">box</option>
              <option value="meters">meters</option>
              <option value="rolls">rolls</option>
              <option value="set">set</option>
              <option value="pack">pack</option>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
            </select>
                  </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">Save</button>
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
                </div>
        </form>
                </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { db } from '../firebase/config'
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { auth } from '../firebase/config'
import { onMounted } from 'vue'

export default {
  name: 'Inventory',
  setup() {
    const items = ref([])
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const showAddItemModal = ref(false)
    const editingItem = ref(null)
    const categories = ref(['Tools', 'Electrical', 'Plumbing', 'Paint', 'Hardware'])
    const lowStockThreshold = ref(10)

    const itemForm = ref({
      name: '',
      productCode: '',
      category: '',
      currentStock: 0,
      minimumStock: 0,
      price: 0,
      unit: 'pcs',
      usage: 0
    })

    // Listen to Firestore inventory collection
    onSnapshot(collection(db, 'inventory'), (snapshot) => {
      items.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    })

    const filteredItems = computed(() => {
      return items.value.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            item.productCode.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || item.category === categoryFilter.value
        return matchesSearch && matchesCategory
      }).map(item => {
        // Calculate Variance and Losses
        // NOTE: 'Total Stock' and 'Usage' are not explicitly in your current item data structure.
        // Assuming Total Stock is initial stock and Usage is stock moved out.
        // You might need to adjust this calculation based on your actual data fields.
        // For this implementation, let's assume 'Total Stock' is represented by an initialStock field
        // and 'Usage' needs to be tracked via stock movements or another field.
        // As a temporary placeholder, let's calculate based on hypothetical 'initialStock' and 'usage' fields.
        // You will need to ensure these fields exist and are populated correctly.
        // For now, let's use item.currentStock for actual stock.

        // *** CALCULATING VARIANCE BASED ON USER'S TERMINOLOGY ***
        // Total Stock (item.minimumStock) is the initial stock
        // Nabenta (item.usage) is the quantity used/sold
        // On Hand Stock (item.currentStock) is the actual stock

        const initialStock = item.minimumStock || 0; // Use Total Stock as initial stock
        const usage = item.usage || 0; // Use Nabenta as usage

        const expectedStock = initialStock - usage;
        const varianceQuantity = item.currentStock - expectedStock;
        const variancePercentage = expectedStock === 0 ? 0 : (varianceQuantity / expectedStock) * 100;

        return { // Return a new object with calculated fields
          ...item,
          expectedStock,
          varianceQuantity,
          variancePercentage,
        };
      });
    })

    const getStockStatus = (item) => {
      if (item.currentStock <= 0) return 'out-of-stock'
      if (item.currentStock <= lowStockThreshold.value) return 'low-stock'
      return 'in-stock'
    }

    const editItem = (item) => {
      editingItem.value = item
      itemForm.value = { ...item }
      showAddItemModal.value = true
    }

    const deleteItem = async (id) => {
      if (confirm('Are you sure you want to delete this item?')) {
        const itemRef = doc(db, 'inventory', id)
        await deleteDoc(itemRef)
      }
    }

    const saveItem = async () => {
      if (editingItem.value) {
        // Update existing item in Firestore
        const itemRef = doc(db, 'inventory', editingItem.value.id)
        await updateDoc(itemRef, { ...itemForm.value })
      } else {
        // Add new item to Firestore
        await addDoc(collection(db, 'inventory'), { ...itemForm.value })
      }
      closeModal()
    }

    const closeModal = () => {
      showAddItemModal.value = false
      editingItem.value = null
      itemForm.value = {
        name: '',
        productCode: '',
        category: '',
        currentStock: 0,
        minimumStock: 0,
        price: 0,
        unit: 'pcs',
        usage: 0
      }
    }

    onMounted(async () => {
      // Fetch user settings
      const user = auth.currentUser
      if (user) {
        try {
          const settingsDoc = await getDoc(doc(db, 'settings', user.uid))
          if (settingsDoc.exists()) {
            lowStockThreshold.value = settingsDoc.data().lowStockThreshold ?? 10
          }
        } catch (err) {
          console.error('Error loading settings in Inventory:', err)
        }
      }
    })

    return {
      items,
      searchQuery,
      categoryFilter,
      showAddItemModal,
      editingItem,
      categories,
      itemForm,
      filteredItems,
      getStockStatus,
      editItem,
      deleteItem,
      saveItem,
      closeModal
    }
  }
}
</script>

<style scoped>
.inventory {
  padding: 20px;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-item-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input, .filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.inventory-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
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

.status-badge.in-stock {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.low-stock {
  background: #fff3e0;
  color: #ef6c00;
}

.status-badge.out-of-stock {
  background: #ffebee;
  color: #c62828;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.action-btn.edit {
  background: #2196f3;
  color: white;
}

.action-btn.delete {
  background: #f44336;
  color: white;
}

.variance-losses {
  margin-top: 10px;
  font-size: 0.9em;
}

.variance {
  font-weight: bold;
}

.negative-variance {
  color: #e74c3c; /* Red */
}

.positive-variance {
  color: #2ecc71; /* Green */
}

.losses {
  color: #e74c3c; /* Red */
  font-weight: bold;
  margin-top: 5px;
}

.no-losses {
  color: #666;
  font-size: 0.9em;
  margin-top: 5px;
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
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.cancel-btn {
  background: #9e9e9e;
  color: white;
}
</style> 
