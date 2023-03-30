// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "hardhat/console.sol";

contract UsingVRFv1 is VRFConsumerBase, Ownable {
    // Variables obtained by the Chainlink oracle
    // link price for a request
    uint256 public fee;
    // ID of keypair the oracle committed to
    bytes32 public keyHash;

    address[] public players;
    uint8 maxPlayers;
    bool public gameStarted;
    uint256 entryFee;
    uint256 public gameId;

    event GameStarted(uint256 gameId, uint8 maxPlayers, uint256 entryFee);
    event PlayerJoined(uint256 gameId, address player);
    event GameEnded(uint256 gameId, address winner, bytes32 requestId);

    //constructor needs to initiate the values for keyHash and fee of the VRFConsumerBase
    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 vrfKeyHash,
        uint256 vrfFee
    ) VRFConsumerBase(vrfCoordinator, linkToken) {
        keyHash = vrfKeyHash;
        fee = vrfFee;
        gameStarted = false;
        console.log("deployed with %d fee", fee);
    }

    // start game by setting appropriate variables
    function startGame(uint8 _maxPlayers, uint256 _entryFee) public onlyOwner {
        require(!gameStarted, "Already a game running");
        delete players;
        gameStarted = true;
        entryFee = _entryFee;
        maxPlayers = _maxPlayers;
        gameId++;
        emit GameStarted(gameId, maxPlayers, entryFee);
    }

    // join the game by calling the joinGame function
    function joinGame() public payable {
        require(gameStarted, "No game running");
        require(players.length < maxPlayers, "Game is full");
        require(msg.value == entryFee, "Entry fee is not correct");
        players.push(msg.sender);
        emit PlayerJoined(gameId, msg.sender);

        // if there are enough players, end the game & select a winner
        if (players.length == maxPlayers) {
            endGameAndGetWinner();
        }
    }

    function endGameAndGetWinner() private returns (bytes32 requestId) {
        // VRFConsumerBase holds an internal inteface to LINK token
        // check if our contract has enough link to pay for the request
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK to pay for request"
        );
        // function in VRFConsumerBase to request randomness
        // VRFConsumerBase internally calls VRFCoordinator to get randomness from oracle
        return requestRandomness(keyHash, fee);
    }

    // this function is called by the VRFCoordinator when it's received & validated the randomness from the oracle
    // the randomness is the actual randomness obtained from the oracle
    function fulfillRandomness(
        bytes32 requestId,
        uint256 randomness
    ) internal override {
        // determine a winner from the randomness and send ether to them
        uint256 winnerIndex = randomness % players.length;
        address winner = players[winnerIndex];
        (bool sent, ) = winner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
        gameStarted = false;

        emit GameEnded(gameId, winner, requestId);
    }
}
