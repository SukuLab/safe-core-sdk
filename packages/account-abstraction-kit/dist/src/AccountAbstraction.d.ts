import { AccountAbstractionConfig } from './types'
import { RelayPack } from '@safe-global/relay-kit'
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types'
import { ethers } from 'ethers'
declare class AccountAbstraction {
  #private
  constructor(signer: ethers.Signer)
  init(options: AccountAbstractionConfig): Promise<void>
  setRelayPack(relayPack: RelayPack): void
  getSignerAddress(): Promise<string>
  getNonce(): Promise<number>
  getSafeAddress(): Promise<string>
  isSafeDeployed(): Promise<boolean>
  relayTransaction(
    transactions: MetaTransactionData[],
    options?: MetaTransactionOptions
  ): Promise<string>
}
export default AccountAbstraction
