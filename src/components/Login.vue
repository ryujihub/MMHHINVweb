<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Login</h2>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label>Password:</label>
        <input type="password" v-model="password" required>
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="isLoading" class="loading">Please wait...</p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

// Validation rules
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 6;

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref(null);
    const router = useRouter();
    const isLoading = ref(false);

    const validateInputs = () => {
      if (!emailRegex.test(email.value)) {
        error.value = 'Please enter a valid email address';
        return false;
      }
      if (password.value.length < minPasswordLength) {
        error.value = 'Password must be at least 6 characters';
        return false;
      }
      return true;
    };

    const handleLogin = async () => {
      error.value = null;
      if (!validateInputs()) return;

      isLoading.value = true;
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        console.log('User logged in successfully');
        router.push('/inventory');
      } catch (err) {
        console.error('Login error:', err.code, err.message);
        error.value = `Login failed: ${err.message}`;
      } finally {
        isLoading.value = false;
      }
    };

    return { email, password, error, isLoading, handleLogin };
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-form {
  width: 300px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 10px;
}

.loading {
  color: #4CAF50;
  margin-top: 10px;
  font-style: italic;
}
</style>
