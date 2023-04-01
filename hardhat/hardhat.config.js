require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const PRIVATE_KEY1 = process.env.PRIVATE_KEY1;
// const PRIVATE_KEY2 = process.env.PRIVATE_KEY2;

const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: QUICKNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
      timeout: 100000000,
    },
    hardhat: {
      chainId: 1337,
      forking: {
        url: QUICKNODE_HTTP_URL,
        enabled: true,
      },
    },
    // goerli_fork: {
    //   url: QUICKNODE_HTTP_URL,
    //   allowUnlimitedContractSize: true,
    //   timeout: 100000000,
    // }
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_KEY,
    }
  },
  mocha: {
    timeout: 100000000
  },

};
