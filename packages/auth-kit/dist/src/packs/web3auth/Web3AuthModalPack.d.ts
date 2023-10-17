import { IAdapter, UserInfo } from '@web3auth/base'
import { ModalConfig, Web3Auth, Web3AuthOptions } from '@web3auth/modal'
import { Web3AuthConfig, Web3AuthEvent, Web3AuthEventListener } from './types'
import { AuthKitBasePack } from '../../AuthKitBasePack'
import type { AuthKitEthereumProvider, AuthKitSignInData } from '../../types'
/**
 * Web3AuthModalPack implements the SafeAuthClient interface for adapting the Web3Auth service provider
 * @class
 */
export declare class Web3AuthModalPack extends AuthKitBasePack {
  #private
  web3Auth?: Web3Auth
  /**
   * Instantiate the Web3AuthModalPack
   * @param config Web3Auth specific config
   */
  constructor(config?: Web3AuthConfig)
  /**
   * Initialize the Web3Auth service provider
   * @param options Web3Auth options {@link https://web3auth.io/docs/sdk/web/modal/initialize#arguments}
   * @param adapters Web3Auth adapters {@link https://web3auth.io/docs/sdk/web/modal/initialize#configuring-adapters}
   * @param modalConfig The modal configuration {@link https://web3auth.io/docs/sdk/web/modal/whitelabel#whitelabeling-while-modal-initialization}
   * @throws Error if there was an error initializing Web3Auth
   */
  init({
    options,
    adapters,
    modalConfig
  }: {
    options: Web3AuthOptions
    adapters?: IAdapter<unknown>[]
    modalConfig?: Record<string, ModalConfig>
  }): Promise<void>
  /**
   * Connect to the Web3Auth service provider
   * @returns The sign in data from the provider
   */
  signIn(): Promise<AuthKitSignInData>
  getProvider(): AuthKitEthereumProvider | null
  /**
   * Disconnect from the Web3Auth service provider
   */
  signOut(): Promise<void>
  /**
   * Get authenticated user information
   * @returns The user info
   */
  getUserInfo(): Promise<Partial<UserInfo>>
  /**
   * Allow to subscribe to the Web3Auth events
   * @param event The event you want to subscribe to (https://web3auth.io/docs/sdk/web/modal/initialize#subscribing-the-lifecycle-events)
   * @param handler The event handler
   */
  subscribe(event: Web3AuthEvent, handler: Web3AuthEventListener): void
  /**
   * Allow to unsubscribe to the Web3Auth events
   * @param event The event you want to unsubscribe to (https://web3auth.io/docs/sdk/web/modal/initialize#subscribing-the-lifecycle-events)
   * @param handler The event handler
   */
  unsubscribe(event: Web3AuthEvent, handler: Web3AuthEventListener): void
}
