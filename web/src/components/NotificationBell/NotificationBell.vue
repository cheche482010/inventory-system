<template>
  <div class="dropdown">
    <button class="btn btn-outline-secondary me-3 position-relative" type="button" id="notificationDropdown"
      data-bs-toggle="dropdown" aria-expanded="false">
      <font-awesome-icon :icon="hasUnread ? 'bell' : ['fa', 'bell']" />
      <span v-if="hasUnread"
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
        {{ unreadCount }}
      </span>
    </button>
    <div class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="notificationDropdown" style="width: 350px;">
      <div class="dropdown-header d-flex justify-content-between align-items-center px-3 py-2">
        <h6 class="mb-0">Notificaciones</h6>
      </div>
      <div class="notification-list" style="max-height: 400px; overflow-y: auto;">
        <div v-if="notifications.length === 0" class="text-center text-muted p-3">
          No tienes notificaciones.
        </div>
        <a v-for="notification in notifications" :key="notification.id"
          class="dropdown-item d-flex align-items-start p-3" :class="getNotificationClass(notification)" href="#"
          @click.prevent="markAsRead(notification)">
          <div class="flex-grow-1 text-wrap">
            <div v-if="parseNotificationMessage(notification.message).budgetId">
              <div class="mb-1">{{ parseNotificationMessage(notification.message).title }}</div>
              <div class="mb-1">#{{ parseNotificationMessage(notification.message).budgetId }} usuario: {{
                parseNotificationMessage(notification.message).userName }}.</div>
              <small class="text-muted d-block">fecha: {{ new Date(notification.createdAt).toLocaleDateString() }}, hora
                {{ new Date(notification.createdAt).toLocaleTimeString() }}</small>
            </div>
            <div v-else>
              <div class="mb-1">{{ notification.message }}</div>
              <small class="text-muted d-block">{{ new Date(notification.createdAt).toLocaleString() }}</small>
            </div>
          </div>
        </a>
      </div>
      <div class="dropdown-footer text-center p-2 border-top" v-if="hasUnread">
        <button class="btn btn-sm btn-link" @click.stop="markAllAsRead">Marcar todas como leídas</button>
      </div>
    </div>
  </div>
</template>

<script src="./NotificationBell.js"></script>
<style scoped src="./NotificationBell.scss"></style>