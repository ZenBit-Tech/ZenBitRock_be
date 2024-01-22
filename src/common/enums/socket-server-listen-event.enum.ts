const ChatEvent = {
  RequestAllMessages: 'request_all_messages',
  NewMessage: 'new_message',
  RequestAllChats: 'request_all_chats',
  NewChat: 'new_chat',
  RequestUnreadMessagesCount: 'get_unread_count',
  RequestUnreadMessagesByIdCount: 'get_unread_count_by_chat_id',
  RequestMarkAsRead: 'mark_as_read',
} as const;

export { ChatEvent };
