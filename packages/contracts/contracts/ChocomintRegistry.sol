// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./ChocomintWallet.sol";
import "./ChocomintUtils.sol";

contract ChocomintRegistry is ChocomintUtils {
  using ECDSA for bytes32;

  event Published(
    bytes32 hash,
    bytes32 indexed ipfsHash,
    address indexed creator,
    address indexed publisher,
    bytes signature,
    uint256 registeredAt,
    uint256 tokenId
  );

  mapping(uint256 => bytes32) public ipfsHashes;

  address private chocomintCreator;
  address private chocomintMinter;

  function initialize(address _chocomintCreator, address _chocomintMinter) public {
    require(
      chocomintCreator == address(0x0) && chocomintMinter == address(0x0),
      "contract is already initialized"
    );
    chocomintCreator = _chocomintCreator;
    chocomintMinter = _chocomintMinter;
  }

  // TODO: I want to implement ERC712 but need to check torus interface
  // TODO: add function to speficy minter
  function publish(
    bytes32 _ipfsHash,
    address payable _creator,
    bytes memory _signature
  ) public payable {
    require(_ipfsHash != "", "ipfs hash should not be empty");
    bytes32 hash = keccak256(abi.encodePacked(_getChainId(), address(this), _ipfsHash, _creator));
    uint256 tokenId = uint256(hash);
    require(ipfsHashes[tokenId] == "", "token is already minted");
    require(
      hash.toEthSignedMessageHash().recover(_signature) == _creator,
      "creator signature must be valid"
    );
    ChocomintWallet(chocomintCreator).mint(_creator, tokenId);
    ChocomintWallet(chocomintMinter).mint(msg.sender, tokenId);
    ipfsHashes[tokenId] = _ipfsHash;
    emit Published(hash, _ipfsHash, _creator, msg.sender, _signature, block.timestamp, tokenId);
  }
}
