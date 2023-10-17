import { ExternalProvider } from '@ethersproject/providers'
export type AuthKitEthereumProvider = ExternalProvider
export type AuthKitSignInData = {
  eoa: string
  safes?: string[]
}
