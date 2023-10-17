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
const stripeApi = __importStar(require('./stripeApi'))
const baseUrl = 'https://api.stripe.com/v1'
const config = {
  transaction_details: {
    wallet_address: '0x',
    supported_destination_currencies: ['ethereum']
  }
}
const session = {
  id: 'cos_1MhDe5KSn9ArdBimmQzf4vzc',
  object: 'crypto.onramp_session',
  client_secret: 'cos_1MhDe5KSn9ArdBimmQzf4vzc_secret_NaOoTfOKoDPCXfGVJz3KX15XO00H6ZNiTOm',
  livemode: false,
  status: 'initialized'
}
describe('stripeApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should allow to create a new session', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(session), ok: true })
      )
    const createdSession = await stripeApi.createSession(baseUrl, config)
    expect(createdSession).toEqual(session)
  })
  it('should throw an exception when the fetch call fail', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.reject('http error'), ok: false })
      )
    expect(stripeApi.createSession(baseUrl, config)).rejects.toThrowError(
      "Couldn't create a new Stripe session"
    )
  })
  it('should allow to get a new session', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(session), ok: true })
      )
    const createdSession = await stripeApi.getSession(baseUrl, 'session-id')
    expect(createdSession).toEqual(session)
  })
  it('should throw an exception when the get session call fail', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.reject('http error'), ok: false })
      )
    expect(stripeApi.getSession(baseUrl, 'session-id')).rejects.toThrowError(
      "Couldn't get the session with id  session-id"
    )
  })
})
//# sourceMappingURL=stripeApi.test.js.map
