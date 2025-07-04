<template>
  <div class="app">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h1>Hardware Inventory</h1>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link" exact>
          <i class="fas fa-chart-line"></i>
          Dashboard
        </router-link>
        <router-link to="/inventory" class="nav-link">
          <i class="fas fa-boxes"></i>
          Inventory
        </router-link>
        <router-link to="/sales" class="nav-link">
          <i class="fas fa-shopping-cart"></i>
          Sales
        </router-link>
        <router-link to="/reports" class="nav-link">
          <i class="fas fa-file-alt"></i>
          Reports
        </router-link>
      </div>
    </nav>

    <main class="main-content">
      <header class="top-bar">
        <div class="user-menu">
          <button class="notifications-btn">
            <i class="fas fa-bell"></i>
            <span class="notification-badge" v-if="unreadNotifications">
              {{ unreadNotifications }}
            </span>
          </button>
          
          <div class="user-profile" @click="toggleUserMenu">
            <img :src="userAvatar" alt="User Avatar" class="avatar">
            <span class="username">{{ username }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>

          <!-- User Dropdown Menu -->
          <div :class="['user-dropdown', { show: showUserMenu }]">
            <div class="dropdown-item">
              <i class="fas fa-user"></i>
              Profile
            </div>
            <div class="dropdown-item" @click="handleSettings">
              <i class="fas fa-cog"></i>
              Settings
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </div>
          </div>
        </div>
      </header>

      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from './firebase/config'
import { signOut } from 'firebase/auth'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const unreadNotifications = ref(3)
    const username = ref('')
    const userAvatar = ref('')
    const showUserMenu = ref(false)

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }

    const handleSettings = () => {
      router.push('/settings')
      showUserMenu.value = false
    }

    const handleLogout = async () => {
      try {
        await signOut(auth)
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    onMounted(() => {
      // Listen for auth state changes
      auth.onAuthStateChanged((user) => {
        if (user) {
          username.value = user.displayName || 'User'
          userAvatar.value = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username.value) + '&background=random'
        } else {
          username.value = ''
          userAvatar.value = ''
        }
      })

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        const userProfile = document.querySelector('.user-profile')
        if (userProfile && !userProfile.contains(e.target)) {
          showUserMenu.value = false
        }
      })
    })

    return {
      unreadNotifications,
      username,
      userAvatar,
      showUserMenu,
      toggleUserMenu,
      handleSettings,
      handleLogout
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f6fa;
  color: #2c3e50;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.sidebar-header h1 {
  font-size: 1.5rem;
  font-weight: 500;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: #3498db;
  color: white;
}

.nav-link i {
  width: 20px;
  text-align: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: white;
  padding: 15px 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-bar {
  position: relative;
  width: 300px;
}

.search-bar input {
  width: 100%;
  padding: 8px 35px 8px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
}

.search-bar i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.notifications-btn {
  position: relative;
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.notifications-btn:hover {
  background-color: #f5f6fa;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
  position: relative;
}

.user-profile:hover {
  background: #f5f6fa;
}

.user-profile i {
  font-size: 12px;
  color: #666;
  transition: transform 0.3s;
}

.user-profile:hover i {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 220px;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.user-dropdown.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.dropdown-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #2c3e50;
  transition: all 0.3s;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f5f6fa;
  color: #3498db;
}

.dropdown-item i {
  width: 20px;
  color: #666;
  font-size: 16px;
}

.dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 8px 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.username {
  font-weight: 500;
  font-size: 14px;
  color: #2c3e50;
}

.content {
  padding: 30px;
  flex: 1;
}

.sidebar-logout-btn {
  margin-top: auto;
  width: 100%;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}
.sidebar-logout-btn:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 10px;
  }

  .nav-links {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .nav-link {
    white-space: nowrap;
  }

  .top-bar {
    padding: 10px;
    justify-content: flex-end;
  }

  .user-menu {
    gap: 10px;
  }

  .content {
    padding: 15px;
  }
}
</style> 