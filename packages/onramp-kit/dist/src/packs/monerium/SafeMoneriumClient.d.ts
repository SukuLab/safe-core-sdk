import { Chain, MoneriumClient, Networks } from '@monerium/sdk'
import Safe from '@safe-global/protocol-kit'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { SafeMoneriumOrder } from './types'
export declare class SafeMoneriumClient extends MoneriumClient {
  #private
  /**
   * Constructor where the Monerium environment and the Protocol kit instance are set
   * @param environment The Monerium environment
   * @param safeSdk The Protocol kit instance
   */
  constructor(environment: 'production' | 'sandbox', safeSdk: Safe)
  /**
   * We get the Safe address using the Protocol kit instance
   * @returns The Safe address
   */
  getSafeAddress(): Promise<string>
  /**
   * Allow to make transactions using the Monerium SDK
   * @param order The order to be placed
   */
  send(order: SafeMoneriumOrder): Promise<SafeMultisigTransactionResponse>
  /**
   * Check if the message is signed in the smart contract
   * @param safeAddress The Safe address
   * @param message The message to be signed
   * @returns A boolean indicating if the message is signed
   */
  isMessageSigned(safeAddress: string, message: string): Promise<boolean>
  /**
   * Check if the message is pending (multi owner or not executed) using the Transaction Service
   * @param safeAddress The Safe address
   * @param message The message to be signed
   * @returns A boolean indicating if the message is signed
   */
  isSignMessagePending(safeAddress: string, message: string): Promise<boolean>
  /**
   * Sign a message using the Safe SDK
   * @param safeAddress The Safe address
   * @param message The message to be signed
   */
  signMessage(safeAddress: string, message: string): Promise<SafeMultisigTransactionResponse>
  /**
   * Get the corresponding Monerium SDK Chain from the current chain id
   * @returns The Chain
   */
  getChain(): Promise<Chain>
  /**
   * Get the corresponding Monerium SDK Network from the current chain id
   * @returns The Network
   */
  getNetwork(): Promise<Networks>
}
