<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Profile Settings</h1>
      <p>Manage your account information and preferences</p>
    </div>

    <div class="profile-content">
      <div class="profile-section">
        <h2>Personal Information</h2>
        <div class="profile-form">
          <div class="avatar-section">
            <img :src="userAvatar" alt="Profile Avatar" class="profile-avatar">
            <button class="change-avatar-btn" @click="triggerFileInput">
              <i class="fas fa-camera"></i>
              Change Photo
            </button>
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              style="display: none"
              @change="handleAvatarChange"
            >
          </div>

          <div class="form-group">
            <label>Display Name</label>
            <input 
              type="text" 
              v-model="displayName" 
              placeholder="Enter your name"
              :disabled="loading"
            >
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="email" 
              disabled
              class="disabled-input"
            >
            <small>Email cannot be changed</small>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              v-model="phoneNumber" 
              placeholder="Enter your phone number"
              :disabled="loading"
            >
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>Preferences</h2>
        <div class="preferences-form">
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
        </div>
      </div>

      <div class="profile-actions">
        <button 
          class="save-btn" 
          @click="saveProfile"
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
import { updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  name: 'Profile',
  setup() {
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    const fileInput = ref(null)
    
    const displayName = ref('')
    const email = ref('')
    const phoneNumber = ref('')
    const userAvatar = ref('')
    const emailNotifications = ref(true)
    const lowStockAlerts = ref(true)

    const loadUserProfile = async (user) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          displayName.value = data.displayName || user.displayName || ''
          email.value = user.email || ''
          phoneNumber.value = data.phoneNumber || ''
          userAvatar.value = user.photoURL || 'https://via.placeholder.com/150'
          emailNotifications.value = data.emailNotifications ?? true
          lowStockAlerts.value = data.lowStockAlerts ?? true
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        error.value = 'Failed to load profile data'
      }
    }

    const triggerFileInput = () => {
      fileInput.value.click()
    }

    const handleAvatarChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      try {
        loading.value = true
        error.value = ''
        
        const storage = getStorage()
        const avatarRef = storageRef(storage, `avatars/${auth.currentUser.uid}`)
        
        await uploadBytes(avatarRef, file)
        const downloadURL = await getDownloadURL(avatarRef)
        
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL
        })
        
        userAvatar.value = downloadURL
        success.value = 'Profile photo updated successfully'
      } catch (err) {
        console.error('Error updating avatar:', err)
        error.value = 'Failed to update profile photo'
      } finally {
        loading.value = false
      }
    }

    const saveProfile = async () => {
      try {
        loading.value = true
        error.value = ''
        success.value = ''

        const user = auth.currentUser
        if (!user) throw new Error('No user logged in')

        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: displayName.value
        })

        // Update Firestore user document
        await setDoc(doc(db, 'users', user.uid), {
          displayName: displayName.value,
          phoneNumber: phoneNumber.value,
          emailNotifications: emailNotifications.value,
          lowStockAlerts: lowStockAlerts.value,
          updatedAt: new Date()
        }, { merge: true })

        success.value = 'Profile updated successfully'
      } catch (err) {
        console.error('Error saving profile:', err)
        error.value = 'Failed to update profile'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      const user = auth.currentUser
      if (user) {
        loadUserProfile(user)
      }
    })

    return {
      loading,
      error,
      success,
      fileInput,
      displayName,
      email,
      phoneNumber,
      userAvatar,
      emailNotifications,
      lowStockAlerts,
      triggerFileInput,
      handleAvatarChange,
      saveProfile
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.profile-header p {
  color: #666;
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
}

.change-avatar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.change-avatar-btn:hover {
  background: #e9ecef;
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

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:disabled {
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

.profile-actions {
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

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .profile-section {
    padding: 15px;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
  }
}
</style> 