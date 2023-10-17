import { MoneriumWebSocketOptions } from './types'
export declare const connectToOrderNotifications: ({
  profile,
  accessToken,
  env,
  subscriptions
}: MoneriumWebSocketOptions) => WebSocket
