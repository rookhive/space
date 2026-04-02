import type { Room } from '@colyseus/sdk';
import type { VideoRoomState } from '@repo/colyseus-schema';

export type DeviceID = string;

export type RoomDevices = {
  camera: DeviceID;
  microphone: DeviceID;
};

export type RoomData = {
  room: Room<VideoRoomState>;
};

export type AuthSessionData = {
  codeVerifier: string;
  state: string;
  continuePath?: string;
};
