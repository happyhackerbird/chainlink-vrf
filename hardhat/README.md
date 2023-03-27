# Chainlink VRF 

Writeup for scaffold eth challenge tutorial: 

### Using randomness with Chainlink VRF V2
[ChainlinkVRF](https://chain.link/vrf) allows you to integrate randomness into your smart contract that you can verify cryptographically. How to do this using V2: 

Your contract has to inherit from ```VRFV2WrapperConsumerBase.sol``` ([Link to Interface](https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol)). To request the randomness, your contract will call ```requestRandomness``` in  ```VRFV2WrapperConsumerBase``` with the following parameters: 
- _callbackGasLimit is the gas limit that should be used when calling back to your contract.
- _requestConfirmations is the number of block confirmations to wait before fulfilling the request
- _numWords is the number of random words to request.

This will first try to estimate the total cost of transaction for fulfilling the request. There are two additional contracts in the background, ```VRFV2Wrapper``` and ```VRFCoordinatorV2```. It will fund the wrapper contract with LINK which will trigger it to request randomness from the coordinator. 


Chainlink VRF will fulfill the request and validate the randomness before returning it to your contract in a callback to the ```fulfillRandomWords()``` functions. 

To fund your request, you can use a subscription or direct funding method. Here we will directly fund our contract with LINK. 