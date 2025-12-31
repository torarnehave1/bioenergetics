import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

// Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AuthVerify from '../views/AuthVerify.vue'
import Dashboard from '../views/Dashboard.vue'
import LogExperience from '../views/LogExperience.vue'
import Exercises from '../views/Exercises.vue'
import ExerciseDetail from '../views/ExerciseDetail.vue'
import Progress from '../views/Progress.vue'
import BodySegments from '../views/BodySegments.vue'
import Profile from '../views/Profile.vue'
import InstructorDashboard from '../views/InstructorDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/auth/verify',
    name: 'AuthVerify',
    component: AuthVerify,
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/log',
    name: 'LogExperience',
    component: LogExperience,
    meta: { requiresAuth: true },
  },
  {
    path: '/log/:sessionId',
    name: 'LogExperienceSession',
    component: LogExperience,
    meta: { requiresAuth: true },
  },
  {
    path: '/exercises',
    name: 'Exercises',
    component: Exercises,
    meta: { requiresAuth: true },
  },
  {
    path: '/exercises/:id',
    name: 'ExerciseDetail',
    component: ExerciseDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/progress',
    name: 'Progress',
    component: Progress,
    meta: { requiresAuth: true },
  },
  {
    path: '/body-segments',
    name: 'BodySegments',
    component: BodySegments,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/instructor',
    name: 'InstructorDashboard',
    component: InstructorDashboard,
    meta: { requiresAuth: true, requiresInstructor: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Load user from storage if not already logged in
  if (!userStore.loggedIn) {
    userStore.loadFromStorage()
  }

  // Check session verification
  const isSessionVerified = sessionStorage.getItem('bioenergetics_session_verified') === '1'
  const isAuthenticated = userStore.loggedIn && isSessionVerified

  // Redirect authenticated users away from guest pages
  if (to.meta.guest && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // Check instructor access
  const isInstructor = userStore.role === 'instructor' || userStore.role === 'Admin' || userStore.role === 'Superadmin'
  if (to.meta.requiresInstructor && !isInstructor) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
