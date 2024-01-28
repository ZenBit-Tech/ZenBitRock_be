import { ContentType } from './content.type.enum';

type ContentResponse = {
  id: string;
  createdAt: Date;
  title: string;
  link: string;
  type: ContentType;
  screenshot?: string;
  checked: boolean;
};

export { type ContentResponse };
