// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ChocomintRights.sol";
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
      "ChocomintRightsManager: contract is already initialized"
    );
    chocomintCreator = _chocomintCreator;
    chocomintRegisterer = _chocomintRegisterer;
  }

  function register(
    bytes32 _ipfsHash,
    address payable _creatorAddress,
    bytes memory _creatorSignature
  ) public payable {
    require(_ipfsHash != "", "ChocomintRegistry: ipfs hash should not be empty");
    bytes32 hash =
      keccak256(abi.encodePacked(_getChainId(), address(this), _ipfsHash, _creatorAddress));
    require(
      hash.toEthSignedMessageHash().recover(_creatorSignature) == _creatorAddress,
      "ChocomintRegistry: creator signature must be valid for seed"
    );
    _tokenIdTracker.increment();
    uint256 tokenId = _tokenIdTracker.current();
    ChocomintRights(chocomintCreator).mint(_creatorAddress, tokenId);
    ChocomintRights(chocomintRegisterer).mint(msg.sender, tokenId);
    ipfsHashes[tokenId] = _ipfsHash;
    emit Registered(
      hash,
      _ipfsHash,
      _creatorAddress,
      msg.sender,
      _creatorSignature,
      block.timestamp,
      tokenId
    );
  }
}
