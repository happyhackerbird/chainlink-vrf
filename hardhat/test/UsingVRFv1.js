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
                await expect(contract.startGame(3, gameFee)).to.emit(contract, "GameStarted").withArgs(1, 3, gameFee);
            });
        });

        describe("JoinGame", function () {
            it("should join the game", async function () {
                await expect(contract.connect(addr1).joinGame({ value: gameFee })).to.emit(contract, "PlayerJoined").withArgs(1, addr1.address);
                await expect(contract.connect(addr2).joinGame({ value: gameFee })).to.emit(contract, "PlayerJoined").withArgs(1, addr2.address);
            });
        });

        describe("EndGame", function () {
            it("should end game & randomly determine a winner", async function () {
                describe("ContractFunded", function () {
                    it("contract should have enough LINK token", async function () {
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
                    it("should end the game when last player joins", async function () {
                        const last_join = await contract.joinGame({ value: gameFee }); // this will throw an error
                        // cannot estimate gas; transaction may fail or may require manual gas limit 
                        // from a call trying to revert
                        // solution: put gasLimit: 3e7 or allowUnlimitedContractSize: true in config
                        receipt = await last_join.wait();
                    });
                    it("emit a GameEnded event that declares a winning address", async function () {
                        for (const event of receipt.events) {
                            console.log(`Event ${event.event} with args ${event.args}`);
                        }
                        // let winner_address = 
                        console.log(receipt.events?.filter((x) => { return x.event == "GameEnded" }));
                        // console.log("winner is", winner_address);
                    });
                    // it("should transfer funds to winner", async function () {
                    // });
                });
            });
        });
    });
});