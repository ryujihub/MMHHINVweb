<template>
  <div class="auth-form">
    <div class="auth-header">
      <i class="fas fa-warehouse"></i>
      <h2>Create Account</h2>
      <p>Join us to manage your hardware inventory.</p>
    </div>

    <div class="form-group">
      <label><i class="fas fa-envelope"></i> Email</label>
      <div class="input-with-icon">
  
        <input 
          v-model="registerForm.email" 
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
          v-model="registerForm.password" 
          type="password" 
          placeholder="Create a password"
          autocomplete="new-password"
        />
      </div>
    </div>
    <div class="form-group">
      <label><i class="fas fa-lock"></i> Confirm Password</label>
      <div class="input-with-icon">
      
        <input 
          v-model="registerForm.confirmPassword" 
          type="password" 
          placeholder="Confirm your password"
          autocomplete="new-password"
        />
      </div>
    </div>
    <button @click="handleRegister" class="auth-submit-btn">
      <i class="fas fa-user-plus"></i> Create Account
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Register',
  emits: ['register-success'],
  setup(props, { emit }) {
    const auth = getAuth()
    const toast = useToast()
    const registerForm = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const handleRegister = async () => {
      try {
        if (registerForm.value.password !== registerForm.value.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (registerForm.value.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        
        const { user } = await createUserWithEmailAndPassword(
          auth,
          registerForm.value.email,
          registerForm.value.password
        )
        
        emit('register-success', user)
        toast.success('Registration successful!')
      } catch (error) {
        console.error('Registration error:', error)
        toast.error('Registration failed: ' + error.message)
      }
    }

    return {
      registerForm,
      handleRegister
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