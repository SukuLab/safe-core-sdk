'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.buildSignature =
  exports.generateEIP712Signature =
  exports.generateSignature =
  exports.adjustVInSignature =
  exports.isTxHashSignedWithPrefix =
  exports.generatePreValidatedSignature =
    void 0
const ethereumjs_util_1 = require('ethereumjs-util')
const address_1 = require('../address')
const SafeSignature_1 = require('./SafeSignature')
function generatePreValidatedSignature(ownerAddress) {
  const signature =
    '0x000000000000000000000000' +
    ownerAddress.slice(2) +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '01'
  return new SafeSignature_1.EthSafeSignature(ownerAddress, signature)
}
exports.generatePreValidatedSignature = generatePreValidatedSignature
function isTxHashSignedWithPrefix(txHash, signature, ownerAddress) {
  let hasPrefix
  try {
    const rsvSig = {
      r: Buffer.from(signature.slice(2, 66), 'hex'),
      s: Buffer.from(signature.slice(66, 130), 'hex'),
      v: parseInt(signature.slice(130, 132), 16)
    }
    const recoveredData = (0, ethereumjs_util_1.ecrecover)(
      Buffer.from(txHash.slice(2), 'hex'),
      rsvSig.v,
      rsvSig.r,
      rsvSig.s
    )
    const recoveredAddress = (0, ethereumjs_util_1.bufferToHex)(
      (0, ethereumjs_util_1.pubToAddress)(recoveredData)
    )
    hasPrefix = !(0, address_1.sameString)(recoveredAddress, ownerAddress)
  } catch (e) {
    hasPrefix = true
  }
  return hasPrefix
}
exports.isTxHashSignedWithPrefix = isTxHashSignedWithPrefix
const adjustVInSignature = (signingMethod, signature, safeTxHash, signerAddress) => {
  const ETHEREUM_V_VALUES = [0, 1, 27, 28]
  const MIN_VALID_V_VALUE_FOR_SAFE_ECDSA = 27
  let signatureV = parseInt(signature.slice(-2), 16)
  if (!ETHEREUM_V_VALUES.includes(signatureV)) {
    throw new Error('Invalid signature')
  }
  if (signingMethod === 'eth_sign') {
    /*
          The Safe's expected V value for ECDSA signature is:
          - 27 or 28
          - 31 or 32 if the message was signed with a EIP-191 prefix. Should be calculated as ECDSA V value + 4
          Some wallets do that, some wallets don't, V > 30 is used by contracts to differentiate between
          prefixed and non-prefixed messages. The only way to know if the message was signed with a
          prefix is to check if the signer address is the same as the recovered address.
    
          More info:
          https://docs.safe.global/safe-core-protocol/signatures
        */
    if (signatureV < MIN_VALID_V_VALUE_FOR_SAFE_ECDSA) {
      signatureV += MIN_VALID_V_VALUE_FOR_SAFE_ECDSA
    }
    const adjustedSignature = signature.slice(0, -2) + signatureV.toString(16)
    const signatureHasPrefix = isTxHashSignedWithPrefix(
      safeTxHash,
      adjustedSignature,
      signerAddress
    )
    if (signatureHasPrefix) {
      signatureV += 4
    }
  }
  if (signingMethod === 'eth_signTypedData') {
    // Metamask with ledger returns V=0/1 here too, we need to adjust it to be ethereum's valid value (27 or 28)
    if (signatureV < MIN_VALID_V_VALUE_FOR_SAFE_ECDSA) {
      signatureV += MIN_VALID_V_VALUE_FOR_SAFE_ECDSA
    }
  }
  signature = signature.slice(0, -2) + signatureV.toString(16)
  return signature
}
exports.adjustVInSignature = adjustVInSignature
async function generateSignature(ethAdapter, hash) {
  const signerAddress = await ethAdapter.getSignerAddress()
  if (!signerAddress) {
    throw new Error('EthAdapter must be initialized with a signer to use this method')
  }
  let signature = await ethAdapter.signMessage(hash)
  signature = (0, exports.adjustVInSignature)('eth_sign', signature, hash, signerAddress)
  return new SafeSignature_1.EthSafeSignature(signerAddress, signature)
}
exports.generateSignature = generateSignature
async function generateEIP712Signature(ethAdapter, safeEIP712Args, methodVersion) {
  const signerAddress = await ethAdapter.getSignerAddress()
  if (!signerAddress) {
    throw new Error('EthAdapter must be initialized with a signer to use this method')
  }
  let signature = await ethAdapter.signTypedData(safeEIP712Args, methodVersion)
  signature = (0, exports.adjustVInSignature)('eth_signTypedData', signature)
  return new SafeSignature_1.EthSafeSignature(signerAddress, signature)
}
exports.generateEIP712Signature = generateEIP712Signature
const buildSignature = (signatures) => {
  const SIGNATURE_LENGTH_BYTES = 65
  signatures.sort((left, right) =>
    left.signer.toLowerCase().localeCompare(right.signer.toLowerCase())
  )
  let signatureBytes = '0x'
  let dynamicBytes = ''
  for (const sig of signatures) {
    if (sig.isSmartContractSignature) {
      /*
              A contract signature has a static part of 65 bytes and the dynamic part that needs to be appended
              at the end of signature bytes.
              The signature format is
              Signature type == 0
              Constant part: 65 bytes
              {32-bytes signature verifier}{32-bytes dynamic data position}{1-byte signature type}
              Dynamic part (solidity bytes): 32 bytes + signature data length
              {32-bytes signature length}{bytes signature data}
            */
      const dynamicPartPosition = (
        signatures.length * SIGNATURE_LENGTH_BYTES +
        dynamicBytes.length / 2
      )
        .toString(16)
        .padStart(64, '0')
      signatureBytes += sig.staticPart(dynamicPartPosition)
      dynamicBytes += sig.dynamicPart()
    } else {
      signatureBytes += sig.data.slice(2)
    }
  }
  return signatureBytes + dynamicBytes
}
exports.buildSignature = buildSignature
//# sourceMappingURL=utils.js.map
