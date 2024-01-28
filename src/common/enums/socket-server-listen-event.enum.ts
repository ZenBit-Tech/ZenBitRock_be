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
} as const;

export { ChatEvent };
