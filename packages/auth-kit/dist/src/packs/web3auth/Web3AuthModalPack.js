'use strict'
var __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === 'm') throw new TypeError('Private method is not writable')
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a setter')
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError('Cannot write private member to an object whose class did not declare it')
    return (
      kind === 'a' ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value),
      value
    )
  }
var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a getter')
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError(
        'Cannot read private member from an object whose class did not declare it'
      )
    return kind === 'm' ? f : kind === 'a' ? f.call(receiver) : f ? f.value : state.get(receiver)
  }
var _Web3AuthModalPack_provider, _Web3AuthModalPack_config
Object.defineProperty(exports, '__esModule', { value: true })
exports.Web3AuthModalPack = void 0
const modal_1 = require('@web3auth/modal')
const errors_1 = require('../../lib/errors')
const AuthKitBasePack_1 = require('../../AuthKitBasePack')
/**
 * Web3AuthModalPack implements the SafeAuthClient interface for adapting the Web3Auth service provider
 * @class
 */
class Web3AuthModalPack extends AuthKitBasePack_1.AuthKitBasePack {
  /**
   * Instantiate the Web3AuthModalPack
   * @param config Web3Auth specific config
   */
  constructor(config) {
    super()
    _Web3AuthModalPack_provider.set(this, void 0)
    _Web3AuthModalPack_config.set(this, void 0)
    __classPrivateFieldSet(this, _Web3AuthModalPack_config, config, 'f')
    __classPrivateFieldSet(this, _Web3AuthModalPack_provider, null, 'f')
  }
  /**
   * Initialize the Web3Auth service provider
   * @param options Web3Auth options {@link https://web3auth.io/docs/sdk/web/modal/initialize#arguments}
   * @param adapters Web3Auth adapters {@link https://web3auth.io/docs/sdk/web/modal/initialize#configuring-adapters}
   * @param modalConfig The modal configuration {@link https://web3auth.io/docs/sdk/web/modal/whitelabel#whitelabeling-while-modal-initialization}
   * @throws Error if there was an error initializing Web3Auth
   */
  async init({ options, adapters, modalConfig }) {
    try {
      this.web3Auth = new modal_1.Web3Auth(options)
      adapters?.forEach((adapter) => this.web3Auth?.configureAdapter(adapter))
      await this.web3Auth.initModal({ modalConfig: modalConfig })
      __classPrivateFieldSet(this, _Web3AuthModalPack_provider, this.web3Auth.provider, 'f')
    } catch (e) {
      throw new Error((0, errors_1.getErrorMessage)(e))
    }
  }
  /**
   * Connect to the Web3Auth service provider
   * @returns The sign in data from the provider
   */
  async signIn() {
    if (!this.web3Auth) {
      throw new Error('Web3AuthModalPack is not initialized')
    }
    __classPrivateFieldSet(this, _Web3AuthModalPack_provider, await this.web3Auth.connect(), 'f')
    const eoa = await this.getAddress()
    const chainId = await this.getChainId()
    const safes = await this.getSafes(
      chainId,
      __classPrivateFieldGet(this, _Web3AuthModalPack_config, 'f')?.txServiceUrl
    )
    const signInData = {
      eoa,
      safes
    }
    return signInData
  }
  getProvider() {
    return __classPrivateFieldGet(this, _Web3AuthModalPack_provider, 'f')
  }
  /**
   * Disconnect from the Web3Auth service provider
   */
  async signOut() {
    if (!this.web3Auth) {
      throw new Error('Web3AuthModalPack is not initialized')
    }
    __classPrivateFieldSet(this, _Web3AuthModalPack_provider, null, 'f')
    await this.web3Auth.logout()
  }
  /**
   * Get authenticated user information
   * @returns The user info
   */
  async getUserInfo() {
    if (!this.web3Auth) {
      throw new Error('Web3AuthModalPack is not initialized')
    }
    const userInfo = await this.web3Auth.getUserInfo()
    return userInfo
  }
  /**
   * Allow to subscribe to the Web3Auth events
   * @param event The event you want to subscribe to (https://web3auth.io/docs/sdk/web/modal/initialize#subscribing-the-lifecycle-events)
   * @param handler The event handler
   */
  subscribe(event, handler) {
    this.web3Auth?.on(event, handler)
  }
  /**
   * Allow to unsubscribe to the Web3Auth events
   * @param event The event you want to unsubscribe to (https://web3auth.io/docs/sdk/web/modal/initialize#subscribing-the-lifecycle-events)
   * @param handler The event handler
   */
  unsubscribe(event, handler) {
    this.web3Auth?.off(event, handler)
  }
}
exports.Web3AuthModalPack = Web3AuthModalPack
;(_Web3AuthModalPack_provider = new WeakMap()), (_Web3AuthModalPack_config = new WeakMap())
//# sourceMappingURL=Web3AuthModalPack.js.map
