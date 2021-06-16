pragma solidity 0.7.6;

// SPDX-License-Identifier: MIT

import "./MyComposableNFT.sol";

contract MockedERC223 {
    address private NFT;

    constructor(address _NFT) {
        NFT = _NFT;
    }

    event Transfer(
        address to,
        address from,
        uint value,
        bytes data
    );

    function notifyTransfer(address _from, uint256 _value, bytes calldata _data) public {
        MyComposableNFT(NFT).tokenFallback(_from, _value, _data);
    }

    function transfer(address to, uint value, bytes memory data) external returns (bool success) {
        success = true;
        emit Transfer(to, msg.sender, value, data);
    }
}
