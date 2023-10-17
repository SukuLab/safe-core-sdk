import { OnRampKitBasePack } from '../../OnRampKitBasePack'
import type {
  StripeProviderConfig,
  StripeEvent,
  StripeEventListener,
  StripeOpenOptions,
  StripeSession
} from './types'
/**
 * This class extends the OnRampKitBasePack to work with the Stripe platform
 * @class StripePack
 */
export declare class StripePack extends OnRampKitBasePack {
  #private
  /**
   * Initialize the StripePack
   * @constructor
   * @param config The configuration object for the Stripe provider. Ideally we will put here things like api keys, secrets, urls, etc.
   */
  constructor(config: StripeProviderConfig)
  /**
   * This method loads the Stripe JS files and initializes the StripeOnRamp object
   */
  init(): Promise<void>
  /**
   * This method open the onramp widget with the provided Stripe options
   * @param options The options to open the onramp widget
   */
  open({ element, theme, sessionId, defaultOptions }: StripeOpenOptions): Promise<StripeSession>
  /**
   * This method close the onramp widget
   */
  close(): Promise<void>
  /**
   * Subscribe to an event
   * @param event The Stripe event to subscribe or '*' to subscribe to all events
   * @param handler The callback to execute when the event is triggered
   */
  subscribe(event: StripeEvent, handler: StripeEventListener): void
  /**
   * Unsubscribe from an event
   * @param event The Stripe event to unsubscribe or '*' to unsubscribe from all events
   * @param handler The callback to remove from the event
   */
  unsubscribe(event: StripeEvent, handler: StripeEventListener): void
}
