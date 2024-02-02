import { Chat } from 'src/common/entities/chat.entity';

type MessageResponse = {
  id: string;
  chatId?: string;
  chat?: Chat;
  createdAt: Date;
  content: string;
  owner: { id: string; firstName: string; lastName: string };
  isReadBy: { messageId: string; userId: string; isRead: boolean }[];
  likes: { messageId: string; userId: string; like: string }[];
};

export { type MessageResponse };
