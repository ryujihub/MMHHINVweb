<template>
  <div class="auth-form">
    <div class="auth-header">
      <i class="fas fa-warehouse"></i>
      <h2>Hardware Inventory</h2>
      <p>Welcome back! Please login to your account.</p>
    </div>
    
    <button @click="loginWithGoogle" class="google-login-btn">
      <i class="fab fa-google"></i> Continue with Google
    </button>
    
    <div class="divider">
      <span>or login with email</span>
    </div>

    <div class="form-group">
      <label><i class="fas fa-envelope"></i> Email</label>
      <div class="input-with-icon">
        <input 
          v-model="loginForm.email" 
          type="email" 
          placeholder="Enter your email"
          autocomplete="email" 
        />
      </div>
    </div>
    <div class="form-group">
      <label><i class="fas fa-lock"></i> Password</label>
      <div class="input-with-icon">
        
        <input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </div>
    </div>
    <button @click="handleLogin" class="auth-submit-btn">
      <i class="fas fa-sign-in-alt"></i> Login
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Login',
  emits: ['login-success'],
  setup(props, { emit }) {
    const auth = getAuth()
    const toast = useToast()
    const loginForm = ref({
      email: '',
      password: ''
    })

    const handleLogin = async () => {
      try {
        const { user } = await signInWithEmailAndPassword(
          auth,
          loginForm.value.email,
          loginForm.value.password
        )
        emit('login-success', user)
        toast.success('Login successful!')
      } catch (error) {
        console.error('Login error:', error)
        toast.error('Login failed: ' + error.message)
      }
    }

    const loginWithGoogle = async () => {
      try {
        const provider = new GoogleAuthProvider()
        const { user } = await signInWithPopup(auth, provider)
        emit('login-success', user)
        toast.success('Login successful!')
      } catch (error) {
        console.error('Google login error:', error)
        toast.error('Failed to login with Google: ' + error.message)
      }
    }

    return {
      loginForm,
      handleLogin,
      loginWithGoogle
    }
  }
}
</script>

<style scoped>
.auth-form {
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header i {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.auth-header h2 {
  color: #2c3e50;
  margin: 0.5rem 0;
}

.auth-header p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

.google-login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.google-login-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.google-login-btn i {
  font-size: 1.2rem;
  color: #4285f4;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
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

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.input-with-icon input {
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.input-with-icon input:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.auth-submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.auth-submit-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.auth-submit-btn:active {
  transform: translateY(0);
}
</style> 