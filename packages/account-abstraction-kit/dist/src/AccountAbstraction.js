'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            }
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
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
var _AccountAbstraction_ethAdapter,
  _AccountAbstraction_signer,
  _AccountAbstraction_safeSdk,
  _AccountAbstraction_relayPack
Object.defineProperty(exports, '__esModule', { value: true })
const protocol_kit_1 = __importStar(require('@safe-global/protocol-kit'))
const ethers_1 = require('ethers')
class AccountAbstraction {
  constructor(signer) {
    _AccountAbstraction_ethAdapter.set(this, void 0)
    _AccountAbstraction_signer.set(this, void 0)
    _AccountAbstraction_safeSdk.set(this, void 0)
    _AccountAbstraction_relayPack.set(this, void 0)
    if (!signer.provider) {
      throw new Error('Signer must be connected to a provider')
    }
    __classPrivateFieldSet(this, _AccountAbstraction_signer, signer, 'f')
    __classPrivateFieldSet(
      this,
      _AccountAbstraction_ethAdapter,
      new protocol_kit_1.EthersAdapter({
        ethers: ethers_1.ethers,
        signerOrProvider: __classPrivateFieldGet(this, _AccountAbstraction_signer, 'f')
      }),
      'f'
    )
  }
  async init(options) {
    const { relayPack } = options
    this.setRelayPack(relayPack)
    const signer = await this.getSignerAddress()
    const owners = [signer]
    const threshold = 1
    const safeAccountConfig = {
      owners,
      threshold
    }
    const safeAddress = await (0, protocol_kit_1.predictSafeAddress)({
      ethAdapter: __classPrivateFieldGet(this, _AccountAbstraction_ethAdapter, 'f'),
      safeAccountConfig
    })
    const isSafeDeployed = await __classPrivateFieldGet(
      this,
      _AccountAbstraction_ethAdapter,
      'f'
    ).isContractDeployed(safeAddress)
    if (isSafeDeployed) {
      __classPrivateFieldSet(
        this,
        _AccountAbstraction_safeSdk,
        await protocol_kit_1.default.create({
          ethAdapter: __classPrivateFieldGet(this, _AccountAbstraction_ethAdapter, 'f'),
          safeAddress
        }),
        'f'
      )
    } else {
      __classPrivateFieldSet(
        this,
        _AccountAbstraction_safeSdk,
        await protocol_kit_1.default.create({
          ethAdapter: __classPrivateFieldGet(this, _AccountAbstraction_ethAdapter, 'f'),
          predictedSafe: { safeAccountConfig }
        }),
        'f'
      )
    }
  }
  setRelayPack(relayPack) {
    __classPrivateFieldSet(this, _AccountAbstraction_relayPack, relayPack, 'f')
  }
  async getSignerAddress() {
    const signerAddress = await __classPrivateFieldGet(
      this,
      _AccountAbstraction_signer,
      'f'
    ).getAddress()
    return signerAddress
  }
  async getNonce() {
    if (!__classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f')) {
      throw new Error('SDK not initialized')
    }
    return __classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f').getNonce()
  }
  async getSafeAddress() {
    if (!__classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f')) {
      throw new Error('SDK not initialized')
    }
    return __classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f').getAddress()
  }
  async isSafeDeployed() {
    if (!__classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f')) {
      throw new Error('SDK not initialized')
    }
    return __classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f').isSafeDeployed()
  }
  async relayTransaction(transactions, options) {
    if (
      !__classPrivateFieldGet(this, _AccountAbstraction_relayPack, 'f') ||
      !__classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f')
    ) {
      throw new Error('SDK not initialized')
    }
    const relayedTransaction = await __classPrivateFieldGet(
      this,
      _AccountAbstraction_relayPack,
      'f'
    ).createRelayedTransaction({
      safe: __classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f'),
      transactions,
      options
    })
    const signedSafeTransaction = await __classPrivateFieldGet(
      this,
      _AccountAbstraction_safeSdk,
      'f'
    ).signTransaction(relayedTransaction)
    const response = await __classPrivateFieldGet(
      this,
      _AccountAbstraction_relayPack,
      'f'
    ).executeRelayTransaction(
      signedSafeTransaction,
      __classPrivateFieldGet(this, _AccountAbstraction_safeSdk, 'f')
    )
    return response.taskId
  }
}
;(_AccountAbstraction_ethAdapter = new WeakMap()),
  (_AccountAbstraction_signer = new WeakMap()),
  (_AccountAbstraction_safeSdk = new WeakMap()),
  (_AccountAbstraction_relayPack = new WeakMap())
exports.default = AccountAbstraction
//# sourceMappingURL=AccountAbstraction.js.map
