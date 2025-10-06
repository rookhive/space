import { HandlerContext } from '@connectrpc/connect';
import { Injectable } from '@nestjs/common';
import {
  PRODUCER_CREATED_MESSAGE_NAME,
  PRODUCER_PAUSED_MESSAGE_NAME,
  PRODUCER_RESUMED_MESSAGE_NAME,
} from '@repo/constants';
import {
  ConnectWebRtcTransportRequest,
  ConsumeRequest,
  ConsumeResumeRequest,
  CreateWebRtcTransportRequest,
  GetProducersRequest,
  PauseProducerRequest,
  ProduceWebRtcTransportRequest,
  ResumeProducerRequest,
} from '@repo/proto';
import { RoomID, RoomSignalingEvent, UserID } from '@repo/typesystem';
import { DtlsParameters, MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/types';
import { filter, map, Subject } from 'rxjs';
import { RouterService } from '../mediasoup/router.service';
import { SignalingGuard } from './signaling.guard';

@Injectable()
export class SignalingService {
  #roomEvents = new Subject<RoomSignalingEvent>();

  constructor(
    private readonly signalingGuard: SignalingGuard,
    private readonly routerService: RouterService
  ) {}

  async subscribeUserToRoomEvents(userId: UserID, roomId: RoomID) {
    return this.#roomEvents.pipe(
      filter((event) => event.roomId === roomId && event.data.userId !== userId),
      map((event) => ({
        data: JSON.stringify({
          type: event.type,
          data: { ...event.data },
        }),
      }))
    );
  }

  async getRtpCapabilities() {
    return await this.routerService.getRtpCapabilities();
  }

  async createWebRtcTransport(request: CreateWebRtcTransportRequest, context: HandlerContext) {
    const { user, room } = this.#getUser(context);
    const { isProducer } = request;
    const isTransportExist = isProducer ? user.sendTransportId : user.recvTransportId;
    if (isTransportExist)
      throw new Error(
        `Transport already exists for user ${user.id} as ${isProducer ? 'producer' : 'consumer'}`
      );
    const transport = await this.routerService.createWebRtcTransport(room.routerId);
    isProducer ? user.setSendTransportId(transport.id) : user.setRecvTransportId(transport.id);
    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  async connectWebRtcTransport(request: ConnectWebRtcTransportRequest, context: HandlerContext) {
    this.#getUser(context);
    const { transportId, dtlsParameters } = request;
    await this.routerService.connectWebRtcTransport(transportId, dtlsParameters as DtlsParameters);
    return {};
  }

  async produceWebRtcTransport(request: ProduceWebRtcTransportRequest, context: HandlerContext) {
    const { user, room } = this.#getUser(context);
    const { kind, rtpParameters } = request;
    if (!user.sendTransportId) {
      throw new Error(`Producer transport ID not found for user ${user.id}`);
    }
    const producerId = await this.routerService.produceWebRtcTransport(
      user.sendTransportId,
      kind as MediaKind,
      rtpParameters as RtpParameters
    );
    user.addProducerId(kind as MediaKind, producerId);
    this.#roomEvents.next({
      type: PRODUCER_CREATED_MESSAGE_NAME,
      roomId: room.id,
      data: {
        producerId,
        userId: user.id,
      },
    });
    return { producerId };
  }

  async consume(request: ConsumeRequest, context: HandlerContext) {
    const { user, room } = this.#getUser(context);
    const { producerId, rtpCapabilities } = request;
    if (!user.recvTransportId)
      throw new Error(`Consumer transport ID not found for user ${user.id}`);
    const result = await this.routerService.consume(
      room.routerId,
      producerId,
      user.recvTransportId,
      rtpCapabilities as RtpCapabilities
    );
    user.addConsumerId(result.consumerId);
    return result;
  }

  async consumeResume(request: ConsumeResumeRequest, context: HandlerContext) {
    const { user } = this.#getUser(context);
    const { consumerId } = request;
    if (!user.hasConsumer(consumerId))
      throw new Error(`Consumer with ID ${consumerId} not found for user ${user.id}`);
    await this.routerService.consumeResume(consumerId);
    return {};
  }

  async getProducers(_request: GetProducersRequest, context: HandlerContext) {
    const { user, room } = this.#getUser(context);
    return { producers: room.getProducersForUser(user.id) };
  }

  async pauseProducer(request: PauseProducerRequest, context: HandlerContext) {
    const { user, room } = this.#getUser(context);
    const { kind } = request;
    const producerId = user.getProducerIdByKind(kind as MediaKind);
    if (!producerId) throw new Error(`Producer of kind ${kind} not found for user ${user.id}`);
    await this.routerService.pauseProducer(producerId);
    this.#roomEvents.next({
      type: PRODUCER_PAUSED_MESSAGE_NAME,
      roomId: room.id,
      data: {
        producerId,
        userId: user.id,
      },
    });
    return {};
  }

  async resumeProducer(request: ResumeProducerRequest, context: HandlerContext) {
    const { user, room } = this.#getUser(context);
    const { kind } = request;
    const producerId = user.getProducerIdByKind(kind as MediaKind);
    if (!producerId) throw new Error(`Producer of kind ${kind} not found for user ${user.id}`);
    await this.routerService.resumeProducer(producerId);
    this.#roomEvents.next({
      type: PRODUCER_RESUMED_MESSAGE_NAME,
      roomId: room.id,
      data: {
        producerId,
        userId: user.id,
      },
    });
    return {};
  }

  #getUser(context: HandlerContext) {
    return this.signalingGuard.guardAndGetUser(context);
  }
}
