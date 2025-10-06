import { ColliderDesc, type World } from '@dimforge/rapier3d';
import {
  TV_ARCH_RADIUS,
  TV_HEIGHT,
  TV_THICKNESS,
  TV_WIDTH,
  VIDEO_ROOM_MAX_USER_COUNT,
} from '@repo/constants';
import collisionData from '@repo/glb-parser/dist/room.collision.json';
import type { Collision } from '@repo/typesystem';

export class CollisionManager {
  readonly #world: World;

  constructor(world: World) {
    this.#world = world;
  }

  addCollisions() {
    this.#addRoomCollisions();
    this.#addTVCollisions();
  }

  #addRoomCollisions() {
    for (const { vertices, indices, position, rotation, scale } of collisionData as Collision[]) {
      const scaledVertices = new Float32Array(vertices.length);

      for (let i = 0; i < vertices.length; i += 3) {
        scaledVertices[i] = vertices[i] * scale[0];
        scaledVertices[i + 1] = vertices[i + 1] * scale[1];
        scaledVertices[i + 2] = vertices[i + 2] * scale[2];
      }

      const colliderDesc = ColliderDesc.trimesh(scaledVertices, new Uint32Array(indices));
      colliderDesc.setTranslation(position[0], position[1], position[2]);
      colliderDesc.setRotation({ x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3] });
      colliderDesc.setSensor(false);

      this.#world.createCollider(colliderDesc);
    }
  }

  #addTVCollisions() {
    const angleStep = 2 * Math.asin(TV_WIDTH / (2 * TV_ARCH_RADIUS));
    const startAngle = -Math.PI / 2 - (angleStep * (VIDEO_ROOM_MAX_USER_COUNT - 1)) / 2;

    for (let i = 0; i < VIDEO_ROOM_MAX_USER_COUNT; i++) {
      const colliderDesc = ColliderDesc.cuboid(TV_WIDTH / 2, TV_HEIGHT / 2, TV_THICKNESS / 2);
      const angle = startAngle + i * angleStep;
      const rotationY = -angle - Math.PI / 2;
      const position = {
        x: Math.cos(angle) * TV_ARCH_RADIUS,
        y: TV_HEIGHT / 2,
        z: Math.sin(angle) * TV_ARCH_RADIUS,
      };

      colliderDesc.setSensor(false);
      colliderDesc.setTranslation(position.x, position.y, position.z);
      colliderDesc.setRotation({
        x: 0,
        y: Math.sin(rotationY / 2),
        z: 0,
        w: Math.cos(rotationY / 2),
      });

      this.#world.createCollider(colliderDesc);
    }
  }
}
