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
var _StripePack_config, _StripePack_element, _StripePack_client, _StripePack_onRampSession
Object.defineProperty(exports, '__esModule', { value: true })
exports.StripePack = void 0
const crypto_1 = require('@stripe/crypto')
const errors_1 = require('../../lib/errors')
const OnRampKitBasePack_1 = require('../../OnRampKitBasePack')
const stripeApi = __importStar(require('./stripeApi'))
/**
 * This class extends the OnRampKitBasePack to work with the Stripe platform
 * @class StripePack
 */
class StripePack extends OnRampKitBasePack_1.OnRampKitBasePack {
  /**
   * Initialize the StripePack
   * @constructor
   * @param config The configuration object for the Stripe provider. Ideally we will put here things like api keys, secrets, urls, etc.
   */
  constructor(config) {
    super()
    _StripePack_config.set(this, void 0)
    _StripePack_element.set(this, void 0)
    _StripePack_client.set(this, void 0)
    _StripePack_onRampSession.set(this, void 0)
    __classPrivateFieldSet(this, _StripePack_config, config, 'f')
  }
  /**
   * This method loads the Stripe JS files and initializes the StripeOnRamp object
   */
  async init() {
    try {
      __classPrivateFieldSet(
        this,
        _StripePack_client,
        (await (0, crypto_1.loadStripeOnramp)(
          __classPrivateFieldGet(this, _StripePack_config, 'f').stripePublicKey
        )) || undefined,
        'f'
      )
    } catch (e) {
      throw new Error((0, errors_1.getErrorMessage)(e))
    }
  }
  /**
   * This method open the onramp widget with the provided Stripe options
   * @param options The options to open the onramp widget
   */
  async open({ element, theme = 'light', sessionId, defaultOptions }) {
    if (!__classPrivateFieldGet(this, _StripePack_client, 'f'))
      throw new Error('The Stripe crypto SDK is not initialized')
    try {
      let session
      if (sessionId) {
        session = await stripeApi.getSession(
          __classPrivateFieldGet(this, _StripePack_config, 'f').onRampBackendUrl,
          sessionId
        )
      } else {
        session = await stripeApi.createSession(
          __classPrivateFieldGet(this, _StripePack_config, 'f').onRampBackendUrl,
          defaultOptions
        )
      }
      const onRampSession = __classPrivateFieldGet(this, _StripePack_client, 'f').createSession({
        clientSecret: session.client_secret,
        appearance: {
          theme: theme
        }
      })
      __classPrivateFieldSet(this, _StripePack_onRampSession, onRampSession, 'f')
      __classPrivateFieldSet(this, _StripePack_element, element, 'f')
      onRampSession.mount(element)
      return session
    } catch (e) {
      throw new Error((0, errors_1.getErrorMessage)(e))
    }
  }
  /**
   * This method close the onramp widget
   */
  async close() {
    throw new Error('Method not implemented.')
  }
  /**
   * Subscribe to an event
   * @param event The Stripe event to subscribe or '*' to subscribe to all events
   * @param handler The callback to execute when the event is triggered
   */
  subscribe(event, handler) {
    __classPrivateFieldGet(this, _StripePack_onRampSession, 'f')?.addEventListener(event, handler)
  }
  /**
   * Unsubscribe from an event
   * @param event The Stripe event to unsubscribe or '*' to unsubscribe from all events
   * @param handler The callback to remove from the event
   */
  unsubscribe(event, handler) {
    __classPrivateFieldGet(this, _StripePack_onRampSession, 'f')?.removeEventListener(
      event,
      handler
    )
  }
}
exports.StripePack = StripePack
;(_StripePack_config = new WeakMap()),
  (_StripePack_element = new WeakMap()),
  (_StripePack_client = new WeakMap()),
  (_StripePack_onRampSession = new WeakMap())
//# sourceMappingURL=StripePack.js.map
