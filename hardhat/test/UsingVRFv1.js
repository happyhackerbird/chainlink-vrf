const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { FEE, VRF_COORDINATOR_V1, LINK_TOKEN_GOERLI, KEY_HASH_V1, LINK_ABI } = require("../constants");


describe("TestVRFv1", function () {
    // const provider = ethers.getDefaultProvider("goerli", {
    //     quicknode: process.env.QUICKNODE_HTTP_URL,
    // });

    const gameFee = ethers.utils.parseUnits("10", "wei");
    let contract;

    it("should deploy the contract", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const UsingVRFv1 = await ethers.getContractFactory("UsingVRFv1");
        contract = await UsingVRFv1.deploy(
            VRF_COORDINATOR_V1,
            LINK_TOKEN_GOERLI,
            KEY_HASH_V1,
            FEE
        );


        describe("StartGame", function () {
            it("should start the game", async function () {
                await contract.startGame(3, gameFee);
            });
        });

        describe("JoinGame", function () {

            it("should join the game", async function () {

                await contract.connect(addr1).joinGame({ value: gameFee });
                await contract.connect(addr2).joinGame({ value: gameFee });

            });
        });

        describe("EndGame", function () {
            it("should end game & randomly determine a winner", async function () {
                // fund contract with LINK
                let sender = owner;
                let receiver = contract.address;
                // get the LINK token at the specified address on goerli
                const linkToken = await ethers.getContractAt(LINK_ABI, LINK_TOKEN_GOERLI);
                // const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
                // const linkToken = new ethers.Contract(LINK_TOKEN_GOERLI, abi, signer);
                await expect(linkToken.connect(sender).transfer(receiver, FEE)).to.changeTokenBalance(
                    linkToken,
                    sender,
                    -FEE
                );
                const contractLinkBalance = await linkToken.balanceOf(receiver);
                console.log(`Balance of contract: ${ethers.utils.formatUnits(contractLinkBalance, "ether")}`);

                // finish the game
                const last_join = await contract.joinGame({ value: gameFee }); // this will throw an error
                // cannot estimate gas; transaction may fail or may require manual gas limit 
                // from a call trying to revert
                // solution: put gasLimit: 3e7 or allowUnlimitedContractSize: true in config

                describe("CheckWinnerFunds", function () {
                    it("get winner and check that funds have been transferred to them", async function () {
                        const receipt = await last_join.wait();
                        for (const event of receipt.events) {
                            console.log(`Event ${event.event} with args ${event.args}`);
                        }
                        let winner_address = receipt.events[0].args.winner;
                        console.log("winner is", winner_address);
                    });
                });
            });
        });
    });
});
