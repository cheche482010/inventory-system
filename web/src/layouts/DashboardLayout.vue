<template>
  <div class="dashboard-layout">
    <!-- Overlay para móviles cuando el sidebar está abierto -->
    <div class="sidebar-overlay" :class="{ 'show': isSidebarOpen && isMobile }" @click="toggleSidebar"></div>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'open': isSidebarOpen, 'minimized': !isSidebarOpen && !isMobile }">
      <nav class="p-3 d-flex flex-column h-100">
        <!-- Logo de la empresa -->
        <div class="text-center mb-3">
          <img src="@/assets/images/logo.png" alt="Logo" class="logo" :class="{ 'logo-minimized': !isSidebarOpen }" />
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <button class="btn d-md-none text-white close-btn" @click="toggleSidebar">
            <font-awesome-icon icon="times" />
          </button>
        </div>
        <div class="text-center mb-4" v-if="isSidebarOpen">
          <small class="text-white-50">{{ user?.firstName }} {{ user?.lastName }}</small>
          <br>
          <span class="badge" :class="`bg-${getRoleBadgeColor(user?.role)}`">
            {{ getRoleLabel(user?.role) }}
          </span>
        </div>

        <ul class="nav nav-pills flex-column mb-auto">
          <li class="nav-item mb-2" v-if="canViewDashboard">
            <router-link to="/" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="home" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item mb-2">
            <router-link to="/products" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="box" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Productos</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="userRole === 'user'">
            <router-link to="/my-requests" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="receipt" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Mis Solicitudes</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="userRole === 'admin' || userRole === 'dev'">
            <router-link to="/budgets" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="file-invoice-dollar" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Presupuestos</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="canCreate">
            <router-link to="/brands" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="tags" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Marcas</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="canCreate">
            <router-link to="/categories" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="tags" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Categorías</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="canViewUsers">
            <router-link to="/users" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="users" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Usuarios</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="canViewActivities">
            <router-link to="/activities" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="history" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Actividades</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="canViewPermissions">
            <router-link to="/permissions" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="shield-halved" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Permisos</span>
            </router-link>
          </li>
          <li class="nav-item mb-2" v-if="canImport">
            <router-link to="/import" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
              <font-awesome-icon icon="upload" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Importar Datos</span>
            </router-link>
          </li>
          <li class="nav-item mb-2">
            <button @click="logout" class="btn btn-outline-light" :class="{ 'btn-sm w-100': isSidebarOpen }">
              <font-awesome-icon icon="sign-out-alt" :class="{ 'me-2': isSidebarOpen }" />
              <span v-if="isSidebarOpen">Cerrar Sesión</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content" :class="{ 'sidebar-minimized': !isSidebarOpen && !isMobile }">
      <header class="navbar navbar-light bg-light p-3 shadow-sm">
        <!-- Botón para móvil -->
        <button class="btn btn-outline-primary d-md-none" @click="toggleSidebar">
          <font-awesome-icon icon="bars" />
        </button>
        <!-- Botón para desktop/tablet -->
        <button class="btn btn-outline-secondary d-none d-md-block" @click="toggleSidebar">
          <font-awesome-icon :icon="isSidebarOpen ? 'chevron-left' : 'chevron-right'" />
        </button>
        <span class="navbar-brand mb-0 h1 ms-3 d-none d-md-block">Panel de Administración</span>
        <div class="ms-auto d-flex align-items-center">
          <!-- Notifications -->
          <NotificationBell v-if="userRole !== 'user'" />

          <!-- Cart Icon -->
          <router-link to="/cart" v-if="userRole === 'user' && isActive"
            class="btn btn-outline-primary me-3 position-relative">
            <font-awesome-icon icon="shopping-cart" />
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ cartItemCount }}
              <span class="visually-hidden">items in cart</span>
            </span>
          </router-link>

          <button @click="logout" class="btn btn-sm btn-outline-danger d-none d-md-block">
            <font-awesome-icon icon="sign-out-alt" class="me-2" />
            Salir
          </button>
        </div>
      </header>
      <main class="p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped src="./DashboardLayout.scss"></style>
<script src="./DashboardLayout.js"></script>