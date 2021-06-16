pragma solidity 0.7.6;

// SPDX-License-Identifier: MIT

import "./MyComposableNFT.sol";

contract MockedERC223 {
    function transfer(address _from, uint256 _value, bytes calldata _data, address NFT) public {
        MyComposableNFT(NFT).tokenFallback(_from, _value, _data);
    }
}
