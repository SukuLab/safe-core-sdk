'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.getSession = exports.createSession = void 0
const errors_1 = require('../../lib/errors')
const createSession = async (baseUrl, defaultOptions) => {
  try {
    const response = await fetch(`${baseUrl}/api/v1/onramp/stripe/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defaultOptions)
    })
    if (!response.ok) throw new Error("Couldn't create a new Stripe session")
    return response.json()
  } catch (error) {
    throw new Error((0, errors_1.getErrorMessage)(error))
  }
}
exports.createSession = createSession
const getSession = async (baseUrl, sessionId) => {
  try {
    const response = await fetch(`${baseUrl}/api/v1/onramp/stripe/session/${sessionId}`)
    if (!response.ok) throw new Error(`Couldn't get the session with id  ${sessionId}`)
    return response.json()
  } catch (error) {
    throw new Error((0, errors_1.getErrorMessage)(error))
  }
}
exports.getSession = getSession
//# sourceMappingURL=stripeApi.js.map
