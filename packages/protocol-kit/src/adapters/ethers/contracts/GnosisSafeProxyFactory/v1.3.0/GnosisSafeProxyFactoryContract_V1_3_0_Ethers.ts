import { Proxy_factory as ProxyFactory } from '@safe-global/protocol-kit/typechain/src/ethers-v6/v1.3.0/Proxy_factory'
import GnosisSafeProxyFactoryEthersContract from '../GnosisSafeProxyFactoryEthersContract'

class GnosisSafeProxyFactoryContract_V1_3_0_Ethers extends GnosisSafeProxyFactoryEthersContract {
  constructor(public contract: ProxyFactory) {
    super(contract)
  }
}

export default GnosisSafeProxyFactoryContract_V1_3_0_Ethers
