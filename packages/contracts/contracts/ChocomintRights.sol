// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ChocomintRegistry.sol";
import "./ChocomintUtils.sol";
import "./ChocomintWallet.sol";

contract ChocomintRights is ERC721, ChocomintWallet, ChocomintUtils {
  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  address public registry;
  address private minter;

  function initialize(address _registry, address _minter) public {
    require(registry == address(0x0) || minter == address(0x0), "contract is already initialized");
    registry = _registry;
    minter = _minter;
  }

  function mint(address _to, uint256 _nftId) public {
    require(msg.sender == minter, "msg sender is not minter");
    _mint(_to, _nftId);
  }

  function tokenURI(uint256 _nftId) public view override returns (string memory) {
    require(_exists(_nftId), "token must exist");
    bytes32 hash = ChocomintRegistry(registry).ipfsHashes(_nftId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
