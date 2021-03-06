// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

// created by Taiju Sanagi (taijusanagi.eth)

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ChocomintGenesis.sol";
import "./ChocomintGovernance.sol";

contract ChocomintMembership is ERC721, ChocomintUtils {
  address private chocomintGenesisAddress;
  address private chocomintGovernanceAddress;

  uint256 public constant MEMBERSHIP_CHANGE_PRICE = 1830000000000000000000;
  bytes32 public constant metadataIpfsHash =
    0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89;

  uint256 totalSupply;
  mapping(address => bool) genesisParticipationClaimed;

  function claim() public {
    ChocomintGenesis chocomintGenesis = ChocomintGenesis(chocomintGenesisAddress);
    ChocomintGovernance chocomintGovernance = ChocomintGovernance(chocomintGovernanceAddress);
    if (!chocomintGenesis.participated(msg.sender) || genesisParticipationClaimed[msg.sender]) {
      chocomintGovernance.transferFrom(msg.sender, address(this), MEMBERSHIP_CHANGE_PRICE);
    }
    totalSupply++;
    _mint(msg.sender, totalSupply);
  }

  function tokenURI(uint256 tokenId) public view returns (string memory) {
    require(_exists(tokenId), "ChocomintMembership: token must exist");
    return
      string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(metadataIpfsHash))));
  }
}
