// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./ChocomintCurve.sol";
import "./ChocomintUtils.sol";
import "hardhat/console.sol";

contract ChocomintGenesis is ChocomintPriceCurve, ChocomintUtils {
  using ECDSA for bytes32;

  uint256 constant MAX_SUPPLY_LIMIT = 256;

  mapping(bytes32 => bytes32) public seedToIpfsHash;
  mapping(bytes32 => address) public seedToCreatorAddress;
  mapping(bytes32 => address) public seedToMinterAddress;
  mapping(address => bool) public participated;

  function vote(
    bytes32 _ipfsHash,
    address payable _creatorAddress,
    bytes memory _creatorSignature
  ) public payable {
    bytes32 seed =
      keccak256(abi.encodePacked(_getChainId(), address(this), _ipfsHash, _creatorAddress));

    // register seed
    if (seedToIpfsHash[seed] != "" || seedToCreatorAddress[seed] != address(0x0)) {
      require(
        seed.toEthSignedMessageHash().recover(_creatorSignature) == _creatorAddress,
        "ChocomintGenesis: creator signature must be valid for seed"
      );
      seedToIpfsHash[seed] = _ipfsHash;
      seedToCreatorAddress[seed] = _creatorAddress;
    }

    _updateEligibleSeeds(seed);
  }
  // uint256 price = getPrintPrice(leastEligiblePoll);
  // require(getPrintPrice(leastEligiblePoll), )
  //   seedToPoll[seed] = leastEligiblePoll;

  //   if (!participated[msg.sender]) {
  //     participated[msg.sender] = true;
  //   }
  // }

  // // ranking -> tokenId
  // function mint(bytes32 seed) public {
  //   address payable creatorAddress = seedToCreatorAddress[seed];
  //   address payable bidderAddress = seedToMinterAddress[seed];
  //   totalSupply = totalSupply++;
  //   uint256 tokenId = totalSupply;
  //   _mint(bidderAddress, tokenId);
  //   uint256 price = bidIdToCurrentPrice[bidId];
  //   uint256 ownerCut = getOwnerCut(price);
  //   uint256 creatorReward = price.sub(ownerCut);
  //   tokenIdToBidId[tokenId] = bidId;
  //   creatorAddress.transfer(creatorReward);
  // }

  // function tokenURI(uint256 tokenId) public view returns (string memory) {
  //   require(_exists(tokenId), "token must exist");
  //   uint256 bidId = tokenIdToBidId[tokenId];
  //   return
  //     string(
  //       _addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(bidIdToIpfsHash[bidId])))
  //     );
  // }
}
