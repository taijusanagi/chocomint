// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ChocomintCreator is ERC721, Ownable {
  string public constant name = "ChocomintCreator";
  string public constant symbol = "CMC";
  uint256 totalSupply;

  function mint(address _to) public onlyOwner returns (uint256) {
    totalSupply++;
    _mint(_to, totalSupply);
    return totalSupply;
  }
}
