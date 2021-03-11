// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// @openzeppelin/contracts@4.0.0-rc.0
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./interfaces/IChocopound.sol";
import "./utils/IPFS.sol";

contract ChocopoundOwnership is ERC721, IPFS {
  mapping(uint256 => uint256) public balances;

  address payable public chocopound;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function initialize(address payable _chocopound) public {
    require(chocopound == address(0x0), "contract is already initialized");
    chocopound = _chocopound;
  }

  function mint(address _to, uint256 _tokenId) public {
    require(msg.sender == chocopound, "msg sender is not chocomint publisher");
    _mint(_to, _tokenId);
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    require(_exists(_tokenId), "token must exist");
    bytes32 hash = IChocopound(chocopound).ipfsHashes(_tokenId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
