// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ChocomintRegistry.sol";
import "./ChocomintUtils.sol";

abstract contract ChocomintWallet is ERC721, ChocomintUtils {
  mapping(uint256 => uint256) public balances;

  event Depositted(address indexed operator, uint256 indexed tokenId, uint256 amount);
  event Withdrawed(address indexed operator, uint256 indexed tokenId, uint256 amount);

  address private chocomintRegistry;
  address private chocomintMinter;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function initialize(address _chocomintRegistry, address _chocomintMinter) public {
    require(
      chocomintRegistry == address(0x0) || chocomintMinter == address(0x0),
      "contract is already initialized"
    );
    chocomintRegistry = _chocomintRegistry;
    chocomintMinter = _chocomintMinter;
  }

  function deposit(uint256 _tokenId) public payable {
    balances[_tokenId] += msg.value;
    emit Depositted(msg.sender, _tokenId, msg.value);
  }

  function withdraw(uint256 _tokenId) public {
    require(msg.sender == ownerOf(_tokenId), "msg sender must be nft owner");
    uint256 reward = balances[_tokenId];
    require(reward > 0, "reward must be more than 0");
    balances[_tokenId] = 0;
    payable(msg.sender).transfer(reward);
    emit Withdrawed(msg.sender, _tokenId, reward);
  }

  function mint(address _to, uint256 _tokenId) public {
    require(msg.sender == chocomintMinter, "msg sender is not chocomint minter");
    _mint(_to, _tokenId);
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    require(_exists(_tokenId), "token must exist");
    bytes32 hash = ChocomintRegistry(chocomintRegistry).ipfsHashes(_tokenId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
