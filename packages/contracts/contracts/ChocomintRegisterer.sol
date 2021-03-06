// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ChocomintRegisterer is ERC721, Ownable {
  string public constant name = "ChocomintRegisterer";
  string public constant symbol = "CMR";
  uint256 totalSupply;

  function mint(address _to) public onlyOwner returns (uint256) {
    totalSupply++;
    _mint(_to, totalSupply);
    return totalSupply;
  }
}
