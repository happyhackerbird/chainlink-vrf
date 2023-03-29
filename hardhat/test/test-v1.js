const { expect, assert } = require("chai");
// const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { FEE, VRF_COORDINATOR_V1, LINK_TOKEN_GOERLI, KEY_HASH_V1 } = require("../constants");


describe("TestVRFv1", function () {
    it("should start the game and join it", async function () {
        const UsingVRFv1 = await ethers.getContractFactory("UsingVRFv1");
        const UsingVRFv1Contract = await UsingVRFv1.deploy(
            VRF_COORDINATOR_V1,
            LINK_TOKEN_GOERLI,
            KEY_HASH_V1,
            FEE
        );

        await UsingVRFv1Contract.deployed();
    });

    describe("JoinGame", function () {
        it("should join the game", async function () {
            await UsingVRFv1Contract.joinGame({ value: ethers.utils.parseEther("0.1") });
        });
    });

    describe("EndGame", function () {
        it("should end game & determine a winner", async function () {
            // const UsingVRFv1 = await ethers.getContractFactory("UsingVRFv1");
            // const UsingVRFv1Contract = await UsingVRFv1.deploy(
            //     VRF_COORDINATOR_V1,
            //     LINK_TOKEN_GOERLI,
            //     KEY_HASH_V1,
            //     FEE
            // );

            // await UsingVRFv1Contract.deployed();
            // await UsingVRFv1Contract.startGame(2, ethers.utils.parseEther("0.1"));
            await UsingVRFv1Contract.joinGame({ value: ethers.utils.parseEther("0.1") });

        });
    });
});
