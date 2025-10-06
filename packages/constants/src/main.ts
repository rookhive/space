// Authentication
export const ACCESS_TOKEN_COOKIE_NAME = 'at';
export const REFRESH_TOKEN_COOKIE_NAME = 'rt';

// NATS events
export const REVOKED_SESSION_EVENT_NAME = 'session:revoked';

// WS messages
export const USER_INPUT_MESSAGE_NAME = 'user:input';
export const CHAT_MESSAGE_NAME = 'chat:message';

// SSE messages
export const PRODUCER_CREATED_MESSAGE_NAME = 'producer:created';
export const PRODUCER_PAUSED_MESSAGE_NAME = 'producer:paused';
export const PRODUCER_RESUMED_MESSAGE_NAME = 'producer:resumed';

// Rooms
export const SERVER_TICK_RATE = 60;
export const PHYSICS_TIMESTEP = 1 / SERVER_TICK_RATE;
export const VIDEO_ROOM_NAME = 'video-room';
export const VIDEO_ROOM_GRAVITY = -9.81;
export const VIDEO_ROOM_MAX_USER_COUNT = 6;
export const TV_WIDTH = 19.2;
export const TV_HEIGHT = 10.8;
export const TV_THICKNESS = 0.1;
export const TV_ARCH_RADIUS = 48;
export const USER_ANTI_GRAVITY_DAMPING = 5.0;
export const USER_ANTI_GRAVITY_STIFFNESS = 50.0;
export const USER_MASS = 10.0; // In kilograms
export const USER_RADIUS = 1.0; // In meters
export const USER_MAX_GROUNDED_HEIGHT = 2.5; // In meters
export const USER_WALK_IMPULSE = 3.5; // In newton-seconds
export const USER_RUN_IMPULSE = 15.0; // In newton-seconds
export const USER_JUMP_IMPULSE = 250.0; // In newton-seconds
export const USER_JUMP_COOLDOWN = 1.0; // In seconds
export const USER_CROUCH_IMPULSE = -80.0; // In newton-seconds
export const USER_FLOATING_HEIGHT = 2.0; // In meters

// Chat
export const CHAT_MESSAGE_MAX_LENGTH = 1000;
export const CHAT_HUD_MESSAGE_COUNT = 15;
export const CHAT_HUD_MESSAGE_DURATION = 20000; // In milliseconds
