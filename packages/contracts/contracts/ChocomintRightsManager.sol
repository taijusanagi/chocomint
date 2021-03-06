// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ChocomintRightsManager is ERC721 {
  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  address private minterAddress;

  function initialize(address _minterAddress) public {
    require(
      minterAddress == address(0x0),
      "ChocomintRightsManager: contract is already initialized"
    );
    minterAddress = _minterAddress;
  }

  function mint(address _to, uint256 _tokenId) public {
    require(msg.sender == minterAddress, "ChocomintRightsManager: msg sender is not minter");
    _mint(_to, _tokenId);
  }
}
