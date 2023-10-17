'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const sockets_1 = require('./sockets')
describe('Sockets', () => {
  it('should create a SafeMoneriumClient instance', () => {
    const params = {
      profile: 'profileId',
      accessToken: 'accessToken',
      env: 'sandbox',
      subscriptions: new Map()
    }
    const eventHandler = jest.fn()
    // @ts-expect-error - We don't need to mock all the properties
    jest.spyOn(window, 'WebSocket').mockReturnValue({
      addEventListener: eventHandler
    })
    ;(0, sockets_1.connectToOrderNotifications)(params)
    expect(WebSocket).toHaveBeenCalledWith(
      'wss://api.monerium.dev/profiles/profileId/orders?access_token=accessToken'
    )
    params.env = 'production'
    ;(0, sockets_1.connectToOrderNotifications)(params)
    expect(WebSocket).toHaveBeenCalledWith(
      'wss://api.monerium.app/profiles/profileId/orders?access_token=accessToken'
    )
  })
})
//# sourceMappingURL=sockets.test.js.map
