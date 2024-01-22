type MessageResponse = {
  id: string;
  chatId?: string;
  createdAt: Date;
  content: string;
  owner: { id: string; firstName: string; lastName: string };
  isRead: boolean;
};

export { type MessageResponse };
