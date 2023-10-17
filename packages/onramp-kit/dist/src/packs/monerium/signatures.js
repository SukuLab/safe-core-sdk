'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.MAGIC_VALUE_BYTES =
  exports.MAGIC_VALUE =
  exports.EIP_1271_INTERFACE =
  exports.EIP_1271_BYTES_INTERFACE =
    void 0
const abi_1 = require('@ethersproject/abi')
// EIP-1271 magic values (https://eips.ethereum.org/EIPS/eip-1271)
// The four-byte code is defined as follows:
// - 0x00000000 if the signature is invalid.
// - 0x20c13b0b if the signature is valid and was produced using the eth_sign method.
// - 0x1626ba7e if the signature is valid and was produced using the personal_sign method.
// More info: https://docs.safe.global/safe-core-protocol/signatures/eip-1271
const MAGIC_VALUE = '0x1626ba7e'
exports.MAGIC_VALUE = MAGIC_VALUE
const MAGIC_VALUE_BYTES = '0x20c13b0b'
exports.MAGIC_VALUE_BYTES = MAGIC_VALUE_BYTES
const EIP_1271_INTERFACE = new abi_1.Interface([
  'function isValidSignature(bytes32 _dataHash, bytes calldata _signature) external view'
])
exports.EIP_1271_INTERFACE = EIP_1271_INTERFACE
const EIP_1271_BYTES_INTERFACE = new abi_1.Interface([
  'function isValidSignature(bytes calldata _data, bytes calldata _signature) public view'
])
exports.EIP_1271_BYTES_INTERFACE = EIP_1271_BYTES_INTERFACE
//# sourceMappingURL=signatures.js.map
