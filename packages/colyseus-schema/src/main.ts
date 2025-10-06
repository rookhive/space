import { MapSchema, Schema, type } from '@colyseus/schema';

class Vector3 extends Schema {
  @type('number') x = 0;
  @type('number') y = 0;
  @type('number') z = 0;
}

export class User extends Schema {
  @type('string') id = '';
  @type('string') name = '';
  @type('string') email = '';
  @type('string') avatarUrl = '';
  @type('number') color = 0xffffff;
  @type('number') screenSlot = 0;
  @type('number') yaw = 0;
  @type('number') pitch = 0;
  @type(Vector3) position = new Vector3();
}

export class VideoRoomState extends Schema {
  @type({ map: User }) users = new MapSchema<User>();
}
