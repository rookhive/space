export type BrokerEvent = {
  type: string;
  payload: unknown;
};

export interface BrokerClient {
  request(event: BrokerEvent): Promise<{ response: unknown }>;
  publish(event: BrokerEvent): Promise<void>;
  dispose(): Promise<void>;
}
