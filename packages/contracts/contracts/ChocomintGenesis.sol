// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ChocomintRegistry.sol";
import "./ChocomintUtils.sol";

contract ChocomintGenesis is ERC721, ChocomintUtils {
  address public chocomintRegistry;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function initialize(address _chocomintRegistry) public {
    require(
      _chocomintRegistry == address(0x0),
      "ChocomintGenesis: contract is already initialized"
    );
    chocomintRegistry = _chocomintRegistry;
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "ChocomintGenesis: token must exist");
    bytes32 hash = ChocomintRegistry(chocomintRegistry).metadata(tokenId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
