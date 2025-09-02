import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

const Today = () => import('@/views/DailyRoutine.vue')
const Activities = () => import('@/views/Activities.vue')
const Favorites = () => import('@/views/Favorites.vue')
const Progress = () => import('@/views/Progress.vue')
const EditRoutine = () => import('@/views/EditRoutine.vue')

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      component: AppLayout, // shared header and sidebar for these pages
      children: [
        { path: '', name: 'Today', component: Today },
        { path: 'activities', name: 'Activities', component: Activities },
        { path: 'favorites', name: 'Favorites', component: Favorites },
        { path: 'progress', name: 'Progress', component: Progress },
        { path: 'edit', name: 'edit', component: EditRoutine },
      ],
    },
    // put pages here if it shouldn't show header/sidebar
    { path: '/selector', name: 'Selector', component: () => import('@/views/Selector.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
