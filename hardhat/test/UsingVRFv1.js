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
        const provider = ethers.provider;
        let [owner, addr1, addr2] = await ethers.getSigners(); //owner account funded with LINK token
        // if on goerli, need to get a correct signer
        addr1 = addr1 == undefined ? owner : addr1;
        addr2 = addr2 == undefined ? owner : addr2;
        // const addr1 = new ethers.Wallet("0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd", provider);
        // const addr2 = new ethers.Wallet("0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0", provider);


        const UsingVRFv1 = await ethers.getContractFactory("UsingVRFv1");
        contract = await UsingVRFv1.deploy(
            VRF_COORDINATOR_V1,
            LINK_TOKEN_GOERLI,
            KEY_HASH_V1,
            FEE
        );
        await contract.deployed();


        describe("StartGame", function () {
            it("test error: cannot join if no game running", async function () {
                await expect(contract.joinGame({ value: gameFee })).to.be.revertedWith("No game running")
            });
            it("should start the game", async function () {
                await expect(contract.startGame(3, gameFee)).to.emit(contract, "GameStarted").withArgs(1, 3, gameFee);
            });

            it("test error: cannot start a game if one is already running", async function () {
                await expect(contract.startGame(3, gameFee)).to.be.revertedWith("Already a game running");
            });
        });

        describe("JoinGame", function () {
            it("should join the game", async function () {
                await expect(contract.connect(addr1).joinGame({ value: gameFee })).to.emit(contract, "PlayerJoined").withArgs(1, addr1.address);
                await expect(contract.connect(addr2).joinGame({ value: gameFee })).to.emit(contract, "PlayerJoined").withArgs(1, addr2.address);
            });

            it("test error: cannot join with wrong entry fee", async function () {
                await expect(contract.joinGame({ value: ethers.utils.parseUnits("1", "wei") })).to.be.revertedWith("Entry fee is not correct");
            });

        });

        describe("EndGame", function () {
            it("should end game & randomly determine a winner", async function () {
                describe("ContractFunded", function () {
                    it("contract should have enough LINK token -- this might error with 'Error: Multiple transactions found in block'", async function () {
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
                    });
                });
                describe("DetermineWinner", function () {
                    let receipt;
                    it("should end the game and submit a randomness request", async function () {
                        const tx = await contract.joinGame({ value: gameFee });
                        await expect(tx).to.emit(contract, "RequestSubmitted");
                        receipt = await tx.wait();
                        console.log(receipt.events.find((x) => { return x.event == "RequestSubmitted" }));
                    });
                    it("callback from oracle should emit a GameEnded event that declares a winning address", async function () {
                        // create a listener for the GameEnded event
                        contract.on("GameEnded", (gameId, winner, request) => {
                            console.log("Winner with request is:");
                            console.log(winner, request);
                        });
                    });
                    // in between the oracle callback and submitting the request to it, it should not be possible to join the game
                    it("test error: no new players should be allowed to join after oracle request", async function () {
                        await expect(contract.connect(addr1).joinGame({ value: gameFee })).to.be.revertedWith("Game is full");
                        await sleep(120000); // wait for 2 minutes for the callback from the oracle to be received
                        // then it should print out the winner
                        // will only succeed on real testnet (not local hardhat fork)

                    });
                    // it("should transfer funds to winner", async function () {
                    // });
                });
            });
        });
    });
});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
