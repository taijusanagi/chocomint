// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract ChocomintWallet is ERC721 {
  mapping(uint256 => uint256) public nftIdToRewards;

  function deposit(uint256 _nftId) public payable {
    nftIdToRewards[_nftId] += msg.value;
  }

  function withdraw(uint256 _nftId) public {
    require(msg.sender == ownerOf(_nftId), "msg sender must be nft owner");
    uint256 reward = nftIdToRewards[_nftId];
    require(reward > 0, "reward must be more than 0");
    nftIdToRewards[_nftId] = 0;
    payable(msg.sender).transfer(reward);
  }
}
