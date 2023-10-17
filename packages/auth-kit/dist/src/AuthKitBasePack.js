'use strict'
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
var _AuthKitBasePack_instances, _AuthKitBasePack_getApiKit
Object.defineProperty(exports, '__esModule', { value: true })
exports.AuthKitBasePack = void 0
const providers_1 = require('@ethersproject/providers')
const api_kit_1 = __importDefault(require('@safe-global/api-kit'))
class AuthKitBasePack {
  constructor() {
    _AuthKitBasePack_instances.add(this)
  }
  /**
   * Get the list of Safe addresses owned by the user in the chain
   * @param txServiceUrl The URL of the Safe Transaction Service
   * @returns The list of Safe addresses owned by the user in the chain
   */
  async getSafes(chainId, txServiceUrl) {
    const apiKit = __classPrivateFieldGet(
      this,
      _AuthKitBasePack_instances,
      'm',
      _AuthKitBasePack_getApiKit
    ).call(this, chainId, txServiceUrl)
    const address = await this.getAddress()
    try {
      const safesByOwner = await apiKit.getSafesByOwner(address)
      return safesByOwner.safes
    } catch (e) {
      return []
    }
  }
  /**
   * Get the owner address from the provider
   * @returns The signer address
   */
  async getAddress() {
    const authKitProvider = this.getProvider()
    if (!authKitProvider) {
      throw new Error('Provider is not defined')
    }
    const ethersProvider = new providers_1.Web3Provider(authKitProvider)
    const signer = ethersProvider.getSigner()
    return signer.getAddress()
  }
  async getChainId() {
    const authKitProvider = this.getProvider()
    if (!authKitProvider) {
      throw new Error('Provider is not defined')
    }
    const ethersProvider = new providers_1.Web3Provider(authKitProvider)
    const networkDetails = await ethersProvider.getNetwork()
    return networkDetails.chainId
  }
}
exports.AuthKitBasePack = AuthKitBasePack
;(_AuthKitBasePack_instances = new WeakSet()),
  (_AuthKitBasePack_getApiKit = function _AuthKitBasePack_getApiKit(chainId, txServiceUrl) {
    if (!this.getProvider()) {
      throw new Error('Provider is not defined')
    }
    return new api_kit_1.default({
      chainId,
      txServiceUrl
    })
  })
//# sourceMappingURL=AuthKitBasePack.js.map
