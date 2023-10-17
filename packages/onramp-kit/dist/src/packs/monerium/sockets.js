'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.connectToOrderNotifications = void 0
const connectToOrderNotifications = ({ profile, accessToken, env, subscriptions }) => {
  const baseUrl = env === 'production' ? 'wss://api.monerium.app' : 'wss://api.monerium.dev'
  const socketUrl = `${baseUrl}/profiles/${profile}/orders?access_token=${accessToken}`
  const socket = new WebSocket(socketUrl)
  socket.addEventListener('open', () => {
    console.info(`Socket connected: ${socketUrl}`)
  })
  socket.addEventListener('error', (event) => {
    console.error(event)
    throw new Error(`Socket error: ${socketUrl}`)
  })
  socket.addEventListener('message', (event) => {
    const notification = JSON.parse(event.data)
    subscriptions.get(notification.meta.state)?.(notification)
  })
  socket.addEventListener('close', () => {
    console.info(`Socket connection closed: ${socketUrl}`)
  })
  return socket
}
exports.connectToOrderNotifications = connectToOrderNotifications
//# sourceMappingURL=sockets.js.map
