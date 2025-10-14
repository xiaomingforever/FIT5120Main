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
const AITool = () => import('@/views/AITools.vue')
const DataInsights = () => import('@/views/DataInsights.vue')
const SearchResults = () => import('@/views/SearchResults.vue')

const Story1 = () => import('@/views/Articles/Story1.vue')
const Related1 = () => import('@/views/Articles/Related1.vue')
const Related2 = () => import('@/views/Articles/Related2.vue')
const Related3 = () => import('@/views/Articles/Related3.vue')
const Related4 = () => import('@/views/Articles/Related4.vue')
const Trending1 = () => import('@/views/Articles/Trending1.vue')
const Trending2 = () => import('@/views/Articles/Trending2.vue')
const Trending3 = () => import('@/views/Articles/Trending3.vue')
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
    { path: '/', name: 'Home', component: Home },
    {
      path: '/',
      component: AppLayout, // shared header and sidebar for these pages
      children: [
        { path: 'today', name: 'Today', component: Today },
        { path: 'learning-start', name: 'LearningStart', component: LearningStart },
        { path: 'AITools', name: 'AITools', component: AITools },
        { path: 'Stories', name: 'Stories', component: Stories},
        { path: 'DataInsights', name: 'DataInsights', component: DataInsights},

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
        { path: 'search', name: 'SearchResults', component: SearchResults },
        { path: 'favorites', name: 'Favorites', component: Favorites },
        { path: 'progress', name: 'Progress', component: Progress },
        { path: 'edit', name: 'edit', component: EditRoutine },
        { path: 'Story1', name: 'Story1', component: Story1},
        { path: 'Related1', name: 'Related1', component: Related1},
        { path: 'Related2', name: 'Related2', component: Related2},
        { path: 'Related3', name: 'Related3', component: Related3},
        { path: 'Related5', name: 'Related4', component: Related4},
        { path: 'Trending1', name: 'Trending1', component: Trending1},
        { path: 'Trending2', name: 'Trending2', component: Trending2},
        { path: 'Trending3', name: 'Trending3', component: Trending3},
      ],
    },
    // put pages here if it shouldn't show header/sidebar
    { path: '/selector', name: 'Selector', component: () => import('@/views/Selector.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }, // catch-all to Home
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// router navigation guard
// router.beforeEach((to, from, next) => {
//   const isAuthenticated = localStorage.getItem('auth') === 'true'

//   // if user not logged in and not going to login → redirect to login
//   if (!isAuthenticated && to.name !== 'Login') {
//     next({ name: 'Login' })
//   }
//   // if user is logged in and going to login → redirect to home
//   else if (isAuthenticated && to.name === 'Login') {
//     next({ name: 'Home' })
//   }
//   else {
//     next()
//   }
// })

export default router
