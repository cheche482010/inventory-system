import { defineStore } from 'pinia';
import { notificationService } from '@/services/notificationService';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [],
        loading: false,
    }),
    getters: {
        unreadCount: (state) => {
            return state.notifications.filter(n => !n.read).length;
        },
        hasUnread: (state) => {
            return state.notifications.some(n => !n.read);
        }
    },
    actions: {
        async fetchNotifications() {
            this.loading = true;
            try {
                const authStore = useAuthStore();
                const user = authStore.user;
                const response = await notificationService.getAll();
                let notifications = response.data;

                if (user && user.role !== 'admin' && user.role !== 'dev') {
                    notifications = notifications.filter(n => !n.type?.startsWith('budget_'));
                }

                this.notifications = notifications;
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                this.loading = false;
            }
        },
        async markAsRead(notification) {
            if (notification.read) return;
            try {
                await notificationService.markAsRead(notification.id);
                const index = this.notifications.findIndex(n => n.id === notification.id);
                if (index !== -1) {
                    this.notifications[index].read = true;
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },
        async markAllAsRead() {
            try {
                await notificationService.markAllAsRead();
                this.notifications.forEach(n => n.read = true);
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        },
    },
});
