import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AITools from '@/views/AITools.vue'

const Home = () => import('@/views/Home.vue')
const Today = () => import('@/views/Today.vue')
const Activities = () => import('@/views/Activities.vue')
const Favorites = () => import('@/views/Favorites.vue')
const Progress = () => import('@/views/Progress.vue')
const EditRoutine = () => import('@/views/EditRoutine.vue')
const TipsDisplay = () => import('@/views/TipsDisplay.vue')
const TipsCongrats = () => import('@/views/TipsCongrats.vue')
const LearningStart = () => import('@/views/LearningStart.vue')
const Stories = () => import('@/views/Stories.vue')
const Story1 = () => import('@/views/Story1.vue')
const AITool = () => import('@/views/AITools.vue')

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: '/', name: 'Home', component: Home },
    {
      path: '/',
      component: AppLayout, // shared header and sidebar for these pages
      children: [
        { path: 'today', name: 'Today', component: Today },
        { path: 'learning-start', name: 'LearningStart', component: LearningStart },
        { path: 'AITools', name: 'AITools', component: AITools },
        { path: 'Stories', name: 'Stories', component: Stories},
        { path: 'Story1', name: 'Story1', component: Story1},
        { path: 'activities', name: 'Activities', component: Activities },
        {
          path: 'activities/:activityId',
          name: 'TipsDisplay',
          component: TipsDisplay,
          props: true,
          meta: { parent: 'Activities' }
        },
        {
          path: 'activities/:activityId/congrats',
          name: 'TipsCongrats',
          component: TipsCongrats,
          props: true,
        },
        { path: 'favorites', name: 'Favorites', component: Favorites },
        { path: 'progress', name: 'Progress', component: Progress },
        { path: 'edit', name: 'edit', component: EditRoutine },
      ],
    },
    // put pages here if it shouldn't show header/sidebar
    { path: '/selector', name: 'Selector', component: () => import('@/views/Selector.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }, // catch-all to Home
  ],
  scrollBehavior: () => ({ top: 0 }),
})
