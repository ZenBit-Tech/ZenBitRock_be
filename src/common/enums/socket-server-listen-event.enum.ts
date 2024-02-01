const ChatEvent = {
  RequestAllMessages: 'request_all_messages',
  NewMessage: 'new_message',
  RequestAllChats: 'request_all_chats',
  NewChat: 'new_chat',
  ChatDeleted: 'chat_deleted',
  ChatUpdated: 'chat_updated',
  RequestUnreadMessagesCount: 'get_unread_count',
  RequestUnreadMessagesByIdCount: 'get_unread_count_by_chat_id',
  RequestMarkAsRead: 'mark_as_read',
  RequestUnreadMessagesCountUpdated: 'unread_messages_count_updated',
  NewNotification: 'new_nofification',
  RequestAllNotifications: 'request_all_notifications',
  DeleteNotificationToUser: 'delete_notification_to_user',
  NotificationMarkAsRead: 'notification_mark_as_read',
  RequestNewNotificationsCount: 'request_new_notifications_count',
  RequestSetLike: 'request_set_like',
  RequestSetLikeUpdated: 'request_set_like_updated',
} as const;

export { ChatEvent };
