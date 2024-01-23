const ChatEvent = {
  RequestAllMessages: 'request_all_messages',
  NewMessage: 'new_message',
  RequestAllChats: 'request_all_chats',
  NewChat: 'new_chat',
  ChatDeleted: 'chat_deleted',
  ChatUpdated: 'chat_updated',
} as const;

export { ChatEvent };
