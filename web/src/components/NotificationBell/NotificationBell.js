import { onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

export default {
  name: 'NotificationBell',
  setup() {
    const notificationStore = useNotificationStore();
    const { notifications, unreadCount, hasUnread } = storeToRefs(notificationStore);
    const router = useRouter();

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

    const getNotificationClass = (notification) => {
      const baseClass = 'notification-item';
      const color = notificationType(notification.type).color;
      let statusClass = `bg-${color}-soft`;
      if (!notification.read) {
        statusClass += ' fw-bold';
      }
      return `${baseClass} ${statusClass}`;
    };

    const markAsRead = (notification) => {
      notificationStore.markAsRead(notification);

      const parsedMessage = parseNotificationMessage(notification.message);
      if (parsedMessage.budgetId) {
        router.push(`/budgets?highlight=${parsedMessage.budgetId}`);
      }
    };

    const markAllAsRead = () => {
      notificationStore.markAllAsRead();
    };

    const parseNotificationMessage = (message) => {
      try {
        const parsed = JSON.parse(message);
        return typeof parsed === 'object' ? parsed : { title: message };
      } catch (e) {
        // Parse plain text message format
        const match = message.match(/^(.+?)\s#(\d+)\sdel\susuario\s(.+?)\.$/);
        if (match) {
          return {
            title: match[1],
            budgetId: match[2],
            userName: match[3]
          };
        }
        return { title: message };
      }
    };

    return {
      notifications,
      unreadCount,
      hasUnread,
      notificationType,
      getNotificationClass,
      markAsRead,
      markAllAsRead,
      parseNotificationMessage,
    };
  },
};