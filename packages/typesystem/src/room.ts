import type { ProducerID, UserID } from './main';

export type RoomID = string;

export type RoomEvent =
  | {
      type: 'room:created';
      payload: { roomId: RoomID };
    }
  | {
      type: 'room:disposed';
      payload: { roomId: RoomID };
    }
  | {
      type: 'user:connected';
      payload: { userId: UserID; roomId: RoomID };
    }
  | {
      type: 'user:disconnected';
      payload: { userId: UserID; roomId: RoomID };
    };

export type RoomSignalingEvent = {
  type: 'producer:created' | 'producer:paused' | 'producer:resumed';
  roomId: RoomID;
  data: {
    userId: UserID;
    producerId: ProducerID;
  };
};

export type RoomJoinOptions = {
  userColor: number;
};
