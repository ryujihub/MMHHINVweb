<template>
  <div class="auth-container">
    <div class="auth-form-container">
      <div class="auth-tabs">
        <button 
          @click="showRegisterForm = false" 
          :class="['auth-tab', !showRegisterForm ? 'active' : '']"
        >
          <i class="fas fa-sign-in-alt"></i> Login
        </button>
        <button 
          @click="showRegisterForm = true" 
          :class="['auth-tab', showRegisterForm ? 'active' : '']"
        >
          <i class="fas fa-user-plus"></i> Register
        </button>
      </div>

      <Login v-if="!showRegisterForm" @login-success="handleAuthSuccess" />
      <Register v-else @register-success="handleAuthSuccess" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import Login from './Login.vue'
import Register from './Register.vue'

export default {
  name: 'Auth',
  components: {
    Login,
    Register
  },
  emits: ['auth-success'],
  setup(props, { emit }) {
    const showRegisterForm = ref(false)

    const handleAuthSuccess = (user) => {
      emit('auth-success', user)
    }

    return {
      showRegisterForm,
      handleAuthSuccess
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-width: 100vw;
  margin: 0;
  padding: 0;
  background: #0099ff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.auth-form-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.auth-tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-tab:hover {
  color: #3498db;
  background: #f8f9fa;
}

.auth-tab.active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
  font-weight: 500;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .auth-form-container {
    border-radius: 0;
    box-shadow: none;
    height: 100vh;
  }

  .auth-tab {
    padding: 0.75rem;
  }
}
</style> 