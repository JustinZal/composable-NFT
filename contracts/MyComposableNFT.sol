pragma solidity 0.7.6;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

interface IERC223 {
    function transfer(address to, uint value, bytes memory data) external returns (bool success);
}

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
        require(msg.sender == _from, 'Unauthorized transfer!');

        IERC20 token = IERC20(_erc20Contract);
        uint256 allowance = token.allowance(_from, address(this));

        require(allowance >= _value, 'Token allowance not sufficient!');
        require(token.transferFrom(_from, address(this), _value), 'Transfer from failed!');

        tokenBalances[_tokenId][_erc20Contract] += _value;
        emit ReceivedERC20(_from, _tokenId, _erc20Contract, _value);
    }

    function transferERC20(uint256 _tokenId, address _to, address _erc20Contract, uint256 _value) external {
        require(ownerOf(_tokenId) == msg.sender, 'Unauthorized transfer!');
        require(tokenBalances[_tokenId][_erc20Contract] >= _value, 'Insufficient balance!');

        require(IERC20(_erc20Contract).transfer(_to, _value), 'ERC20 transaction failed');

        tokenBalances[_tokenId][_erc20Contract] -= _value;
        emit TransferERC20(_tokenId, _to, _erc20Contract, _value);
    }

    function transferERC223(uint256 _tokenId, address _to, address _erc223Contract, uint256 _value, bytes calldata _data) external {
        require(ownerOf(_tokenId) == msg.sender, 'Unauthorized transfer!');
        require(tokenBalances[_tokenId][_erc223Contract] >= _value, 'Insufficient balance!');

        require(IERC223(_erc223Contract).transfer(_to, _value, _data), 'ERC223 transaction failed');
        tokenBalances[_tokenId][_erc223Contract] -= _value;
        emit TransferERC20(_tokenId, _to, _erc223Contract, _value);
    }

    function tokenFallback(address _from, uint256 _value, bytes calldata _data) external {
        address token = msg.sender;

        require(Address.isContract(token), 'tokenFallBack should be called from a contract!');
        require(_data.length > 0, 'Data field empty! (should encode tokenId)');

        uint256 tokenId = _bytesToTokenId(_data);
        tokenBalances[tokenId][token] += _value;

        emit ReceivedERC20(_from, tokenId, token, _value);
    }

    function _bytesToTokenId(bytes calldata _data) internal pure returns(uint256 tokenId) {
        assembly {
            tokenId := calldataload(132)
        }

        if (_data.length < 32) {
            tokenId = tokenId >> 256 - _data.length * 8;
        }
    }
}
