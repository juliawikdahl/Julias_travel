import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/flights',
    name: 'Flights',
    component: () => import('../views/FlightsPage.vue')
  },
  {
    path: '/hotels',
    name: 'Hotels',
    component: () => import('../views/HotelsPage.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/ContactPage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: () => import('../views/BookingsPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
