<template>
  <div class="auth-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <button @click="loginWithGoogle" class="google-btn">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
      Sign in with Google
    </button>
    <router-link to="/signup">Don't have an account? Sign up</router-link>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const router = useRouter()

    const login = async () => {
      error.value = ''
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value)
        router.push('/')
      } catch (err) {
        error.value = err.message
      }
    }

    const loginWithGoogle = async () => {
      error.value = ''
      try {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        router.push('/')
      } catch (err) {
        error.value = err.message
      }
    }

    return { email, password, error, login, loginWithGoogle }
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 350px;
  margin: 80px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.auth-container h2 {
  margin-bottom: 1.5rem;
}
.auth-container form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.auth-container input {
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}
.auth-container button {
  padding: 0.7rem;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background 0.2s;
}
.auth-container button:hover {
  background: #217dbb;
}
.google-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #444;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
}
.google-btn img {
  width: 20px;
  height: 20px;
}
.error {
  color: #e74c3c;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
</style> 