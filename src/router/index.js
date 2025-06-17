import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import Inventory from '../components/Inventory.vue';
import Sales from '../components/Sales.vue';
import Profile from '../components/Profile.vue';
import Login from '../views/Login.vue';
import Reports from '../components/Reports.vue';
import Signup from '../views/Signup.vue';
import Settings from '../components/Settings.vue';
import { auth } from '../firebase/config';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: Inventory,
    meta: { requiresAuth: true }
  },
  {
    path: '/sales',
    name: 'Sales',
    component: Sales,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Wait for Firebase Auth to initialize before checking auth state
let isAuthReady = false;
const waitForAuth = new Promise(resolve => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    isAuthReady = true;
    unsubscribe();
    resolve(user);
  });
});

router.beforeEach(async (to, from, next) => {
  if (!isAuthReady) {
    await waitForAuth;
  }
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router; 