'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const signatures_1 = require('../signatures')
class EthSafeTransaction {
  constructor(data) {
    this.signatures = new Map()
    this.data = data
  }
  addSignature(signature) {
    this.signatures.set(signature.signer.toLowerCase(), signature)
  }
  encodedSignatures() {
    return (0, signatures_1.buildSignature)(Array.from(this.signatures.values()))
  }
}
exports.default = EthSafeTransaction
//# sourceMappingURL=SafeTransaction.js.map
