<template>
  <div class="auth-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="signup">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <router-link to="/login">Already have an account? Log in</router-link>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const router = useRouter()

    const signup = async () => {
      error.value = ''
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
        router.push('/')
      } catch (err) {
        error.value = err.message
      }
    }

    return { email, password, error, signup }
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
.error {
  color: #e74c3c;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
</style> 