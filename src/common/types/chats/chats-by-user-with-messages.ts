import { Chat } from 'src/common/entities/chat.entity';

import { Pagination } from './pagination';

export type GetChatsByUserWithMessages = {
  data: Chat[];
  pagination : Pagination;
};
