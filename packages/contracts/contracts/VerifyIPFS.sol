// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

contract IPFS {
  bytes constant prefix1 = hex"0a";
  bytes constant prefix2 = hex"080212";
  bytes constant postfix = hex"18";

  bytes sha256MultiHash = hex"1220";
  bytes ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  function getCid(string memory content) public view returns (string memory) {
    bytes memory input = bytes(content);
    bytes memory len = lengthEncode(input.length);
    bytes memory len2 = lengthEncode(input.length + 4 + 2 * len.length);
    bytes memory source =
      abi.encodePacked(
        sha256MultiHash,
        abi.encodePacked(
          sha256(
            abi.encodePacked(prefix1, len2, prefix2, len, input, postfix, len)
          )
        )
      );
    uint8[] memory digits = new uint8[](255);
    bytes memory output = new bytes(255);
    digits[0] = 0;
    uint8 digitlength = 1;
    for (uint256 i = 0; i < source.length; ++i) {
      uint256 carry = uint8(source[i]);
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
      output[k] = ALPHABET[digits[digitlength - 1 - k]];
    }
    return string(output);
  }

  function lengthEncode(uint256 length) private view returns (bytes memory) {
    if (length < 128) {
      return to_binary(length);
    } else {
      return
        abi.encodePacked(
          to_binary((length % 128) + 128),
          to_binary(length / 128)
        );
    }
  }

  function to_binary(uint256 x) public view returns (bytes memory) {
    if (x == 0) {
      return new bytes(0);
    } else {
      bytes1 s = bytes1(uint8(x % 256));
      bytes memory r = new bytes(1);
      r[0] = s;
      return abi.encodePacked(to_binary(x / 256), r);
    }
  }
}
