const ChatEvent = {
  RequestAllMessages: 'request_all_messages',
  NewMessage: 'new_message',
  RequestAllChats: 'request_all_chats',
  NewChat: 'new_chat',
  RequestUnreadMessagesCount: 'getUnreadCount',
  RequestUnreadMessagesByIdCount: 'getUnreadCountByChatId',
  RequestMarkAsRead: 'markAsRead',
} as const;

export { ChatEvent };
