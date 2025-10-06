import {
  type Collider,
  ColliderDesc,
  type RigidBody,
  RigidBodyDesc,
  type Vector3,
  type World,
} from '@dimforge/rapier3d';
import {
  PHYSICS_TIMESTEP,
  USER_ANTI_GRAVITY_DAMPING,
  USER_ANTI_GRAVITY_STIFFNESS,
  USER_CROUCH_IMPULSE,
  USER_FLOATING_HEIGHT,
  USER_JUMP_COOLDOWN,
  USER_JUMP_IMPULSE,
  USER_MASS,
  USER_MAX_GROUNDED_HEIGHT,
  USER_RADIUS,
  USER_RUN_IMPULSE,
  USER_WALK_IMPULSE,
} from '@repo/constants';
import { UserAction, type UserID, type UserInput } from '@repo/typesystem';

export class UserPhysics {
  readonly #id: UserID;
  readonly #world: World;
  readonly #body: RigidBody;
  readonly #collider: Collider;

  #yaw = 0;
  #pitch = 0;
  #action = 0;
  #jumpCooldown = 0;
  #isJumpPressed = false;
  #lastSentPosition?: Vector3;

  constructor(id: UserID, world: World, position: Vector3) {
    this.#world = world;
    this.#id = id;

    this.#body = world.createRigidBody(
      RigidBodyDesc.dynamic()
        .setTranslation(position.x, position.y, position.z)
        .setAdditionalMass(USER_MASS)
        .setLinearDamping(0.75)
        .setCcdEnabled(true)
        .setCanSleep(true)
        .lockRotations()
    );

    this.#collider = world.createCollider(
      ColliderDesc.ball(USER_RADIUS) //
        .setFriction(0.0)
        .setRestitution(1.0)
        .setDensity(1.0),
      this.#body
    );
  }

  get id() {
    return this.#id;
  }

  step() {
    this.#decreaseJumpCooldown();
    this.#applyAntiGravityImpulse();

    if (this.#action) {
      this.#applyJumpImpulse();
      this.#applyCrouchImpulse();
      this.#applyMovementImpulse();
    }

    this.#isJumpPressed = false;
  }

  dispose() {
    this.#world.removeCollider(this.#collider, true);
    this.#world.removeRigidBody(this.#body);
  }

  applyInput({ yaw, pitch, action }: UserInput) {
    this.#yaw = yaw;
    this.#pitch = pitch;
    this.#action = action;
    this.#isJumpPressed = this.#isJumpPressed || Boolean(action & UserAction.Jump);
  }

  getState() {
    const position = this.#body.translation();
    const rotation = this.#body.rotation();
    const movementThreshold = 1e-2;

    const hasSignificantChange =
      !this.#lastSentPosition ||
      Math.abs(position.x - this.#lastSentPosition.x) > movementThreshold ||
      Math.abs(position.y - this.#lastSentPosition.y) > movementThreshold ||
      Math.abs(position.z - this.#lastSentPosition.z) > movementThreshold;

    if (hasSignificantChange) {
      const q = (v: number) => Math.round(v * 1e3) / 1e3;
      this.#lastSentPosition = { x: q(position.x), y: q(position.y), z: q(position.z) };
    }

    return {
      position: this.#lastSentPosition ?? position,
      rotation,
      yaw: this.#yaw,
      pitch: this.#pitch,
    };
  }

  setPosition(position: Vector3) {
    this.#body.setTranslation(position, true);
    this.#body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }

  setRotation(rotation: { x: number; y: number; z: number; w: number }) {
    this.#body.setRotation(rotation, true);
  }

  #applyAntiGravityImpulse() {
    // See https://en.wikipedia.org/wiki/Hooke%27s_law
    const userMass = this.#body.mass();
    const userVelocity = this.#body.linvel().y;
    const gravityForce = Math.abs(this.#world.gravity.y);
    const springForce = USER_ANTI_GRAVITY_STIFFNESS * (USER_FLOATING_HEIGHT - this.#getYPosition());
    const dampingForce = USER_ANTI_GRAVITY_DAMPING * userVelocity;
    const totalForce = userMass * gravityForce + springForce - dampingForce;
    const impulseY = totalForce * PHYSICS_TIMESTEP;
    this.#body.applyImpulse({ x: 0, y: impulseY, z: 0 }, true);
  }

  #applyJumpImpulse() {
    if (this.#isJumpPressed && this.#checkIfGrounded() && this.#jumpCooldown <= 0) {
      this.#body.applyImpulse({ x: 0, y: USER_JUMP_IMPULSE, z: 0 }, true);
      this.#jumpCooldown = USER_JUMP_COOLDOWN;
    }
  }

  #applyCrouchImpulse() {
    if (this.#action & UserAction.Crouch && this.#checkIfGrounded()) {
      this.#body.applyImpulse({ x: 0, y: USER_CROUCH_IMPULSE * PHYSICS_TIMESTEP, z: 0 }, true);
    }
  }

  #applyMovementImpulse() {
    const movementDirection = this.#getMovementDirection();
    if (movementDirection.x || movementDirection.z) {
      const isRunning = this.#action & UserAction.Run;
      const impulse = isRunning ? USER_RUN_IMPULSE : USER_WALK_IMPULSE;
      this.#body.applyImpulse(
        { x: movementDirection.x * impulse, y: 0, z: movementDirection.z * impulse },
        true
      );
    }
  }

  #getMovementDirection() {
    let localX = 0;
    let localZ = 0;

    if (this.#action & UserAction.Forward) localZ -= 1;
    if (this.#action & UserAction.Backward) localZ += 1;
    if (this.#action & UserAction.Left) localX -= 1;
    if (this.#action & UserAction.Right) localX += 1;

    // Normalize diagonal movement
    const localLength = Math.sqrt(localX ** 2 + localZ ** 2);
    if (localLength > 0) {
      localX /= localLength;
      localZ /= localLength;
    }

    const cosYaw = Math.cos(this.#yaw);
    const sinYaw = Math.sin(this.#yaw);

    // See https://en.wikipedia.org/wiki/Rotation_matrix
    // But in our case the yaw grows counter-clockwise, so we need to swap the sinYaw sign
    return {
      x: localX * cosYaw + localZ * sinYaw,
      y: 0,
      z: -localX * sinYaw + localZ * cosYaw,
    };
  }

  #decreaseJumpCooldown() {
    this.#jumpCooldown = Math.max(0, this.#jumpCooldown - PHYSICS_TIMESTEP);
  }

  #checkIfGrounded() {
    return this.#getYPosition() <= USER_MAX_GROUNDED_HEIGHT;
  }

  #getYPosition() {
    return this.#body.translation().y - USER_RADIUS;
  }
}
