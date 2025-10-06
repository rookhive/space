import { ConsumerID, ProducerID, RoomID, TransportID, UserID } from '@repo/typesystem';
import { MediaKind } from 'mediasoup/types';

export class User {
  readonly #id: UserID;
  readonly #roomId: RoomID;
  readonly #producerIds = new Map<MediaKind, ProducerID>();
  readonly #consumerIds = new Set<ConsumerID>();

  #sendTransportId?: TransportID;
  #recvTransportId?: TransportID;

  constructor(id: UserID, roomId: RoomID) {
    this.#id = id;
    this.#roomId = roomId;
  }

  get id() {
    return this.#id;
  }

  get roomId() {
    return this.#roomId;
  }

  get sendTransportId() {
    return this.#sendTransportId;
  }

  get recvTransportId() {
    return this.#recvTransportId;
  }

  get producerIds() {
    return this.#producerIds.values();
  }

  get consumerIds() {
    return this.#consumerIds;
  }

  setSendTransportId(transportId: TransportID) {
    this.#sendTransportId = transportId;
  }

  setRecvTransportId(transportId: TransportID) {
    this.#recvTransportId = transportId;
  }

  addProducerId(kind: MediaKind, producerId: ProducerID) {
    this.#producerIds.set(kind, producerId);
  }

  addConsumerId(consumerId: ConsumerID) {
    this.#consumerIds.add(consumerId);
  }

  hasConsumer(consumerId: ConsumerID) {
    return this.#consumerIds.has(consumerId);
  }

  getProducerIdByKind(kind: MediaKind) {
    return this.#producerIds.get(kind);
  }
}
