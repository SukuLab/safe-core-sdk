import { OnRampKitBasePack } from '../../OnRampKitBasePack'
import { SafeMoneriumClient } from './SafeMoneriumClient'
import {
  MoneriumEvent,
  MoneriumEventListener,
  MoneriumInitOptions,
  MoneriumOpenOptions,
  MoneriumProviderConfig
} from './types'
/**
 * This class extends the OnRampKitBasePack to work with the Monerium platform
 * @class MoneriumPack
 */
export declare class MoneriumPack extends OnRampKitBasePack {
  #private
  client?: SafeMoneriumClient
  /**
   * The constructor of the MoneriumPack
   * @constructor
   * @param config The configuration object for the Monerium provider
   */
  constructor(config: MoneriumProviderConfig)
  /**
   * Initializes the SafeMoneriumClient
   * @param options The MoneriumInitOptions object
   * @throws {Error} If the Monerium client is not initialized
   */
  init(options: MoneriumInitOptions): Promise<void>
  /**
   * This method initialize the flow with Monerium in order to gain access to the resources
   * using the access_token. Return a initialized {@link SafeMoneriumClient}
   * @param options The MoneriumOpenOptions object
   * @returns A {@link SafeMoneriumClient} instance
   */
  open(options: MoneriumOpenOptions): Promise<SafeMoneriumClient>
  /**
   * Close the flow and clean up
   */
  close(): Promise<void>
  /**
   * Subscribe to MoneriumEvent to receive notifications using the Monerium API (WebSocket)
   * We are setting a subscription map because we need the user to have a token to start the WebSocket connection
   * {@link https://monerium.dev/api-docs#operation/profile-orders-notifications}
   * @param event The event to subscribe to
   * @param handler The handler to be called when the event is triggered
   */
  subscribe(event: MoneriumEvent, handler: MoneriumEventListener): void
  /**
   * Unsubscribe from MoneriumEvent and close the socket if there are no more subscriptions
   * @param event The event to unsubscribe from
   */
  unsubscribe(event: MoneriumEvent): void
}
