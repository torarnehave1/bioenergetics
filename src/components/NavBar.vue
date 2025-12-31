<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const menuOpen = ref(false)

const isInstructor = computed(() =>
  userStore.role === 'instructor' || userStore.role === 'Admin' || userStore.role === 'Superadmin'
)

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/dashboard" class="brand-link">
        <span class="brand-icon">🌿</span>
        <span class="brand-text">Body Experience</span>
      </RouterLink>
    </div>

    <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
      <span class="menu-icon">{{ menuOpen ? '✕' : '☰' }}</span>
    </button>

    <div class="navbar-menu" :class="{ open: menuOpen }">
      <div class="navbar-links">
        <RouterLink to="/dashboard" class="nav-link" @click="menuOpen = false">
          <span class="nav-icon">📊</span>
          Dashboard
        </RouterLink>
        <RouterLink to="/log" class="nav-link" @click="menuOpen = false">
          <span class="nav-icon">📝</span>
          Log Experience
        </RouterLink>
        <RouterLink to="/exercises" class="nav-link" @click="menuOpen = false">
          <span class="nav-icon">🏃</span>
          Exercises
        </RouterLink>
        <RouterLink to="/body-segments" class="nav-link" @click="menuOpen = false">
          <span class="nav-icon">🧘</span>
          Body Segments
        </RouterLink>
        <RouterLink to="/progress" class="nav-link" @click="menuOpen = false">
          <span class="nav-icon">📈</span>
          Progress
        </RouterLink>
        <RouterLink
          v-if="isInstructor"
          to="/instructor"
          class="nav-link"
          @click="menuOpen = false"
        >
          <span class="nav-icon">👨‍🏫</span>
          Instructor
        </RouterLink>
      </div>

      <div class="navbar-user">
        <RouterLink to="/profile" class="user-link" @click="menuOpen = false">
          <span class="user-avatar">👤</span>
          <span class="user-name">{{ userStore.email }}</span>
        </RouterLink>
        <button class="btn btn-secondary btn-sm" @click="handleLogout">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--color-text);
}

.brand-icon {
  font-size: 1.5rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--space-sm);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.navbar-links {
  display: flex;
  gap: var(--space-md);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
  background-color: var(--color-bg-secondary);
}

.nav-icon {
  font-size: 1rem;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-left: var(--space-md);
  border-left: 1px solid var(--color-border-light);
}

.user-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text);
}

.user-avatar {
  font-size: 1.25rem;
}

.user-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .menu-toggle {
    display: block;
  }

  .navbar-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
    padding: var(--space-lg);
    background-color: var(--color-surface);
    transform: translateX(100%);
    transition: transform var(--transition-normal);
  }

  .navbar-menu.open {
    transform: translateX(0);
  }

  .navbar-links {
    flex-direction: column;
  }

  .navbar-user {
    flex-direction: column;
    padding-left: 0;
    padding-top: var(--space-md);
    border-left: none;
    border-top: 1px solid var(--color-border-light);
  }
}
</style>
