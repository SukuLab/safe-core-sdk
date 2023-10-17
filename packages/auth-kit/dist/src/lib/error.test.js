'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const errors_1 = require('./errors')
describe('errors', () => {
  describe('getErrorMessage()', () => {
    it('should return the message if it is an Error object with a message', () => {
      expect((0, errors_1.getErrorMessage)(new Error('error message'))).toBe('error message')
    })
    it('should return the message if it is an error with a message', () => {
      expect((0, errors_1.getErrorMessage)({ message: 'object with error message' })).toBe(
        'object with error message'
      )
    })
    it('should return the stringified error if it is any object', () => {
      expect((0, errors_1.getErrorMessage)({ anError: 'object with error message' })).toBe(
        '{"anError":"object with error message"}'
      )
    })
    it('should return an Error if it is a string', () => {
      expect((0, errors_1.getErrorMessage)('error message')).toBe('"error message"')
    })
  })
})
//# sourceMappingURL=error.test.js.map
