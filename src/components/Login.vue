<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Hardware Inventory</h1>
        <p>Sign in to access your dashboard</p>
      </div>

      <div class="login-options">
        <button 
          @click="signInWithGoogle" 
          class="google-btn"
          :disabled="loading"
        >
          <div v-if="loading" class="spinner"></div>
          <img v-else src="https://www.google.com/favicon.ico" alt="Google" class="google-icon">
          {{ loading ? 'Signing in...' : 'Sign in with Google' }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="login-footer">
        <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect 
} from 'firebase/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const error = ref('')
    const loading = ref(false)

    const signInWithGoogle = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const provider = new GoogleAuthProvider()
        // Add additional scopes if needed
        provider.addScope('profile')
        provider.addScope('email')
        
        // Try popup first, fallback to redirect if popup is blocked
        try {
          await signInWithPopup(auth, provider)
        } catch (popupError) {
          if (popupError.code === 'auth/popup-blocked') {
            await signInWithRedirect(auth, provider)
          } else {
            throw popupError
          }
        }

        // Redirect to dashboard on successful login
        router.push('/')
      } catch (err) {
        console.error('Login error:', err)
        error.value = 'Failed to sign in with Google. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      signInWithGoogle,
      error,
      loading
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6fa;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.login-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: white;
  border: 1px solid #ddd;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  transition: all 0.3s;
  min-width: 200px;
}

.google-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #ccc;
}

.google-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 18px;
  height: 18px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #dc3545;
  margin: 15px 0;
  font-size: 14px;
}

.login-footer {
  margin-top: 30px;
  font-size: 12px;
  color: #666;
}

@media (max-width: 480px) {
  .login-card {
    padding: 20px;
  }
}
</style> 