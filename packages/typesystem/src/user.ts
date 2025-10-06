export type UserID = string;

export type User = {
  id: UserID;
  name: string;
  email: string;
  color: number;
  avatarUrl: string;
};

export type UserInput = {
  action: number;
  yaw: number;
  pitch: number;
};

export enum UserAction {
  Forward = 1 << 0,
  Right = 1 << 1,
  Backward = 1 << 2,
  Left = 1 << 3,
  Jump = 1 << 4,
  Run = 1 << 5,
  Crouch = 1 << 6,
}
