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
Object.defineProperty(exports, '__esModule', { value: true })
const bignumber_1 = require('@ethersproject/bignumber')
const protocol_kit_1 = __importStar(require('@safe-global/protocol-kit'))
const safe_core_sdk_types_1 = require('@safe-global/safe-core-sdk-types')
const constants_1 = require('../../constants')
const GelatoRelayPack_1 = require('./GelatoRelayPack')
var TaskState
;(function (TaskState) {
  TaskState['CheckPending'] = 'CheckPending'
})(TaskState || (TaskState = {}))
const CHAIN_ID = 1
const ADDRESS = '0x...address'
const GAS_TOKEN = '0x...gasToken'
const SAFE_ADDRESS = '0x...safe-address'
const API_KEY = 'api-key'
const FEE_ESTIMATION = bignumber_1.BigNumber.from(100000)
const BASEGAS_ESTIMATION = '20000'
const SAFETXGAS_ESTIMATION = '10000'
const SAFE_DEPLOYMENT_GAS_ESTIMATION = '30000'
const TASK_ID = 'task-id'
const TASK_STATUS = {
  chainId: CHAIN_ID,
  taskState: TaskState.CheckPending,
  taskId: TASK_ID,
  creationDate: Date.now().toString()
}
const RELAY_RESPONSE = {
  taskId: TASK_ID
}
const SAFE_TRANSACTION = {
  data: {
    operation: safe_core_sdk_types_1.OperationType.Call,
    safeTxGas: '0',
    baseGas: '0',
    gasPrice: '0',
    nonce: 0,
    gasToken: '0x',
    refundReceiver: '0x',
    to: ADDRESS,
    value: '0',
    data: '0x'
  }
}
const mockGetEstimateFee = jest.fn().mockResolvedValue(FEE_ESTIMATION)
const mockGetTaskStatus = jest.fn().mockResolvedValue(TASK_STATUS)
const mockSponsoredCall = jest.fn().mockResolvedValue(RELAY_RESPONSE)
const mockCallWithSyncFee = jest.fn().mockResolvedValue(RELAY_RESPONSE)
jest.mock('@gelatonetwork/relay-sdk', () => {
  return {
    GelatoRelay: jest.fn().mockImplementation(() => {
      return {
        getEstimatedFee: mockGetEstimateFee,
        getTaskStatus: mockGetTaskStatus,
        sponsoredCall: mockSponsoredCall,
        callWithSyncFee: mockCallWithSyncFee
      }
    })
  }
})
jest.mock('@safe-global/protocol-kit')
// Cast the import to jest.Mocked type
const mockEstimateTxBaseGas = protocol_kit_1.estimateTxBaseGas
const mockEstimateSafeTxGas = protocol_kit_1.estimateSafeTxGas
const mockEstimateSafeDeploymentGas = protocol_kit_1.estimateSafeDeploymentGas
const mockCreateERC20TokenTransferTransaction = protocol_kit_1.createERC20TokenTransferTransaction
const mockedIsGasTokenCompatibleWithHandlePayment =
  protocol_kit_1.isGasTokenCompatibleWithHandlePayment
jest.doMock('@safe-global/protocol-kit', () => ({
  ...jest.requireActual('@safe-global/protocol-kit'),
  estimateTxBaseGas: mockEstimateTxBaseGas,
  estimateSafeTxGas: mockEstimateSafeTxGas,
  estimateSafeDeploymentGas: mockEstimateSafeDeploymentGas,
  createERC20TokenTransferTransaction: mockCreateERC20TokenTransferTransaction,
  isGasTokenCompatibleWithHandlePayment: mockedIsGasTokenCompatibleWithHandlePayment
}))
const gelatoRelayPack = new GelatoRelayPack_1.GelatoRelayPack(API_KEY)
describe('GelatoRelayPack', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEstimateTxBaseGas.mockResolvedValue(Promise.resolve(BASEGAS_ESTIMATION))
    mockEstimateSafeTxGas.mockResolvedValue(Promise.resolve(SAFETXGAS_ESTIMATION))
    mockEstimateSafeDeploymentGas.mockResolvedValue(Promise.resolve(SAFE_DEPLOYMENT_GAS_ESTIMATION))
  })
  it('should allow to get a fee estimation', async () => {
    const chainId = 1
    const gasLimit = '100000'
    const gasToken = '0x0000000000000000000000000000000000000000'
    const estimation = await gelatoRelayPack.getEstimateFee(chainId, gasLimit, gasToken)
    expect(estimation).toBe(FEE_ESTIMATION.toString())
    expect(mockGetEstimateFee).toHaveBeenCalledWith(
      chainId,
      constants_1.GELATO_NATIVE_TOKEN_ADDRESS,
      bignumber_1.BigNumber.from(gasLimit),
      false
    )
    expect(bignumber_1.BigNumber.from(estimation).gt(bignumber_1.BigNumber.from(0))).toBe(true)
  })
  it('should allow to check the task status', async () => {
    const taskId = 'task-id'
    const status = await gelatoRelayPack.getTaskStatus(taskId)
    expect(status).toBe(TASK_STATUS)
    expect(mockGetTaskStatus).toHaveBeenCalledWith('task-id')
  })
  it('should allow to make a sponsored transaction', async () => {
    const response = await gelatoRelayPack.sendSponsorTransaction(SAFE_ADDRESS, '0x', CHAIN_ID)
    expect(response).toBe(RELAY_RESPONSE)
    expect(mockSponsoredCall).toHaveBeenCalledWith(
      {
        chainId: CHAIN_ID,
        target: SAFE_ADDRESS,
        data: '0x'
      },
      API_KEY
    )
  })
  it('should throw an error when trying to do a sponsored transaction without an api key', async () => {
    const relayPack = new GelatoRelayPack_1.GelatoRelayPack()
    await expect(
      relayPack.sendSponsorTransaction(SAFE_ADDRESS, '0x', CHAIN_ID)
    ).rejects.toThrowError('API key not defined')
  })
  describe('when creating a relayed transaction', () => {
    describe('When gas limit is manually defined', () => {
      let relayPack
      const safe = new protocol_kit_1.default()
      const transactions = [
        {
          to: ADDRESS,
          data: '0x',
          value: '0'
        }
      ]
      const options = {
        gasLimit: '100',
        isSponsored: true
      }
      beforeEach(() => {
        jest.clearAllMocks()
        relayPack = new GelatoRelayPack_1.GelatoRelayPack()
        safe.getNonce = jest.fn().mockResolvedValue(0)
        safe.getContractManager = jest.fn().mockReturnValue({ safeContract: {} })
        safe.createTransaction = jest.fn().mockResolvedValue(SAFE_TRANSACTION)
        mockedIsGasTokenCompatibleWithHandlePayment.mockResolvedValue(Promise.resolve(true))
      })
      it('should allow you to create a sponsored one', async () => {
        await relayPack.createRelayedTransaction({ safe, transactions, options })
        expect(safe.createTransaction).toHaveBeenCalledWith({
          safeTransactionData: transactions,
          onlyCalls: false,
          options: {
            nonce: 0
          }
        })
      })
      it('should allow to create a sync fee one', async () => {
        await relayPack.createRelayedTransaction({
          safe,
          transactions,
          options: { ...options, isSponsored: false }
        })
        expect(safe.createTransaction).toHaveBeenCalledWith({
          safeTransactionData: transactions,
          onlyCalls: false,
          options: {
            baseGas: FEE_ESTIMATION.toString(),
            safeTxGas: SAFETXGAS_ESTIMATION,
            gasPrice: '1',
            gasToken: constants_1.ZERO_ADDRESS,
            refundReceiver: constants_1.GELATO_FEE_COLLECTOR,
            nonce: 0
          }
        })
      })
      it('should return the correct gasToken when being sent through the options', async () => {
        await relayPack.createRelayedTransaction({
          safe,
          transactions,
          options: { ...options, isSponsored: false, gasToken: GAS_TOKEN }
        })
        expect(safe.createTransaction).toHaveBeenCalledWith({
          safeTransactionData: transactions,
          onlyCalls: false,
          options: {
            baseGas: FEE_ESTIMATION.toString(),
            safeTxGas: SAFETXGAS_ESTIMATION,
            gasPrice: '1',
            gasToken: GAS_TOKEN,
            refundReceiver: constants_1.GELATO_FEE_COLLECTOR,
            nonce: 0
          }
        })
      })
      it('should allow you to create relay transaction using a non standard ERC20 gas token to pay Gelato fees', async () => {
        // non standard ERC20 like USDC
        mockedIsGasTokenCompatibleWithHandlePayment.mockResolvedValue(Promise.resolve(false))
        const options = {
          gasToken: GAS_TOKEN,
          isSponsored: false,
          gasLimit: '5000' // manual gas limit
        }
        const transferToGelato = {
          to: constants_1.GELATO_FEE_COLLECTOR,
          value: FEE_ESTIMATION.toString(),
          data: '0x'
        }
        mockCreateERC20TokenTransferTransaction.mockReturnValue(transferToGelato)
        await relayPack.createRelayedTransaction({ safe, transactions, options })
        expect(safe.createTransaction).toHaveBeenCalledWith({
          safeTransactionData: [...transactions, transferToGelato],
          onlyCalls: false,
          options: {
            gasToken: GAS_TOKEN,
            nonce: 0
          }
        })
      })
    })
    describe('When gas limit is automatically estimate', () => {
      let relayPack
      const safe = new protocol_kit_1.default()
      const mockTransferTransacton = {
        to: ADDRESS,
        data: '0x',
        value: '0'
      }
      const transactions = [mockTransferTransacton]
      beforeEach(() => {
        jest.clearAllMocks()
        relayPack = new GelatoRelayPack_1.GelatoRelayPack()
        safe.getNonce = jest.fn().mockResolvedValue(0)
        safe.getContractManager = jest.fn().mockReturnValue({ safeContract: {} })
        safe.createTransaction = jest.fn().mockResolvedValue(SAFE_TRANSACTION)
        mockedIsGasTokenCompatibleWithHandlePayment.mockResolvedValue(Promise.resolve(true))
      })
      it('should allow you to create a sponsored one', async () => {
        const options = {
          isSponsored: true
        }
        await relayPack.createRelayedTransaction({ safe, transactions, options })
        expect(safe.createTransaction).toHaveBeenCalledWith({
          safeTransactionData: transactions,
          onlyCalls: false,
          options: {
            nonce: 0
          }
        })
      })
      describe('When a compatible gas token is used', () => {
        beforeEach(() => {
          jest.clearAllMocks()
          mockedIsGasTokenCompatibleWithHandlePayment.mockResolvedValue(Promise.resolve(true))
        })
        it('should allow you to create relay transaction using the native token to pay Gelato fees', async () => {
          await relayPack.createRelayedTransaction({ safe, transactions })
          expect(safe.createTransaction).toHaveBeenCalledWith({
            safeTransactionData: transactions,
            onlyCalls: false,
            options: {
              baseGas: FEE_ESTIMATION.toString(),
              gasPrice: '1',
              safeTxGas: SAFETXGAS_ESTIMATION,
              gasToken: constants_1.ZERO_ADDRESS,
              refundReceiver: constants_1.GELATO_FEE_COLLECTOR,
              nonce: 0
            }
          })
        })
        it('should allow you to create relay transaction using a compatible ERC20 token to pay Gelato fees', async () => {
          const options = {
            gasToken: GAS_TOKEN
          }
          await relayPack.createRelayedTransaction({ safe, transactions, options })
          expect(safe.createTransaction).toHaveBeenCalledWith({
            safeTransactionData: transactions,
            onlyCalls: false,
            options: {
              baseGas: FEE_ESTIMATION.toString(),
              gasPrice: '1',
              safeTxGas: SAFETXGAS_ESTIMATION,
              gasToken: GAS_TOKEN,
              refundReceiver: constants_1.GELATO_FEE_COLLECTOR,
              nonce: 0
            }
          })
        })
      })
      describe('When a non compatible gas token is used', () => {
        beforeEach(() => {
          jest.clearAllMocks()
          mockedIsGasTokenCompatibleWithHandlePayment.mockResolvedValue(Promise.resolve(false))
        })
        it('should allow you to create relay transaction using a non standard ERC20 gas token to pay Gelato fees', async () => {
          const options = {
            gasToken: GAS_TOKEN
          }
          const transferToGelato = {
            to: constants_1.GELATO_FEE_COLLECTOR,
            value: FEE_ESTIMATION.toString(),
            data: '0x'
          }
          mockCreateERC20TokenTransferTransaction.mockReturnValue(transferToGelato)
          await relayPack.createRelayedTransaction({ safe, transactions, options })
          expect(safe.createTransaction).toHaveBeenCalledWith({
            safeTransactionData: [...transactions, transferToGelato],
            onlyCalls: false,
            options: {
              gasToken: GAS_TOKEN,
              nonce: 0
            }
          })
        })
      })
    })
  })
  it('should allow to make a sync fee transaction', async () => {
    const response = await gelatoRelayPack.sendSyncTransaction(SAFE_ADDRESS, '0x', CHAIN_ID, {
      gasLimit: '100000'
    })
    expect(response).toBe(RELAY_RESPONSE)
    expect(mockCallWithSyncFee).toHaveBeenCalledWith(
      {
        chainId: CHAIN_ID,
        target: SAFE_ADDRESS,
        data: '0x',
        feeToken: constants_1.GELATO_NATIVE_TOKEN_ADDRESS,
        isRelayContext: false
      },
      {
        gasLimit: '100000'
      }
    )
  })
  it('should expose a relayTransaction doing a sponsored or sync fee transaction depending on an optional parameter', async () => {
    const sponsoredResponse = await gelatoRelayPack.relayTransaction({
      target: SAFE_ADDRESS,
      encodedTransaction: '0x',
      chainId: CHAIN_ID,
      options: {
        gasLimit: '100000',
        isSponsored: true
      }
    })
    expect(sponsoredResponse).toBe(RELAY_RESPONSE)
    expect(mockSponsoredCall).toHaveBeenCalledWith(
      {
        chainId: CHAIN_ID,
        target: SAFE_ADDRESS,
        data: '0x'
      },
      API_KEY
    )
    const paidResponse = await gelatoRelayPack.relayTransaction({
      target: SAFE_ADDRESS,
      encodedTransaction: '0x',
      chainId: CHAIN_ID,
      options: {
        gasLimit: '100000',
        isSponsored: false
      }
    })
    expect(paidResponse).toBe(RELAY_RESPONSE)
    expect(mockCallWithSyncFee).toHaveBeenCalledWith(
      {
        chainId: CHAIN_ID,
        target: SAFE_ADDRESS,
        data: '0x',
        feeToken: constants_1.GELATO_NATIVE_TOKEN_ADDRESS,
        isRelayContext: false
      },
      {
        gasLimit: '100000'
      }
    )
  })
  it('should allow to retrieve the fee collector address', () => {
    expect(gelatoRelayPack.getFeeCollector()).toBe(constants_1.GELATO_FEE_COLLECTOR)
  })
  describe('executeRelayTransaction', () => {
    const safe = new protocol_kit_1.default()
    const ENCODED_TRANSACTION_DATA = '0x...txData'
    const MULTISEND_ADDRESS = '0x...multiSendAddress'
    const SAFE_DEPLOYMENT_BATCH = {
      to: MULTISEND_ADDRESS,
      value: '0',
      data: '0x...deplymentBachData'
    }
    beforeEach(() => {
      jest.clearAllMocks()
      safe.isSafeDeployed = jest.fn().mockResolvedValue(true)
      safe.getChainId = jest.fn().mockResolvedValue(CHAIN_ID)
      safe.getAddress = jest.fn().mockResolvedValue(SAFE_ADDRESS)
      safe.getEncodedTransaction = jest.fn().mockResolvedValue(ENCODED_TRANSACTION_DATA)
      safe.wrapSafeTransactionIntoDeploymentBatch = jest
        .fn()
        .mockResolvedValue(SAFE_DEPLOYMENT_BATCH)
    })
    describe('when the Safe is already deployed', () => {
      it('should execute a sponsored relay transaction', async () => {
        const options = {
          isSponsored: true
        }
        const relayTransaction = {
          data: {
            nonce: 0,
            to: ADDRESS,
            value: '0',
            data: '0x'
          }
        }
        const gelatoResponse = await gelatoRelayPack.executeRelayTransaction(
          relayTransaction,
          safe,
          options
        )
        expect(gelatoResponse).toBe(RELAY_RESPONSE)
        expect(mockSponsoredCall).toHaveBeenCalledWith(
          {
            chainId: CHAIN_ID,
            target: SAFE_ADDRESS,
            data: ENCODED_TRANSACTION_DATA
          },
          API_KEY
        )
        // no counterfactual deployment present
        expect(safe.wrapSafeTransactionIntoDeploymentBatch).not.toHaveBeenCalled()
      })
      it('should execute a sync relay transaction', async () => {
        const relayTransaction = {
          data: {
            operation: safe_core_sdk_types_1.OperationType.Call,
            safeTxGas: SAFETXGAS_ESTIMATION,
            baseGas: FEE_ESTIMATION.toString(),
            gasPrice: '1',
            nonce: 0,
            gasToken: GAS_TOKEN,
            refundReceiver: constants_1.GELATO_FEE_COLLECTOR,
            to: ADDRESS,
            value: '0',
            data: '0x'
          }
        }
        const gelatoResponse = await gelatoRelayPack.executeRelayTransaction(relayTransaction, safe)
        expect(gelatoResponse).toBe(RELAY_RESPONSE)
        expect(mockCallWithSyncFee).toHaveBeenCalledWith(
          {
            chainId: CHAIN_ID,
            target: SAFE_ADDRESS,
            data: ENCODED_TRANSACTION_DATA,
            feeToken: GAS_TOKEN,
            isRelayContext: false
          },
          { gasLimit: undefined }
        )
        // no counterfactual deployment present
        expect(safe.wrapSafeTransactionIntoDeploymentBatch).not.toHaveBeenCalled()
      })
    })
    describe('when the Safe is not deployed (counterfactual deployment)', () => {
      it('should execute a sponsored relay transaction & counterfactual deployment', async () => {
        // Safe is not deployed
        safe.isSafeDeployed = jest.fn().mockResolvedValue(false)
        const options = {
          isSponsored: true
        }
        const relayTransaction = {
          data: {
            nonce: 0,
            to: ADDRESS,
            value: '0',
            data: '0x'
          }
        }
        const gelatoResponse = await gelatoRelayPack.executeRelayTransaction(
          relayTransaction,
          safe,
          options
        )
        expect(gelatoResponse).toBe(RELAY_RESPONSE)
        expect(mockSponsoredCall).toHaveBeenCalledWith(
          {
            chainId: CHAIN_ID,
            target: MULTISEND_ADDRESS,
            data: SAFE_DEPLOYMENT_BATCH.data
          },
          API_KEY
        )
        // counterfactual deployment in present
        expect(safe.wrapSafeTransactionIntoDeploymentBatch).toHaveBeenCalled()
      })
      it('should execute a sync relay transaction & counterfactual deployment', async () => {
        // Safe is not deployed
        safe.isSafeDeployed = jest.fn().mockResolvedValue(false)
        const relayTransaction = {
          data: {
            operation: safe_core_sdk_types_1.OperationType.Call,
            safeTxGas: SAFETXGAS_ESTIMATION,
            baseGas: FEE_ESTIMATION.toString(),
            gasPrice: '1',
            nonce: 0,
            gasToken: GAS_TOKEN,
            refundReceiver: constants_1.GELATO_FEE_COLLECTOR,
            to: ADDRESS,
            value: '0',
            data: '0x'
          }
        }
        const gelatoResponse = await gelatoRelayPack.executeRelayTransaction(relayTransaction, safe)
        expect(gelatoResponse).toBe(RELAY_RESPONSE)
        expect(mockCallWithSyncFee).toHaveBeenCalledWith(
          {
            chainId: CHAIN_ID,
            target: MULTISEND_ADDRESS,
            data: SAFE_DEPLOYMENT_BATCH.data,
            feeToken: GAS_TOKEN,
            isRelayContext: false
          },
          { gasLimit: undefined }
        )
        // counterfactual deployment in present
        expect(safe.wrapSafeTransactionIntoDeploymentBatch).toHaveBeenCalled()
      })
    })
  })
})
//# sourceMappingURL=GelatoRelayPack.test.js.map
