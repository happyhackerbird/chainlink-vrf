# Chainlink VRF (tbc)

Simple game with Chainlink VRF (currently VRF v1).
### Setup

```
git clone https://github.com/technocolour/chainlink-vrf.git
cd chainlink-vrf/hardhat
npm install
```

Fund your account with test funds and create an .env file in the directory like 
```
QUICKNODE_HTTP_URL="add api-key url here"
PRIVATE_KEY="add private key here with test ether and link"
ETHERSCAN_KEY="etherscan key needed for contract verification"
```

### Testing
Then to run all tests: 
```
npx hardhat test
```
This will run them on a hardhat goerli fork. Note: Because it's local the randomness request will never get fulfilled by the oracle and there's no callback. The test will wait to no avail. You could instead test this with a MockVRFCoordinator that mocks the oracle response. [See.](https://github.com/smartcontractkit/hardhat-starter-kit/blob/main/test/unit/RandomNumberConsumer.spec.js)

To run the tests on goerli testnet:
    
```
npx hardhat test --network goerli
```
The last test should, after a short while, show successful oracle response in the console.

### Deploy
```
npx hardhat run scripts/deploy.js --network goerli
```
Will deploy to goerli and verify the contract on etherscan.

### Todo
- [] Use VRF V2
- [] Test by implementing MockVRFCoordinator.sol
- [] Write the scaffold eth challenge tutorial for V2

### Writeup for scaffold eth challenge tutorial: 

#### Using randomness with Chainlink VRF V2
[ChainlinkVRF](https://chain.link/vrf) allows you to integrate randomness into your smart contract that you can verify cryptographically. How to do this using V2: 

Your contract has to inherit from ```VRFV2WrapperConsumerBase.sol``` ([Link to Interface](https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol)). To request the randomness, your contract will call ```requestRandomness``` in  ```VRFV2WrapperConsumerBase``` with the following parameters: 
- _callbackGasLimit is the gas limit that should be used when calling back to your contract.
- _requestConfirmations is the number of block confirmations to wait before fulfilling the request
- _numWords is the number of random words to request.

This will first try to estimate the total cost of transaction for fulfilling the request. There are two additional contracts in the background, ```VRFV2Wrapper``` and ```VRFCoordinatorV2```. It will fund the wrapper contract with LINK which will trigger it to request randomness from the coordinator. 


Chainlink VRF will fulfill the request and validate the randomness before returning it to your contract in a callback to the ```fulfillRandomWords()``` functions. 

To fund your request, you can use a subscription or direct funding method. Here we will directly fund our contract with LINK. 
