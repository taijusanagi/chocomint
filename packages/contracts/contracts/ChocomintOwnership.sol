// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// @openzeppelin/contracts@4.0.0-rc.0
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./ChocomintPublisher.sol";
import "./ChocomintUtils.sol";

contract ChocomintOwnership is ERC721, ChocomintUtils {
  mapping(uint256 => uint256) public balances;

  address payable public chocomintPublisher;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function initialize(address payable _chocomintPublisher) public {
    require(chocomintPublisher == address(0x0), "contract is already initialized");
    chocomintPublisher = _chocomintPublisher;
  }

  function mint(address _to, uint256 _tokenId) public {
    require(msg.sender == chocomintPublisher, "msg sender is not chocomint publisher");
    _mint(_to, _tokenId);
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    require(_exists(_tokenId), "token must exist");
    bytes32 hash = ChocomintPublisher(chocomintPublisher).ipfsHashes(_tokenId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
