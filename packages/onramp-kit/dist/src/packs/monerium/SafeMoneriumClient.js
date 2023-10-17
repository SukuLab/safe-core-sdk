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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
var _SafeMoneriumClient_instances,
  _SafeMoneriumClient_safeSdk,
  _SafeMoneriumClient_ethAdapter,
  _SafeMoneriumClient_isValidSignature,
  _SafeMoneriumClient_createOrder,
  _SafeMoneriumClient_getSendMessage
Object.defineProperty(exports, '__esModule', { value: true })
exports.SafeMoneriumClient = void 0
const hash_1 = require('@ethersproject/hash')
const bytes_1 = require('@ethersproject/bytes')
const sdk_1 = require('@monerium/sdk')
const protocol_kit_1 = require('@safe-global/protocol-kit')
const api_kit_1 = __importDefault(require('@safe-global/api-kit'))
const errors_1 = require('../../lib/errors')
const safe_core_sdk_types_1 = require('@safe-global/safe-core-sdk-types')
const signatures_1 = require('./signatures')
class SafeMoneriumClient extends sdk_1.MoneriumClient {
  /**
   * Constructor where the Monerium environment and the Protocol kit instance are set
   * @param environment The Monerium environment
   * @param safeSdk The Protocol kit instance
   */
  constructor(environment, safeSdk) {
    super(environment)
    _SafeMoneriumClient_instances.add(this)
    _SafeMoneriumClient_safeSdk.set(this, void 0)
    _SafeMoneriumClient_ethAdapter.set(this, void 0)
    __classPrivateFieldSet(this, _SafeMoneriumClient_safeSdk, safeSdk, 'f')
    __classPrivateFieldSet(this, _SafeMoneriumClient_ethAdapter, safeSdk.getEthAdapter(), 'f')
  }
  /**
   * We get the Safe address using the Protocol kit instance
   * @returns The Safe address
   */
  async getSafeAddress() {
    return __classPrivateFieldGet(this, _SafeMoneriumClient_safeSdk, 'f').getAddress()
  }
  /**
   * Allow to make transactions using the Monerium SDK
   * @param order The order to be placed
   */
  async send(order) {
    const safeAddress = await this.getSafeAddress()
    const newOrder = await __classPrivateFieldGet(
      this,
      _SafeMoneriumClient_instances,
      'm',
      _SafeMoneriumClient_createOrder
    ).call(this, safeAddress, order)
    try {
      // Place the order to Monerium and Safe systems for being linked between each other and confirmed
      await this.placeOrder(newOrder)
      const safeTransaction = await this.signMessage(safeAddress, newOrder.message)
      return safeTransaction
    } catch (error) {
      throw new Error((0, errors_1.getErrorMessage)(error))
    }
  }
  /**
   * Check if the message is signed in the smart contract
   * @param safeAddress The Safe address
   * @param message The message to be signed
   * @returns A boolean indicating if the message is signed
   */
  async isMessageSigned(safeAddress, message) {
    const messageHash = (0, hash_1.hashMessage)(message)
    const messageHashSigned = await __classPrivateFieldGet(
      this,
      _SafeMoneriumClient_instances,
      'm',
      _SafeMoneriumClient_isValidSignature
    ).call(this, safeAddress, messageHash)
    return messageHashSigned
  }
  /**
   * Check if the message is pending (multi owner or not executed) using the Transaction Service
   * @param safeAddress The Safe address
   * @param message The message to be signed
   * @returns A boolean indicating if the message is signed
   */
  async isSignMessagePending(safeAddress, message) {
    const chainId = await __classPrivateFieldGet(
      this,
      _SafeMoneriumClient_safeSdk,
      'f'
    ).getChainId()
    const apiKit = new api_kit_1.default({ chainId })
    const pendingTransactions = await apiKit.getPendingTransactions(safeAddress)
    return pendingTransactions.results.some((tx) => {
      return (
        // @ts-expect-error - dataDecoded should have the method property
        tx?.dataDecoded?.method === 'signMessage' &&
        // @ts-expect-error - dataDecoded should have the parameters array
        tx?.dataDecoded?.parameters[0]?.value === (0, hash_1.hashMessage)(message)
      )
    })
  }
  /**
   * Sign a message using the Safe SDK
   * @param safeAddress The Safe address
   * @param message The message to be signed
   */
  async signMessage(safeAddress, message) {
    try {
      const safeVersion = await __classPrivateFieldGet(
        this,
        _SafeMoneriumClient_safeSdk,
        'f'
      ).getContractVersion()
      const signMessageContract = await (0, protocol_kit_1.getSignMessageLibContract)({
        ethAdapter: __classPrivateFieldGet(this, _SafeMoneriumClient_ethAdapter, 'f'),
        safeVersion
      })
      const txData = signMessageContract.encode('signMessage', [(0, hash_1.hashMessage)(message)])
      const safeTransaction = await __classPrivateFieldGet(
        this,
        _SafeMoneriumClient_safeSdk,
        'f'
      ).createTransaction({
        safeTransactionData: {
          to: signMessageContract.getAddress(),
          value: '0',
          data: txData,
          operation: safe_core_sdk_types_1.OperationType.DelegateCall
        }
      })
      const safeTxHash = await __classPrivateFieldGet(
        this,
        _SafeMoneriumClient_safeSdk,
        'f'
      ).getHash(safeTransaction)
      const senderSignature = await __classPrivateFieldGet(
        this,
        _SafeMoneriumClient_safeSdk,
        'f'
      ).signHash(safeTxHash)
      const chainId = await __classPrivateFieldGet(
        this,
        _SafeMoneriumClient_safeSdk,
        'f'
      ).getChainId()
      const apiKit = new api_kit_1.default({ chainId })
      await apiKit.proposeTransaction({
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress:
          (await __classPrivateFieldGet(
            this,
            _SafeMoneriumClient_ethAdapter,
            'f'
          ).getSignerAddress()) || '',
        senderSignature: senderSignature.data
      })
      const transaction = await apiKit.getTransaction(safeTxHash)
      return transaction
    } catch (error) {
      throw new Error((0, errors_1.getErrorMessage)(error))
    }
  }
  /**
   * Get the corresponding Monerium SDK Chain from the current chain id
   * @returns The Chain
   */
  async getChain() {
    const chainId = await __classPrivateFieldGet(
      this,
      _SafeMoneriumClient_safeSdk,
      'f'
    ).getChainId()
    switch (chainId) {
      case 1:
      case 5:
        return 'ethereum'
      case 100:
      case 10200:
        return 'gnosis'
      case 137:
      case 80001:
        return 'polygon'
      default:
        throw new Error(`Chain not supported: ${chainId}`)
    }
  }
  /**
   * Get the corresponding Monerium SDK Network from the current chain id
   * @returns The Network
   */
  async getNetwork() {
    const chainId = await __classPrivateFieldGet(
      this,
      _SafeMoneriumClient_safeSdk,
      'f'
    ).getChainId()
    switch (chainId) {
      case 1:
      case 100:
      case 137:
        return 'mainnet'
      case 5:
        return 'goerli'
      case 10200:
        return 'chiado'
      case 80001:
        return 'mumbai'
      default:
        throw new Error(`Network not supported: ${chainId}`)
    }
  }
}
exports.SafeMoneriumClient = SafeMoneriumClient
;(_SafeMoneriumClient_safeSdk = new WeakMap()),
  (_SafeMoneriumClient_ethAdapter = new WeakMap()),
  (_SafeMoneriumClient_instances = new WeakSet()),
  (_SafeMoneriumClient_isValidSignature =
    /**
     * Check if the message signature is valid using the fallback handler Smart Contract
     * @param safeAddress The Safe address
     * @param messageHash The message hash
     * @returns A boolean indicating if the message is signed
     */
    async function _SafeMoneriumClient_isValidSignature(safeAddress, messageHash) {
      try {
        const eip1271data = signatures_1.EIP_1271_INTERFACE.encodeFunctionData('isValidSignature', [
          messageHash,
          '0x'
        ])
        const msgBytes = (0, bytes_1.arrayify)(messageHash)
        const eip1271BytesData = signatures_1.EIP_1271_BYTES_INTERFACE.encodeFunctionData(
          'isValidSignature',
          [msgBytes, '0x']
        )
        const checks = [
          __classPrivateFieldGet(this, _SafeMoneriumClient_ethAdapter, 'f').call({
            from: safeAddress,
            to: safeAddress,
            data: eip1271data
          }),
          __classPrivateFieldGet(this, _SafeMoneriumClient_ethAdapter, 'f').call({
            from: safeAddress,
            to: safeAddress,
            data: eip1271BytesData
          })
        ]
        const response = await Promise.all(checks)
        return (
          !!response.length &&
          (response[0].slice(0, 10).toLowerCase() === signatures_1.MAGIC_VALUE ||
            response[1].slice(0, 10).toLowerCase() === signatures_1.MAGIC_VALUE_BYTES)
        )
      } catch (error) {
        throw new Error((0, errors_1.getErrorMessage)(error))
      }
    }),
  (_SafeMoneriumClient_createOrder =
    /**
     * Create a valid order for the Monerium SDK
     * @param order The order to be created
     * @returns The Monerium type order
     */
    async function _SafeMoneriumClient_createOrder(safeAddress, order) {
      return {
        kind: sdk_1.OrderKind.redeem,
        amount: order.amount,
        signature: '0x',
        address: safeAddress,
        currency: order.currency,
        counterpart: order.counterpart,
        memo: order.memo,
        message: __classPrivateFieldGet(
          this,
          _SafeMoneriumClient_instances,
          'm',
          _SafeMoneriumClient_getSendMessage
        ).call(this, order),
        chain: await this.getChain(),
        network: await this.getNetwork(),
        supportingDocumentId: ''
      }
    }),
  (_SafeMoneriumClient_getSendMessage = function _SafeMoneriumClient_getSendMessage(order) {
    const currentDate = new Date().toISOString()
    return `Send ${order.currency.toUpperCase()} ${order.amount} to ${
      order.counterpart.identifier.iban
    } at ${currentDate}`
  })
//# sourceMappingURL=SafeMoneriumClient.js.map
