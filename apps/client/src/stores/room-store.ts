import type { ChatMessage, User, UserID } from '@repo/typesystem';
import { createStore } from 'solid-js/store';

export type Message = {
  timestamp: number;
  message: string;
} & (
  | {
      type: 'system';
    }
  | {
      type: 'user';
      userName: string;
      userColor: string;
      userAvatarUrl: string;
    }
);

type State = {
  users: User[];
  messages: Message[];
  chatMessage: string;
  localVideoTrack?: MediaStreamTrack;
  localAudioTrack?: MediaStreamTrack;
  isOverlayOpen: boolean;
  isHUDChatInputOpen: boolean;
};

const [state, setState] = createStore<State>({
  users: [],
  messages: [],
  chatMessage: '',
  isOverlayOpen: false,
  isHUDChatInputOpen: false,
});

export const roomStore = {
  state,
  dispose() {
    setState({
      users: [],
      messages: [],
      chatMessage: '',
      isHUDChatInputOpen: false,
      isOverlayOpen: false,
    });
  },
  getUserById: (userId: UserID) => {
    return state.users.find(({ id }) => id === userId);
  },
  addUser(user: User) {
    setState('users', state.users.length, user);
  },
  removeUser(userId: UserID) {
    setState('users', (users) => users.filter(({ id }) => id !== userId));
  },
  addMessage(chatMessage: ChatMessage) {
    switch (chatMessage.type) {
      case 'system': {
        const { type, message, timestamp } = chatMessage;
        setState('messages', state.messages.length, {
          type,
          message,
          timestamp,
        });
        break;
      }
      case 'user': {
        const { type, message, timestamp, userId } = chatMessage;
        const user = state.users.find(({ id }) => id === userId);
        if (!user) return;
        const userName = user.name.split(' ')[0];
        const userColor = `#${user.color.toString(16).padStart(6, '0')}`;
        const userAvatarUrl = user.avatarUrl;
        setState('messages', state.messages.length, {
          type,
          message,
          timestamp,
          userName,
          userColor,
          userAvatarUrl,
        });
        break;
      }
    }
  },
  setChatMessage(message: string) {
    setState('chatMessage', message);
  },
  setLocalVideoTrack(track?: MediaStreamTrack) {
    setState('localVideoTrack', track);
  },
  setLocalAudioTrack(track?: MediaStreamTrack) {
    setState('localAudioTrack', track);
  },
  setOverlayOpen(isOpen: boolean) {
    setState('isOverlayOpen', isOpen);
  },
  setHUDChatInputOpen(isOpen: boolean) {
    setState('isHUDChatInputOpen', isOpen);
  },
};
