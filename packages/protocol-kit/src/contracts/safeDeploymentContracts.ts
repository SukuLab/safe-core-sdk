import { ContractNetworkConfig } from '@safe-global/protocol-kit/types'
import {
  CompatibilityFallbackHandlerContract,
  CreateCallContract,
  EthAdapter,
  GnosisSafeContract,
  GnosisSafeProxyFactoryContract,
  MultiSendCallOnlyContract,
  MultiSendContract,
  SafeVersion,
  SignMessageLibContract
} from '@safe-global/safe-core-sdk-types'
import {
  DeploymentFilter,
  SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
  getCreateCallDeployment,
  getMultiSendCallOnlyDeployment,
  getMultiSendDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
  getSignMessageLibDeployment
} from '@safe-global/safe-deployments'
import { safeDeploymentsL1ChainIds, safeDeploymentsVersions } from './config'

interface GetContractInstanceProps {
  ethAdapter: EthAdapter
  safeVersion: SafeVersion
  customContracts?: ContractNetworkConfig
}

interface GetSafeContractInstanceProps extends GetContractInstanceProps {
  isL1SafeMasterCopy?: boolean
  customSafeAddress?: string
}

export function getSafeContractDeployment(
  safeVersion: SafeVersion,
  chainId: number,
  isL1SafeMasterCopy = false
): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].safeMasterCopyVersion
  const filters: DeploymentFilter = { version, network: chainId.toString(), released: true }
  if (safeDeploymentsL1ChainIds.includes(chainId) || isL1SafeMasterCopy) {
    return getSafeSingletonDeployment(filters)
  }
  return getSafeL2SingletonDeployment(filters)
}

export function getCompatibilityFallbackHandlerContractDeployment(
  safeVersion: SafeVersion,
  chainId: number
): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].compatibilityFallbackHandler
  return getCompatibilityFallbackHandlerDeployment({
    version,
    network: chainId.toString(),
    released: true
  })
}

export function getMultiSendCallOnlyContractDeployment(
  safeVersion: SafeVersion,
  chainId: number
): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].multiSendCallOnlyVersion
  return getMultiSendCallOnlyDeployment({ version, network: chainId.toString(), released: true })
}

export function getMultiSendContractDeployment(
  safeVersion: SafeVersion,
  chainId: number
): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].multiSendVersion
  return getMultiSendDeployment({ version, network: chainId.toString(), released: true })
}

export function getSafeProxyFactoryContractDeployment(
  safeVersion: SafeVersion,
  chainId: number
): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].safeProxyFactoryVersion
  return getProxyFactoryDeployment({ version, network: chainId.toString(), released: true })
}

export function getSignMessageLibContractDeployment(
  safeVersion: SafeVersion,
  chainId: number
): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].signMessageLibVersion
  return getSignMessageLibDeployment({ version, network: chainId.toString(), released: true })
}

export function getCreateCallContractDeployment(
  safeVersion: SafeVersion,
  chainId: number
): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].createCallVersion
  return getCreateCallDeployment({ version, network: chainId.toString(), released: true })
}

export async function getSafeContract({
  ethAdapter,
  safeVersion,
  customSafeAddress,
  isL1SafeMasterCopy,
  customContracts
}: GetSafeContractInstanceProps): Promise<GnosisSafeContract> {
  const chainId = await ethAdapter.getChainId()
  const singletonDeployment = getSafeContractDeployment(safeVersion, chainId, isL1SafeMasterCopy)
  const gnosisSafeContract = await ethAdapter.getSafeContract({
    safeVersion,
    singletonDeployment,
    customContractAddress: customSafeAddress ?? customContracts?.safeMasterCopyAddress,
    customContractAbi: customContracts?.safeMasterCopyAbi
  })
  const isContractDeployed = await ethAdapter.isContractDeployed(await gnosisSafeContract.getAddress())
  if (!isContractDeployed) {
    throw new Error('SafeProxy contract is not deployed on the current network')
  }
  return gnosisSafeContract
}

export async function getProxyFactoryContract({
  ethAdapter,
  safeVersion,
  customContracts
}: GetContractInstanceProps): Promise<GnosisSafeProxyFactoryContract> {
  const chainId = await ethAdapter.getChainId()
  const proxyFactoryDeployment = getSafeProxyFactoryContractDeployment(safeVersion, chainId)
  const safeProxyFactoryContract = await ethAdapter.getSafeProxyFactoryContract({
    safeVersion,
    singletonDeployment: proxyFactoryDeployment,
    customContractAddress: customContracts?.safeProxyFactoryAddress,
    customContractAbi: customContracts?.safeProxyFactoryAbi
  })
  const isContractDeployed = await ethAdapter.isContractDeployed(
    await safeProxyFactoryContract.getAddress()
  )
  if (!isContractDeployed) {
    throw new Error('SafeProxyFactory contract is not deployed on the current network')
  }
  return safeProxyFactoryContract
}

export async function getCompatibilityFallbackHandlerContract({
  ethAdapter,
  safeVersion,
  customContracts
}: GetContractInstanceProps): Promise<CompatibilityFallbackHandlerContract> {
  const chainId = await ethAdapter.getChainId()
  const fallbackHandlerDeployment = getCompatibilityFallbackHandlerContractDeployment(
    safeVersion,
    chainId
  )
  const fallbackHandlerContract = await ethAdapter.getCompatibilityFallbackHandlerContract({
    safeVersion,
    singletonDeployment: fallbackHandlerDeployment,
    customContractAddress: customContracts?.fallbackHandlerAddress,
    customContractAbi: customContracts?.fallbackHandlerAbi
  })
  const isContractDeployed = await ethAdapter.isContractDeployed(
    await fallbackHandlerContract.getAddress()
  )
  if (!isContractDeployed) {
    throw new Error('CompatibilityFallbackHandler contract is not deployed on the current network')
  }
  return fallbackHandlerContract
}

export async function getMultiSendContract({
  ethAdapter,
  safeVersion,
  customContracts
}: GetContractInstanceProps): Promise<MultiSendContract> {
  const chainId = await ethAdapter.getChainId()
  const multiSendDeployment = getMultiSendContractDeployment(safeVersion, chainId)
  const multiSendContract = await ethAdapter.getMultiSendContract({
    safeVersion,
    singletonDeployment: multiSendDeployment,
    customContractAddress: customContracts?.multiSendAddress,
    customContractAbi: customContracts?.multiSendAbi
  })
  const isContractDeployed = await ethAdapter.isContractDeployed(await multiSendContract.getAddress())
  if (!isContractDeployed) {
    throw new Error('MultiSend contract is not deployed on the current network')
  }
  return multiSendContract
}

export async function getMultiSendCallOnlyContract({
  ethAdapter,
  safeVersion,
  customContracts
}: GetContractInstanceProps): Promise<MultiSendCallOnlyContract> {
  const chainId = await ethAdapter.getChainId()
  const multiSendCallOnlyDeployment = getMultiSendCallOnlyContractDeployment(safeVersion, chainId)
  const multiSendCallOnlyContract = await ethAdapter.getMultiSendCallOnlyContract({
    safeVersion,
    singletonDeployment: multiSendCallOnlyDeployment,
    customContractAddress: customContracts?.multiSendCallOnlyAddress,
    customContractAbi: customContracts?.multiSendCallOnlyAbi
  })
  const isContractDeployed = await ethAdapter.isContractDeployed(
    await multiSendCallOnlyContract.getAddress()
  )
  if (!isContractDeployed) {
    throw new Error('MultiSendCallOnly contract is not deployed on the current network')
  }
  return multiSendCallOnlyContract
}

export async function getSignMessageLibContract({
  ethAdapter,
  safeVersion,
  customContracts
}: GetContractInstanceProps): Promise<SignMessageLibContract> {
  const chainId = await ethAdapter.getChainId()
  const signMessageLibDeployment = getSignMessageLibContractDeployment(safeVersion, chainId)
  const signMessageLibContract = await ethAdapter.getSignMessageLibContract({
    safeVersion,
    singletonDeployment: signMessageLibDeployment,
    customContractAddress: customContracts?.signMessageLibAddress,
    customContractAbi: customContracts?.signMessageLibAbi
  })
  const isContractDeployed = await ethAdapter.isContractDeployed(
    await signMessageLibContract.getAddress()
  )
  if (!isContractDeployed) {
    throw new Error('SignMessageLib contract is not deployed on the current network')
  }
  return signMessageLibContract
}

export async function getCreateCallContract({
  ethAdapter,
  safeVersion,
  customContracts
}: GetContractInstanceProps): Promise<CreateCallContract> {
  const chainId = await ethAdapter.getChainId()
  const createCallDeployment = getCreateCallContractDeployment(safeVersion, chainId)
  const createCallContract = await ethAdapter.getCreateCallContract({
    safeVersion,
    singletonDeployment: createCallDeployment,
    customContractAddress: customContracts?.createCallAddress,
    customContractAbi: customContracts?.createCallAbi
  })
  const isContractDeployed = await ethAdapter.isContractDeployed(await createCallContract.getAddress())
  if (!isContractDeployed) {
    throw new Error('CreateCall contract is not deployed on the current network')
  }
  return createCallContract
}
