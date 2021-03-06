// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

// created by Taiju Sanagi (taijusanagi.eth)

contract ChocomintUtils {
  function _getChainId() internal pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return id;
  }

  function _addSha256FunctionCodePrefix(bytes32 input) internal pure returns (bytes memory) {
    return abi.encodePacked(hex"1220", input);
  }

  function _bytesToBase58(bytes memory input) internal pure returns (bytes memory) {
    bytes memory alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    uint8[] memory digits = new uint8[](46);
    bytes memory output = new bytes(46);
    digits[0] = 0;
    uint8 digitlength = 1;
    for (uint256 i = 0; i < input.length; ++i) {
      uint256 carry = uint8(input[i]);
      for (uint256 j = 0; j < digitlength; ++j) {
        carry += uint256(digits[j]) * 256;
        digits[j] = uint8(carry % 58);
        carry = carry / 58;
      }
      while (carry > 0) {
        digits[digitlength] = uint8(carry % 58);
        digitlength++;
        carry = carry / 58;
      }
    }
    for (uint256 k = 0; k < digitlength; k++) {
      output[k] = alphabet[digits[digitlength - 1 - k]];
    }
    return output;
  }

  function _addIpfsBaseUrlPrefix(bytes memory input) internal pure returns (bytes memory) {
    return abi.encodePacked("ipfs://", input);
  }
}