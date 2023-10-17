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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const sdk_1 = require('@monerium/sdk')
const protocol_kit_1 = __importDefault(require('@safe-global/protocol-kit'))
const MoneriumPack_1 = require('./MoneriumPack')
const safeMoneriumClient = __importStar(require('./SafeMoneriumClient'))
const sockets = __importStar(require('./sockets'))
const OnRampKitBasePack_1 = require('../../OnRampKitBasePack')
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    ...window.location,
    replace: jest.fn()
  }
})
Object.defineProperty(safeMoneriumClient.SafeMoneriumClient.prototype, 'bearerProfile', {
  get: jest.fn(() => ({
    access_token: 'access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'refresh-token',
    profile: 'profile',
    userId: 'userId'
  }))
})
const config = {
  clientId: 'monerium-client-id',
  environment: 'sandbox'
}
const REDIRECT_URL = 'http://localhost:3000'
jest.mock('./sockets.ts')
jest.mock('@monerium/sdk')
jest.mock('@safe-global/protocol-kit')
jest.mock('./SafeMoneriumClient')
describe('MoneriumPack', () => {
  let moneriumPack
  beforeEach(() => {
    jest.clearAllMocks()
    moneriumPack = new MoneriumPack_1.MoneriumPack(config)
  })
  describe('init()', () => {
    it('should create a MoneriumPack instance', () => {
      expect(moneriumPack).toBeInstanceOf(MoneriumPack_1.MoneriumPack)
      expect(moneriumPack).toBeInstanceOf(OnRampKitBasePack_1.OnRampKitBasePack)
    })
    it('should initialize the pack', async () => {
      const safeSdk = new protocol_kit_1.default()
      await moneriumPack.init({ safeSdk })
      expect(safeMoneriumClient.SafeMoneriumClient).toHaveBeenCalledWith('sandbox', safeSdk)
    })
    it('should throw an exception if no instance of the protocol kit is passed as parameter', async () => {
      // @ts-expect-error - Throw and exception
      await expect(moneriumPack.init()).rejects.toThrowError(
        'You need to provide an instance of the protocol kit'
      )
    })
  })
  describe('open()', () => {
    beforeEach(async () => {
      const safeSdk = new protocol_kit_1.default()
      await moneriumPack.init({ safeSdk })
    })
    it('should start the authorization code flow if the authCode is provided', async () => {
      const getAuthSpy = jest.spyOn(safeMoneriumClient.SafeMoneriumClient.prototype, 'auth')
      await moneriumPack.open({ redirectUrl: REDIRECT_URL, authCode: 'auth-code' })
      expect(getAuthSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'monerium-client-id',
          code: 'auth-code',
          code_verifier: '',
          redirect_uri: REDIRECT_URL
        })
      )
    })
    it('should start the refresh token flow if the refreshToken is provided', async () => {
      const getAuthSpy = jest.spyOn(safeMoneriumClient.SafeMoneriumClient.prototype, 'auth')
      await moneriumPack.open({
        redirectUrl: REDIRECT_URL,
        refreshToken: 'refresh-token'
      })
      expect(getAuthSpy).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: 'monerium-client-id', refresh_token: 'refresh-token' })
      )
    })
    it('should start the Login with Monerium flow when no authCode or refreshToken are provided', async () => {
      const getAuthFlowSpy = jest.spyOn(
        safeMoneriumClient.SafeMoneriumClient.prototype,
        'getAuthFlowURI'
      )
      await moneriumPack.open({
        redirectUrl: REDIRECT_URL
      })
      expect(getAuthFlowSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'monerium-client-id',
          redirect_uri: REDIRECT_URL,
          signature: '0x'
        })
      )
    })
    it('should check if the message is in the pending safe transactions queue when not signed', async () => {
      jest
        .spyOn(safeMoneriumClient.SafeMoneriumClient.prototype, 'isMessageSigned')
        .mockResolvedValue(false)
      jest
        .spyOn(safeMoneriumClient.SafeMoneriumClient.prototype, 'getSafeAddress')
        .mockResolvedValue('0xSafeAddress')
      const isMessagePendingSpy = jest.spyOn(
        safeMoneriumClient.SafeMoneriumClient.prototype,
        'isSignMessagePending'
      )
      await moneriumPack.open({
        redirectUrl: REDIRECT_URL
      })
      expect(isMessagePendingSpy).toHaveBeenCalledWith(
        '0xSafeAddress',
        'I hereby declare that I am the address owner.'
      )
    })
  })
  describe('subscribe() / unsubscribe()', () => {
    it('should try to subscribe to order notifications after authentication finished and subscriptions placed', async () => {
      const safeSdk = new protocol_kit_1.default()
      await moneriumPack.init({ safeSdk })
      const socket = { close: jest.fn() }
      // @ts-expect-error - Mocking the socket
      jest.spyOn(sockets, 'connectToOrderNotifications').mockReturnValue(socket)
      moneriumPack.subscribe(sdk_1.OrderState.placed, jest.fn())
      moneriumPack.subscribe(sdk_1.OrderState.processed, jest.fn())
      await moneriumPack.open({
        redirectUrl: REDIRECT_URL
      })
      expect(sockets.connectToOrderNotifications).toHaveBeenCalledWith({
        accessToken: 'access-token',
        profile: 'profile',
        env: 'sandbox',
        subscriptions: new Map([
          [sdk_1.OrderState.placed, expect.any(Function)],
          [sdk_1.OrderState.processed, expect.any(Function)]
        ])
      })
      moneriumPack.unsubscribe(sdk_1.OrderState.placed)
      moneriumPack.unsubscribe(sdk_1.OrderState.processed)
      expect(socket.close).toHaveBeenCalled()
    })
  })
  describe('close()', () => {
    it('should remove the codeVerifier from the storage', async () => {
      const localStorageSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem')
      const safeSdk = new protocol_kit_1.default()
      await moneriumPack.init({ safeSdk })
      await moneriumPack.close()
      expect(localStorageSpy).toHaveBeenCalledWith('OnRampKit__monerium_code_verifier')
    })
  })
})
//# sourceMappingURL=MoneriumPack.test.js.map
