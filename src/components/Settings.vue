<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>Settings</h1>
      <p>Manage your account preferences and system settings</p>
    </div>

    <div class="settings-content">
      <!-- User Preferences -->
      <div class="settings-section">
        <h2>User Preferences</h2>
        <div class="settings-form">
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="emailNotifications"
                :disabled="loading"
              >
              Receive email notifications
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="lowStockAlerts"
                :disabled="loading"
              >
              Receive low stock alerts
            </label>
          </div>

          <div class="form-group">
            <label>Default Currency</label>
            <select v-model="defaultCurrency" :disabled="loading">
              <option value="PHP">Philippine Peso (₱)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- System Settings -->
      <div class="settings-section">
        <h2>System Settings</h2>
        <div class="settings-form">
          <div class="form-group">
            <label>Low Stock Threshold</label>
            <input 
              type="number" 
              v-model="lowStockThreshold"
              min="1"
              :disabled="loading"
            >
            <small>Minimum number of items before triggering low stock alert</small>
          </div>

          <div class="form-group">
            <label>Data Refresh Interval</label>
            <select v-model="refreshInterval" :disabled="loading">
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <button 
          class="save-btn" 
          @click="saveSettings"
          :disabled="loading"
        >
          <div v-if="loading" class="spinner"></div>
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { auth, db } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default {
  name: 'Settings',
  setup() {
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    
    const emailNotifications = ref(true)
    const lowStockAlerts = ref(true)
    const defaultCurrency = ref('PHP')
    const lowStockThreshold = ref(10)
    const refreshInterval = ref('60')

    const loadSettings = async (user) => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', user.uid))
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          emailNotifications.value = data.emailNotifications ?? true
          lowStockAlerts.value = data.lowStockAlerts ?? true
          defaultCurrency.value = data.defaultCurrency || 'PHP'
          lowStockThreshold.value = data.lowStockThreshold || 10
          refreshInterval.value = data.refreshInterval || '60'
        }
      } catch (err) {
        console.error('Error loading settings:', err)
        error.value = 'Failed to load settings'
      }
    }

    const saveSettings = async () => {
      try {
        loading.value = true
        error.value = ''
        success.value = ''

        const user = auth.currentUser
        if (!user) throw new Error('No user logged in')

        await setDoc(doc(db, 'settings', user.uid), {
          emailNotifications: emailNotifications.value,
          lowStockAlerts: lowStockAlerts.value,
          defaultCurrency: defaultCurrency.value,
          lowStockThreshold: lowStockThreshold.value,
          refreshInterval: refreshInterval.value,
          updatedAt: new Date()
        }, { merge: true })

        success.value = 'Settings saved successfully'
      } catch (err) {
        console.error('Error saving settings:', err)
        error.value = 'Failed to save settings'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      const user = auth.currentUser
      if (user) {
        loadSettings(user)
      }
    })

    return {
      loading,
      error,
      success,
      emailNotifications,
      lowStockAlerts,
      defaultCurrency,
      lowStockThreshold,
      refreshInterval,
      saveSettings
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  margin-bottom: 30px;
}

.settings-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.settings-header p {
  color: #666;
}

.settings-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.settings-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.settings-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: #2980b9;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-top: 20px;
  padding: 10px;
  background: #fee;
  color: #dc3545;
  border-radius: 4px;
}

.success-message {
  margin-top: 20px;
  padding: 10px;
  background: #e8f5e9;
  color: #28a745;
  border-radius: 4px;
}
</style> 