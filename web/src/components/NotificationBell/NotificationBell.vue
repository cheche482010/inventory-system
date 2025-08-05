<template>
  <div class="dropdown">
    <button class="btn btn-outline-secondary me-3 position-relative" type="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
      <font-awesome-icon :icon="hasUnread ? 'bell' : ['fa', 'bell']" />
      <span v-if="hasUnread" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
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
        <a v-for="notification in notifications" :key="notification.id" class="dropdown-item d-flex align-items-start p-3" href="#" @click.prevent="markAsRead(notification)">
          <div class="me-3">
            <span class="fa-stack fa-lg" :class="`text-${notificationType(notification.type).color}`">
              <i class="fas fa-circle fa-stack-2x"></i>
              <i :class="`fas ${notificationType(notification.type).icon} fa-stack-1x fa-inverse`"></i>
            </span>
          </div>
          <div class="flex-grow-1">
            <p class="mb-0" :class="{ 'fw-bold': !notification.read }">{{ notification.message }}</p>
            <small class="text-muted">{{ new Date(notification.createdAt).toLocaleString() }}</small>
          </div>
        </a>
      </div>
      <div class="dropdown-footer text-center p-2 border-top" v-if="hasUnread">
        <button class="btn btn-sm btn-link" @click.stop="markAllAsRead">Marcar todas como leídas</button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia';

export default {
  name: 'NotificationBell',
  setup() {
    const notificationStore = useNotificationStore();
    const { notifications, unreadCount, hasUnread } = storeToRefs(notificationStore);

    onMounted(() => {
      notificationStore.fetchNotifications();
    });

    const notificationType = (type) => {
      switch (type) {
        case 'budget_approved':
          return { color: 'success', icon: 'fa-check' };
        case 'budget_rejected':
          return { color: 'danger', icon: 'fa-times' };
        case 'new_budget':
          return { color: 'info', icon: 'fa-file-alt' };
        default:
          return { color: 'secondary', icon: 'fa-bell' };
      }
    };

    const markAsRead = (notification) => {
      notificationStore.markAsRead(notification);
    };

    const markAllAsRead = () => {
      notificationStore.markAllAsRead();
    };

    return {
      notifications,
      unreadCount,
      hasUnread,
      notificationType,
      markAsRead,
      markAllAsRead,
    };
  },
};
</script>
