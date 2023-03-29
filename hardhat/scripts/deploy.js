const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { FEE, VRF_COORDINATOR_V1, LINK_TOKEN_GOERLI, KEY_HASH_V1 } = require("../constants");

async function main() {
  const UsingVRFv1 = await ethers.getContractFactory("UsingVRFv1");
  const UsingVRFv1Contract = await UsingVRFv1.deploy(
    VRF_COORDINATOR_V1,
    LINK_TOKEN_GOERLI,
    KEY_HASH_V1,
    FEE
  );

  await UsingVRFv1Contract.deployed();
  console.log(
    "Contract Address:",
    UsingVRFv1Contract.address
  );

  await sleep(30000);

  await hre.run("verify:verify", {
    address: UsingVRFv1Contract.address,
    constructorArguments: [VRF_COORDINATOR_V1, LINK_TOKEN_GOERLI, KEY_HASH_V1, FEE],
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
