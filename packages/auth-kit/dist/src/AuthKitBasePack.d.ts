import type { AuthKitEthereumProvider, AuthKitSignInData } from './types'
export declare abstract class AuthKitBasePack {
  #private
  safeAuthData?: AuthKitSignInData
  /**
   * Initialize the pack
   * @param options The provider specific options
   */
  abstract init(options?: unknown): Promise<void>
  /**
   * Start the sign in flow in the pack
   * @returns The sign in data from the provider
   */
  abstract signIn(): Promise<AuthKitSignInData>
  /**
   * Start the sign out flow in the pack
   */
  abstract signOut(): Promise<void>
  /**
   * Get the provider instance based on the pack
   * @returns The provider instance
   */
  abstract getProvider(): AuthKitEthereumProvider | null
  /**
   * Get the user info from the provider
   * @returns The user info from the provider
   */
  abstract getUserInfo(): Promise<unknown>
  /**
   * Subscribe to an event
   * @param event  The event to subscribe to
   * @param handler  The handler to be called when the event is triggered
   */
  abstract subscribe(event: unknown, handler: unknown): void
  /**
   * Unsubscribe from an event
   * @param event  The event to unsubscribe from
   * @param handler The handler to be removed from the event
   */
  abstract unsubscribe(event: unknown, handler: unknown): void
  /**
   * Get the list of Safe addresses owned by the user in the chain
   * @param txServiceUrl The URL of the Safe Transaction Service
   * @returns The list of Safe addresses owned by the user in the chain
   */
  getSafes(chainId: number, txServiceUrl?: string): Promise<string[]>
  /**
   * Get the owner address from the provider
   * @returns The signer address
   */
  getAddress(): Promise<string>
  getChainId(): Promise<number>
}
