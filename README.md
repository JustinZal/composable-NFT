# Composable NFT (EIP 998 TOP-DOWN) implementation

This repository contains a smart contract implementation of composable NFT tokens.
The main idea behind the contract is to enable NFT tokens to accept ERC20 and ERC 223 tokens to back the underlying value of the asset.

Further details can be found here: https://eips.ethereum.org/EIPS/eip-998

## Project details

The smart contracts were written in solidity, the tests were enabled by the framework hardhat.

### Package installation

Package installation can be done with the following command:

    yarn

### Compilation
Smart contracts can be compiled with the following command:

    yarn compile

### Tests
Tests can be executed with the following command

    yarn test

## Technical details

### Smart contracts
The main smart contract is located in the file `contracts/MyComposableNFT.sol` and contains the following important functions:

* `balanceOfERC20` - fetches token balance owned by NFT 
* `getERC20` - Deposits ERC20 token via approve method
* `transferERC20` - Transfers ERC20 token outside the NFT
* `transferERC223` - Transfers ERC20 outside the NFT and complies the ERC223 standard
* `tokenFallback` - A function that notifies the contract about incomming tokens
* `_bytesToTokenId` - Utility function to convert bytes to uint256 tokenId

### Tests

The tests are located in the folder `tests/` and contains 2 test files:

* test_tokenComposition.js - Used to test the NFT - ERC20 token composition funcitonality
* test_tokenInitialization.js - Used to test NFT and ERC20 basic token functionality (minting, deploying)

The tests were executed by going through transaction flow and comparing outputs with expected outputs.

Note: ERC223 token was mocked, but the underlying functionality is still valid.