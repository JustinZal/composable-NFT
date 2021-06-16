pragma solidity 0.7.6;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyComposableNFT is ERC721("MyComposable", "MYC") {

    mapping(uint256 => mapping(address => uint256)) private tokenBalances;

    event ReceivedERC20(
        address indexed _from,
        uint256 indexed _toTokenId,
        address indexed _erc20Contract,
        uint256 _value
    );

    event TransferERC20(
        uint256 indexed _fromTokenId,
        address indexed _to,
        address indexed _erc20Contract,
        uint256 _value
    );

    function mint(address _recipient, uint256 _tokenId) external {
        _mint(_recipient, _tokenId);
    }

    function balanceOfERC20(uint256 _tokenId, address _erc20Contract) external view returns(uint256 tokenBalance) {
        tokenBalance = tokenBalances[_tokenId][_erc20Contract];
    }

    function getERC20(address _from, uint256 _tokenId, address _erc20Contract, uint256 _value) external {
        IERC20 token = IERC20(_erc20Contract);
        uint256 allowance = token.allowance(_from, address(this));

        require(allowance >= _value, 'Token allowance not sufficient!');
        require(msg.sender == _from);

        token.transferFrom(_from, address(this), _value);
        tokenBalances[_tokenId][_erc20Contract] += _value;

        emit ReceivedERC20(_from, _tokenId, _erc20Contract, _value);
    }

//    function tokenFallback(address _from, uint256 _value, bytes _data) external;
//    function transferERC20(uint256 _tokenId, address _to, address _erc20Contract, uint256 _value) external;
//    function transferERC223(uint256 _tokenId, address _to, address _erc223Contract, uint256 _value, bytes _data) external;

}
