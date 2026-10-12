export type ChatUser = {
  id: number;
  username?: string | null;
  pictureUrl?: string | null;
};

export type ChatListing = {
  id: number;
  title: string;
  price: number;
  userId: number;
  images?: { url: string }[];
  user?: ChatUser;
};

export type ChatMessage = {
  id: number;
  message: string;
  senderId: number;
  chatId: number;
  created_at: string;
  is_read: boolean;
};

export type ChatSummary = {
  id: number;
  userId: number;
  listingId: number;
  created_at: string;
  user?: ChatUser;
  listing?: ChatListing;
  messages?: ChatMessage[];
  unreadCount?: number;
};
