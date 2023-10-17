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
var _GelatoRelayPack_gelatoRelay, _GelatoRelayPack_apiKey
Object.defineProperty(exports, '__esModule', { value: true })
exports.GelatoRelayPack = void 0
const bignumber_1 = require('@ethersproject/bignumber')
const relay_sdk_1 = require('@gelatonetwork/relay-sdk')
const protocol_kit_1 = require('@safe-global/protocol-kit')
const constants_1 = require('../../constants')
class GelatoRelayPack {
  constructor(apiKey) {
    _GelatoRelayPack_gelatoRelay.set(this, void 0)
    _GelatoRelayPack_apiKey.set(this, void 0)
    __classPrivateFieldSet(this, _GelatoRelayPack_gelatoRelay, new relay_sdk_1.GelatoRelay(), 'f')
    __classPrivateFieldSet(this, _GelatoRelayPack_apiKey, apiKey, 'f')
  }
  _getFeeToken(gasToken) {
    return !gasToken || gasToken === constants_1.ZERO_ADDRESS
      ? constants_1.GELATO_NATIVE_TOKEN_ADDRESS
      : gasToken
  }
  getFeeCollector() {
    return constants_1.GELATO_FEE_COLLECTOR
  }
  async getEstimateFee(chainId, gasLimit, gasToken) {
    const feeToken = this._getFeeToken(gasToken)
    const estimation = await __classPrivateFieldGet(
      this,
      _GelatoRelayPack_gelatoRelay,
      'f'
    ).getEstimatedFee(chainId, feeToken, bignumber_1.BigNumber.from(gasLimit), false)
    return estimation.toString()
  }
  async getTaskStatus(taskId) {
    return __classPrivateFieldGet(this, _GelatoRelayPack_gelatoRelay, 'f').getTaskStatus(taskId)
  }
  /**
   * Creates a payment transaction to Gelato
   *
   * @private
   * @async
   * @function
   * @param {Safe} safe - The Safe object
   * @param {string} gas - The gas amount for the payment.
   * @param {MetaTransactionOptions} options - Options for the meta transaction.
   * @returns {Promise<Transaction>} Promise object representing the created payment transaction.
   *
   */
  async createPaymentToGelato(safe, gas, options) {
    const chainId = await safe.getChainId()
    const gelatoAddress = this.getFeeCollector()
    const gasToken = options.gasToken ?? constants_1.ZERO_ADDRESS
    const paymentToGelato = await this.getEstimateFee(chainId, gas, gasToken)
    // The Gelato payment transaction
    const transferToGelato = (0, protocol_kit_1.createERC20TokenTransferTransaction)(
      gasToken,
      gelatoAddress,
      paymentToGelato
    )
    return transferToGelato
  }
  /**
   * Creates a Safe transaction designed to be executed using the Gelato Relayer.
   *
   * @param {CreateTransactionProps} createTransactionProps - Properties required to create the transaction.
   * @returns {Promise<SafeTransaction>} Returns a Promise that resolves with a SafeTransaction object.
   */
  async createRelayedTransaction({ safe, transactions, onlyCalls = false, options = {} }) {
    const { isSponsored = false } = options
    if (isSponsored) {
      const nonce = await safe.getNonce()
      const sponsoredTransaction = await safe.createTransaction({
        safeTransactionData: transactions,
        onlyCalls,
        options: {
          nonce
        }
      })
      return sponsoredTransaction
    }
    // If the ERC20 gas token does not follow the standard 18 decimals, we cannot use handlePayment to pay Gelato fees.
    const gasToken = options.gasToken ?? constants_1.ZERO_ADDRESS
    const isGasTokenCompatible = await (0, protocol_kit_1.isGasTokenCompatibleWithHandlePayment)(
      gasToken,
      safe
    )
    if (!isGasTokenCompatible) {
      // if the ERC20 gas token is not compatible (less than 18 decimals like USDC), a separate transfer is required to pay Gelato fees.
      return this.createTransactionWithTransfer({ safe, transactions, onlyCalls, options })
    }
    // If the gas token is compatible (Native token or standard ERC20), we use handlePayment function present in the Safe contract to pay Gelato fees
    return this.createTransactionWithHandlePayment({ safe, transactions, onlyCalls, options })
  }
  /**
   * Creates a Safe transaction designed to be executed using the Gelato Relayer and
   * uses the handlePayment function defined in the Safe contract to pay the fees
   * to the Gelato relayer.
   *
   * @async
   * @function createTransactionWithHandlePayment
   * @param {CreateTransactionProps} createTransactionProps - Properties needed to create the transaction.
   * @returns {Promise<SafeTransaction>} Returns a promise that resolves to the created SafeTransaction.
   * @private
   */
  async createTransactionWithHandlePayment({
    safe,
    transactions,
    onlyCalls = false,
    options = {}
  }) {
    const { gasLimit } = options
    const nonce = await safe.getNonce()
    // this transaction is only used for gas estimations
    const transactionToEstimateGas = await safe.createTransaction({
      safeTransactionData: transactions,
      onlyCalls,
      options: {
        nonce
      }
    })
    // as we set gasPrice to 1, safeTxGas is set to a non-zero value to prevent transaction failure due to out-of-gas errors. value see: https://github.com/safe-global/safe-contracts/blob/main/contracts/Safe.sol#L203
    const gasPrice = '1'
    const safeTxGas = await (0, protocol_kit_1.estimateSafeTxGas)(safe, transactionToEstimateGas)
    const gasToken = options.gasToken ?? constants_1.ZERO_ADDRESS
    const refundReceiver = this.getFeeCollector()
    const chainId = await safe.getChainId()
    // if a custom gasLimit is provided, we do not need to estimate the gas cost
    if (gasLimit) {
      const paymentToGelato = await this.getEstimateFee(chainId, gasLimit, gasToken)
      const syncTransaction = await safe.createTransaction({
        safeTransactionData: transactions,
        onlyCalls,
        options: {
          baseGas: paymentToGelato,
          gasPrice,
          safeTxGas,
          gasToken,
          refundReceiver,
          nonce
        }
      })
      return syncTransaction
    }
    // If gasLimit is not provided, we need to estimate the gas cost.
    const baseGas = await (0, protocol_kit_1.estimateTxBaseGas)(safe, transactionToEstimateGas)
    const safeDeploymentGasCost = await (0, protocol_kit_1.estimateSafeDeploymentGas)(safe)
    const totalGas =
      Number(baseGas) + // baseGas
      Number(safeTxGas) + // safeTxGas
      Number(safeDeploymentGasCost) + // Safe deploymet gas cost if it is required
      constants_1.GELATO_GAS_EXECUTION_OVERHEAD // Gelato execution overhead
    const paymentToGelato = await this.getEstimateFee(chainId, String(totalGas), gasToken)
    const syncTransaction = await safe.createTransaction({
      safeTransactionData: transactions,
      onlyCalls,
      options: {
        baseGas: paymentToGelato,
        gasPrice,
        safeTxGas,
        gasToken,
        refundReceiver,
        nonce
      }
    })
    return syncTransaction
  }
  /**
   * Creates a Safe transaction designed to be executed using the Gelato Relayer and
   * uses a separate ERC20 transfer to pay the fees to the Gelato relayer.
   *
   * @async
   * @function createTransactionWithTransfer
   * @param {CreateTransactionProps} createTransactionProps - Properties needed to create the transaction.
   * @returns {Promise<SafeTransaction>} Returns a promise that resolves to the created SafeTransaction.
   * @private
   */
  async createTransactionWithTransfer({ safe, transactions, onlyCalls = false, options = {} }) {
    const { gasLimit } = options
    const nonce = await safe.getNonce()
    const gasToken = options.gasToken ?? constants_1.ZERO_ADDRESS
    // if a custom gasLimit is provided, we do not need to estimate the gas cost
    if (gasLimit) {
      const transferToGelato = await this.createPaymentToGelato(safe, gasLimit, options)
      const syncTransaction = await safe.createTransaction({
        safeTransactionData: [...transactions, transferToGelato],
        onlyCalls,
        options: {
          nonce,
          gasToken
        }
      })
      return syncTransaction
    }
    // If gasLimit is not provided, we need to estimate the gas cost.
    // this transaction is only used for gas estimations
    const transactionToEstimateGas = await safe.createTransaction({
      safeTransactionData: transactions,
      onlyCalls,
      options: {
        nonce
      }
    })
    const safeTxGas = await (0, protocol_kit_1.estimateSafeTxGas)(safe, transactionToEstimateGas)
    const baseGas = await (0, protocol_kit_1.estimateTxBaseGas)(safe, transactionToEstimateGas)
    const safeDeploymentGasCost = await (0, protocol_kit_1.estimateSafeDeploymentGas)(safe)
    const totalGas =
      Number(baseGas) + // baseGas
      Number(safeTxGas) + // safeTxGas without Gelato payment transfer
      Number(safeDeploymentGasCost) + // Safe deploymet gas cost if it is required
      constants_1.GELATO_TRANSFER_GAS_COST + // Gelato payment transfer
      constants_1.GELATO_GAS_EXECUTION_OVERHEAD // Gelato execution overhead
    const transferToGelato = await this.createPaymentToGelato(safe, String(totalGas), options)
    const syncTransaction = await safe.createTransaction({
      safeTransactionData: [...transactions, transferToGelato],
      onlyCalls,
      options: {
        nonce,
        gasToken
      }
    })
    return syncTransaction
  }
  async sendSponsorTransaction(target, encodedTransaction, chainId) {
    if (!__classPrivateFieldGet(this, _GelatoRelayPack_apiKey, 'f')) {
      throw new Error('API key not defined')
    }
    const request = {
      chainId,
      target,
      data: encodedTransaction
    }
    const response = await __classPrivateFieldGet(
      this,
      _GelatoRelayPack_gelatoRelay,
      'f'
    ).sponsoredCall(request, __classPrivateFieldGet(this, _GelatoRelayPack_apiKey, 'f'))
    return response
  }
  async sendSyncTransaction(target, encodedTransaction, chainId, options) {
    const { gasLimit, gasToken } = options
    const feeToken = this._getFeeToken(gasToken)
    const request = {
      chainId,
      target,
      data: encodedTransaction,
      feeToken,
      isRelayContext: false
    }
    const relayRequestOptions = {
      gasLimit
    }
    const response = await __classPrivateFieldGet(
      this,
      _GelatoRelayPack_gelatoRelay,
      'f'
    ).callWithSyncFee(request, relayRequestOptions)
    return response
  }
  async relayTransaction({ target, encodedTransaction, chainId, options = {} }) {
    const response = options.isSponsored
      ? this.sendSponsorTransaction(target, encodedTransaction, chainId)
      : this.sendSyncTransaction(target, encodedTransaction, chainId, options)
    return response
  }
  /**
   * Sends the Safe transaction to the Gelato Relayer for execution.
   * If the Safe is not deployed, it creates a batch of transactions including the Safe deployment transaction.
   *
   * @param {SafeTransaction} safeTransaction - The Safe transaction to be executed.
   * @param {Safe} safe - The Safe object related to the transaction.
   * @returns {Promise<RelayResponse>} Returns a Promise that resolves with a RelayResponse object.
   */
  async executeRelayTransaction(safeTransaction, safe, options) {
    const isSafeDeployed = await safe.isSafeDeployed()
    const chainId = await safe.getChainId()
    const safeAddress = await safe.getAddress()
    const safeTransactionEncodedData = await safe.getEncodedTransaction(safeTransaction)
    const gasToken = options?.gasToken || safeTransaction.data.gasToken
    if (isSafeDeployed) {
      const relayTransaction = {
        target: safeAddress,
        encodedTransaction: safeTransactionEncodedData,
        chainId,
        options: {
          ...options,
          gasToken
        }
      }
      return this.relayTransaction(relayTransaction)
    }
    // if the Safe is not deployed we create a batch with the Safe deployment transaction and the provided Safe transaction
    const safeDeploymentBatch = await safe.wrapSafeTransactionIntoDeploymentBatch(safeTransaction)
    const relayTransaction = {
      target: safeDeploymentBatch.to,
      encodedTransaction: safeDeploymentBatch.data,
      chainId,
      options: {
        ...options,
        gasToken
      }
    }
    return this.relayTransaction(relayTransaction)
  }
}
exports.GelatoRelayPack = GelatoRelayPack
;(_GelatoRelayPack_gelatoRelay = new WeakMap()), (_GelatoRelayPack_apiKey = new WeakMap())
//# sourceMappingURL=GelatoRelayPack.js.map
