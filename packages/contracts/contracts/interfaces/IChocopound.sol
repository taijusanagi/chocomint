// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IChocopound {
  function ipfsHashes(uint256 tokenId) external view returns (bytes32);
}
