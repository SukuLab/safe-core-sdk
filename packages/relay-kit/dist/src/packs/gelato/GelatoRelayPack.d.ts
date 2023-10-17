import { RelayResponse, TransactionStatusResponse } from '@gelatonetwork/relay-sdk'
import Safe from '@safe-global/protocol-kit'
import { RelayPack, CreateTransactionProps } from '../../types'
import {
  MetaTransactionOptions,
  RelayTransaction,
  SafeTransaction
} from '@safe-global/safe-core-sdk-types'
export declare class GelatoRelayPack implements RelayPack {
  #private
  constructor(apiKey?: string)
  private _getFeeToken
  getFeeCollector(): string
  getEstimateFee(chainId: number, gasLimit: string, gasToken?: string): Promise<string>
  getTaskStatus(taskId: string): Promise<TransactionStatusResponse | undefined>
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
  private createPaymentToGelato
  /**
   * Creates a Safe transaction designed to be executed using the Gelato Relayer.
   *
   * @param {CreateTransactionProps} createTransactionProps - Properties required to create the transaction.
   * @returns {Promise<SafeTransaction>} Returns a Promise that resolves with a SafeTransaction object.
   */
  createRelayedTransaction({
    safe,
    transactions,
    onlyCalls,
    options
  }: CreateTransactionProps): Promise<SafeTransaction>
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
  private createTransactionWithHandlePayment
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
  private createTransactionWithTransfer
  sendSponsorTransaction(
    target: string,
    encodedTransaction: string,
    chainId: number
  ): Promise<RelayResponse>
  sendSyncTransaction(
    target: string,
    encodedTransaction: string,
    chainId: number,
    options: MetaTransactionOptions
  ): Promise<RelayResponse>
  relayTransaction({
    target,
    encodedTransaction,
    chainId,
    options
  }: RelayTransaction): Promise<RelayResponse>
  /**
   * Sends the Safe transaction to the Gelato Relayer for execution.
   * If the Safe is not deployed, it creates a batch of transactions including the Safe deployment transaction.
   *
   * @param {SafeTransaction} safeTransaction - The Safe transaction to be executed.
   * @param {Safe} safe - The Safe object related to the transaction.
   * @returns {Promise<RelayResponse>} Returns a Promise that resolves with a RelayResponse object.
   */
  executeRelayTransaction(
    safeTransaction: SafeTransaction,
    safe: Safe,
    options?: MetaTransactionOptions
  ): Promise<RelayResponse>
}
