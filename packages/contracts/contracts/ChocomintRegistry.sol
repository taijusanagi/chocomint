// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ChocomintWallet.sol";
import "./ChocomintUtils.sol";

contract ChocomintRegistry is ChocomintUtils {
  using ECDSA for bytes32;

  event Registered(
    bytes32 hash,
    bytes32 indexed ipfsHash,
    address indexed creator,
    address indexed registerer,
    bytes signature,
    uint256 registeredAt,
    uint256 tokenId
  );

  mapping(uint256 => bytes32) public ipfsHashes;

  address private chocomintCreator;
  address private chocomintRegisterer;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdTracker;

  function initialize(address _chocomintCreator, address _chocomintRegisterer) public {
    require(
      chocomintCreator == address(0x0) && chocomintRegisterer == address(0x0),
      "contract is already initialized"
    );
    chocomintCreator = _chocomintCreator;
    chocomintRegisterer = _chocomintRegisterer;
  }

  function register(
    bytes32 _ipfsHash,
    address payable _creator,
    bytes memory _signature
  ) public payable {
    require(_ipfsHash != "", "ipfs hash should not be empty");
    bytes32 hash = keccak256(abi.encodePacked(_getChainId(), address(this), _ipfsHash, _creator));
    require(
      hash.toEthSignedMessageHash().recover(_signature) == _creator,
      "creator signature must be valid"
    );
    _tokenIdTracker.increment();
    uint256 tokenId = _tokenIdTracker.current();
    ChocomintWallet(chocomintCreator).mint(_creator, tokenId);
    ChocomintWallet(chocomintRegisterer).mint(msg.sender, tokenId);
    ipfsHashes[tokenId] = _ipfsHash;
    emit Registered(hash, _ipfsHash, _creator, msg.sender, _signature, block.timestamp, tokenId);
  }
}