import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import AddDiscountView from './views/AddDiscountView.vue'
import apiService from './services/api'

const routes = [
  { path: '/', component: HomeView },
  { path: '/tambah', component: AddDiscountView },
  { path: '/edit/:id', component: AddDiscountView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

// Register API service secara global
app.config.globalProperties.$api = apiService.api

app.use(router)
app.mount('#app')
