type ContentResponse = {
  id: string;
  createdAt: Date;
  title: string;
  link: string;
  type: string;
  screenshot?: string;
  checked: boolean;
};

export { type ContentResponse };
