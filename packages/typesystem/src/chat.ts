import type { UserID } from './user';

export type UserChatMessage = {
  type: 'user';
  message: string;
  userId: UserID;
};

export type SystemChatMessage = {
  type: 'system';
  message: string;
};

export type ChatMessage = { timestamp: number } & (UserChatMessage | SystemChatMessage);
